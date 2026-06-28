import os
import json
import pandas as pd
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

try:
    from google.cloud import bigquery
    from google.oauth2 import service_account
    import google.auth
except ImportError:
    pass

load_dotenv(override=True)

CREDS_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')

def _get_gcp_credentials():
    """Try to load GCP JSON from credentials.json, else rely on ADC."""
    try:
        if os.path.exists(CREDS_FILE):
            with open(CREDS_FILE, 'r') as f:
                data = json.load(f)
                gcp = data.get('gcp')
                if gcp and gcp.get('json'):
                    creds_info = json.loads(gcp['json'])
                    return service_account.Credentials.from_service_account_info(creds_info)
    except Exception as e:
        print(f"Error reading GCP credentials.json: {e}")
    
    # If no JSON key found, return None. The BigQuery client will automatically 
    # look for Application Default Credentials (ADC) from `gcloud auth application-default login`.
    return None

def fetch_gcp_cost_data(months_back=12):
    """
    Connects to BigQuery to fetch live GCP billing data.
    Will automatically use `gcloud` local credentials if no JSON key is provided in the dashboard.
    """
    status = {
        "connected": False,
        "source": "gcp_bigquery",
        "error": None,
        "total_cost_usd": 0.0,
        "record_count": 0
    }

    # You need to specify your Google Cloud Project ID and the BigQuery Dataset name
    # where the billing export is going. You can set these in the .env file.
    project_id = os.getenv("GCP_PROJECT_ID")
    dataset_name = os.getenv("GCP_BILLING_DATASET")

    if not project_id or not dataset_name:
        status["error"] = "GCP_PROJECT_ID or GCP_BILLING_DATASET not set in .env"
        return pd.DataFrame(), status

    # The table name usually starts with 'gcp_billing_export_v1_'
    # Replace this if your table name is different.
    table_id = f"{project_id}.{dataset_name}.gcp_billing_export_v1_*"

    try:
        creds = _get_gcp_credentials()
        
        if creds:
            client = bigquery.Client(credentials=creds, project=project_id)
            print("GCP Connector: Using JSON Key from dashboard.")
        else:
            # Uses ADC (Application Default Credentials)
            credentials, default_project_id = google.auth.default()
            client = bigquery.Client(credentials=credentials, project=project_id)
            print("GCP Connector: Using Application Default Credentials (gcloud CLI).")

        # Build date range — use timezone-aware UTC datetime
        start_date = (datetime.now(timezone.utc) - timedelta(days=months_back * 30)).strftime('%Y-%m-%d')
        
        # Standard query to aggregate costs daily by service
        query = f"""
            SELECT
              DATE(usage_start_time) as date,
              service.description as service,
              location.region as region,
              project.id as resource_id,
              SUM(cost) as cost_usd
            FROM
              `{table_id}`
            WHERE
              DATE(usage_start_time) >= DATE('{start_date}')
            GROUP BY
              1, 2, 3, 4
            ORDER BY
              date DESC
        """

        query_job = client.query(query)
        df = query_job.to_dataframe()

        if not df.empty:
            # Map columns to match our unified schema
            df['cloud_provider'] = 'GCP'
            df['team'] = 'GCP Live'
            df['env'] = 'prod'
            df['region'] = df['region'].fillna('global')

            status["connected"] = True
            status["record_count"] = len(df)
            status["total_cost_usd"] = round(df['cost_usd'].sum(), 2)
            print(f"GCP Connector: ✅ Fetched {len(df)} records | Total: ${status['total_cost_usd']}")
        else:
            # Query ran successfully — BigQuery is connected.
            # Empty result just means the daily billing export hasn't populated yet (normal for new setups).
            status["connected"] = True
            print("GCP Connector: Connected to BigQuery. No billing data yet — export may still be populating.")

        return df, status

    except Exception as e:
        print(f"GCP Connector Error: {e}")
        status["error"] = str(e)
        return pd.DataFrame(), status

if __name__ == "__main__":
    df, status = fetch_gcp_cost_data()
    print("\n=== GCP Status ===")
    print(status)
    if not df.empty:
        print("\n=== Data preview ===")
        print(df.head())
