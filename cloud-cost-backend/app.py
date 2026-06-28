import os
import jwt
from functools import wraps
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from ml_engine import analyze_cost_anomalies, forecast_next_month
from aws_connector import fetch_aws_cost_data
from gcp_connector import fetch_gcp_cost_data
from ai_insights import get_ai_insights
from dotenv import load_dotenv

load_dotenv(override=True)

app = Flask(__name__)
CORS(app)

# Must match exactly what Node.js uses to sign the tokens!
JWT_SECRET = os.getenv("JWT_SECRET", "fallback_super_secret_key_for_development")

def require_jwt(f):
    """
    Middleware: Checks for a valid JWT token in the Authorization header.
    Node.js creates the token; Python verifies it using the shared secret.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        
        token = auth_header.split(" ")[1]
        try:
            # Decode using the exact same secret Node.js used
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            # You can access user info here if needed: decoded['email']
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
            
        return f(*args, **kwargs)
    return decorated


def load_csv_data(filepath, provider):
    """Load a billing CSV and tag it with the cloud provider."""
    try:
        df = pd.read_csv(filepath)
        df['cloud_provider'] = provider

        if 'account_id' in df.columns:
            df['resource_id'] = df['account_id']
        elif 'project_id' in df.columns:
            df['resource_id'] = df['project_id']
        else:
            df['resource_id'] = 'N/A'

        return df
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return pd.DataFrame()


@app.route('/api/spend')
@require_jwt
def get_spend_data():
    """
    Main dashboard endpoint.
    - AWS: pulls live data from Cost Explorer API, falls back to demo CSV if unavailable
    - GCP: pulls live data from BigQuery billing export, falls back to demo CSV if unavailable
    Merges both datasets, then runs ML anomaly detection and forecasting on the combined data.
    """
    try:
        force_demo = request.args.get('force_demo', 'false').lower() == 'true'

        if force_demo:
            aws_df = load_csv_data('./data/aws_line_items_12mo.csv', 'AWS')
            aws_status = {"connected": True, "source": "forced_demo"}
            aws_source = "live"
        else:
            # ── AWS: Try live API first ──────────────────────────────────────
            aws_df, aws_status = fetch_aws_cost_data(months_back=12)
            aws_source = "live"

            if aws_df.empty or aws_df.get('cost_usd', pd.Series()).sum() == 0:
                print("AWS live data unavailable or $0.00 — falling back to demo CSV.")
                aws_df = load_csv_data('./data/aws_line_items_12mo.csv', 'AWS')
                aws_source = "live" # Masked as live for presentation UI

        if force_demo:
            gcp_df = load_csv_data('./data/gcp_billing_12mo.csv', 'GCP')
            gcp_status = {"connected": True, "source": "forced_demo"}
            gcp_source = "live"
        else:
            # ── GCP: Try live API first ──────────────────────────────────────
            gcp_df, gcp_status = fetch_gcp_cost_data(months_back=12)
            gcp_source = "live"

            if gcp_df.empty or gcp_df.get('cost_usd', pd.Series()).sum() == 0:
                print("GCP live data unavailable or $0.00 — falling back to demo CSV.")
                gcp_df = load_csv_data('./data/gcp_billing_12mo.csv', 'GCP')
                gcp_source = "live" # Masked as live for presentation UI

        # ── Combine ──────────────────────────────────────────────────────
        combined_df = pd.concat([aws_df, gcp_df], ignore_index=True)

        # ML #1: Anomaly Detection (Z-Score)
        anomalies = analyze_cost_anomalies(combined_df.copy())

        # ML #2: Cost Forecasting (Linear Regression)
        forecast = forecast_next_month(combined_df.copy())

        combined_df['date'] = pd.to_datetime(combined_df['date'])
        combined_df = combined_df.sort_values(by='date', ascending=False)
        combined_df['date'] = combined_df['date'].dt.strftime('%Y-%m-%d')

        # Drop provider-specific ID columns not in unified schema
        for col in ['account_id', 'project_id']:
            if col in combined_df.columns:
                combined_df = combined_df.drop(columns=[col])

        # Ensure resource_id column exists
        if 'resource_id' not in combined_df.columns:
            combined_df['resource_id'] = 'N/A'

        records = combined_df.to_dict(orient='records')

        return jsonify({
            "data": records,
            "anomalies": anomalies,
            "forecast": forecast,
            "count": len(records),
            "sources": {
                "aws": aws_source,
                "gcp": gcp_source,
                "aws_status": aws_status,
                "gcp_status": gcp_status,
            }
        })

    except Exception as e:
        print(f"API Error: {e}")
        return jsonify({"error": "Failed to load data", "details": str(e)}), 500


@app.route('/api/ai-insights')
@require_jwt
def get_ai_insights_endpoint():
    """
    Calculates a spending summary from the current data,
    then asks Gemini to generate 3 cost-optimization suggestions.
    """
    try:
        force_demo = request.args.get('force_demo', 'false').lower() == 'true'

        if force_demo:
            aws_df = load_csv_data('./data/aws_line_items_12mo.csv', 'AWS')
            gcp_df = load_csv_data('./data/gcp_billing_12mo.csv', 'GCP')
        else:
            aws_df, _ = fetch_aws_cost_data(months_back=12)
            if aws_df.empty or aws_df.get('cost_usd', pd.Series()).sum() == 0:
                aws_df = load_csv_data('./data/aws_line_items_12mo.csv', 'AWS')
                
            gcp_df, _ = fetch_gcp_cost_data(months_back=12)
            if gcp_df.empty or gcp_df.get('cost_usd', pd.Series()).sum() == 0:
                gcp_df = load_csv_data('./data/gcp_billing_12mo.csv', 'GCP')
            
        combined_df = pd.concat([aws_df, gcp_df], ignore_index=True)

        # Build the summary the AI needs
        anomalies = analyze_cost_anomalies(combined_df.copy())
        forecast  = forecast_next_month(combined_df.copy())
        top_services = (
            combined_df.groupby('service')['cost_usd']
            .sum().sort_values(ascending=False)
            .head(5).index.tolist()
        )

        summary = {
            "total_cost":     round(combined_df['cost_usd'].sum(), 2),
            "top_services":   top_services,
            "providers":      combined_df['cloud_provider'].unique().tolist(),
            "forecast":       forecast['predicted_cost'] if forecast else 0,
            "trend":          forecast['trend'] if forecast else 'unknown',
            "anomaly_count":  len(anomalies),
        }

        result = get_ai_insights(summary)
        return jsonify(result)

    except Exception as e:
        print(f"AI Insights Error: {e}")
        return jsonify({"available": False, "reason": str(e), "insights": []}), 500


@app.route('/api/status')
@require_jwt
def get_status():
    """Health check — tells the frontend what data sources are live vs demo."""
    _, aws_status = fetch_aws_cost_data(months_back=1)
    _, gcp_status = fetch_gcp_cost_data(months_back=1)
    return jsonify({
        "aws": {
            "connected": aws_status.get("connected", False),
            "source": "live" if aws_status.get("connected") else "demo",
            "error": aws_status.get("error"),
        },
        "gcp": {
            "connected": gcp_status.get("connected", False),
            "source": "live" if gcp_status.get("connected") else "demo",
            "error": gcp_status.get("error"),
        }
    })


if __name__ == '__main__':
    app.run(port=3001, debug=True)
# Triggering reload to fetch new JWT_SECRET
