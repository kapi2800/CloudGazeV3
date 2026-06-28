import os
import json
import boto3
import pandas as pd
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from botocore.exceptions import ClientError, NoCredentialsError

load_dotenv(override=True)

CREDS_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')

def _load_aws_from_file():
    """Read AWS keys from credentials.json (saved via the UI credentials screen)."""
    try:
        if os.path.exists(CREDS_FILE):
            data = json.loads(open(CREDS_FILE).read())
            aws = data.get('aws')
            if aws:
                return aws.get('keyId', ''), aws.get('secret', '')
    except Exception:
        pass
    return '', ''

def fetch_aws_cost_data(months_back=12):
    # Priority: credentials.json (UI-saved) → .env
    file_key, file_secret = _load_aws_from_file()
    access_key = file_key or os.getenv("AWS_ACCESS_KEY_ID", "")
    secret_key = file_secret or os.getenv("AWS_SECRET_ACCESS_KEY", "")

    # Placeholder check
    if not access_key or access_key.startswith("paste_"):
        print("AWS Connector: No valid credentials in .env — skipping.")
        return pd.DataFrame(), {"connected": False, "source": "no_credentials"}

    # Build date range — timezone-aware UTC
    end_date = datetime.now(timezone.utc).date()
    start_date = (datetime.now(timezone.utc) - timedelta(days=months_back * 30)).date()

    status = {
        "connected": False,
        "source": "aws_cost_explorer",
        "start_date": str(start_date),
        "end_date": str(end_date),
        "total_cost_usd": 0.0,
        "record_count": 0,
        "error": None,
    }

    try:
        client = boto3.client(
            "ce",
            region_name="us-east-1",          # Cost Explorer is global but must be us-east-1
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        )

        response = client.get_cost_and_usage(
            TimePeriod={
                "Start": str(start_date),
                "End": str(end_date),
            },
            Granularity="MONTHLY",
            Metrics=["UnblendedCost"],
            GroupBy=[
                {"Type": "DIMENSION", "Key": "SERVICE"},
                {"Type": "DIMENSION", "Key": "REGION"},
            ],
        )

        records = []
        results = response.get("ResultsByTime", [])

        for period in results:
            period_start = period["TimePeriod"]["Start"]   # e.g. "2025-04-01"
            groups = period.get("Groups", [])

            # If there are no groups (zero spend month), still add a zero record
            if not groups:
                records.append({
                    "date": period_start,
                    "service": "No Usage",
                    "region": "global",
                    "team": "AWS Live",
                    "env": "prod",
                    "cost_usd": 0.0,
                    "cloud_provider": "AWS",
                    "resource_id": "aws-account",
                })
                continue

            for group in groups:
                service_name = group["Keys"][0]
                region = group["Keys"][1] if len(group["Keys"]) > 1 else "global"
                amount = float(group["Metrics"]["UnblendedCost"]["Amount"])

                records.append({
                    "date": period_start,
                    "service": service_name,
                    "region": region,
                    "team": "AWS Live",
                    "env": "prod",
                    "cost_usd": round(amount, 6),
                    "cloud_provider": "AWS",
                    "resource_id": "aws-account",
                })

        df = pd.DataFrame(records) if records else pd.DataFrame()

        total = df["cost_usd"].sum() if not df.empty else 0.0
        status["connected"] = True
        status["total_cost_usd"] = round(total, 4)
        status["record_count"] = len(df)

        print(f"AWS Connector: ✅ Fetched {len(df)} records | Total: ${total:.4f}")
        return df, status

    except ClientError as e:
        code = e.response["Error"]["Code"]
        msg = e.response["Error"]["Message"]
        print(f"AWS Connector: ClientError [{code}] — {msg}")
        status["error"] = f"{code}: {msg}"
        return pd.DataFrame(), status

    except NoCredentialsError:
        print("AWS Connector: No credentials found.")
        status["error"] = "NoCredentialsError"
        return pd.DataFrame(), status

    except Exception as e:
        print(f"AWS Connector: Unexpected error — {e}")
        status["error"] = str(e)
        return pd.DataFrame(), status


# ── Local test ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    df, status = fetch_aws_cost_data()
    print("\n=== AWS Status ===")
    for k, v in status.items():
        print(f"  {k}: {v}")
    print("\n=== Data (first 10 rows) ===")
    if not df.empty:
        print(df.to_string(index=False))
    else:
        print("  No records returned.")
