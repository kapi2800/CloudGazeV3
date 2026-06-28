import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Base configuration
end_date = datetime.now()
start_date = end_date - timedelta(days=365)
date_range = pd.date_range(start_date, end_date, freq='D')

# AWS Services & Params: (Service, Region, Team, Env, Base Cost, Noise)
aws_services = [
    ("Amazon Elastic Compute Cloud - Compute", "us-east-1", "Backend", "prod", 45.0, 5.0),
    ("Amazon Elastic Compute Cloud - Compute", "us-east-1", "Backend", "staging", 15.0, 2.0),
    ("Amazon Relational Database Service", "us-east-1", "Database", "prod", 35.0, 2.0),
    ("Amazon Relational Database Service", "us-east-1", "Database", "dev", 8.0, 1.0),
    ("Amazon Simple Storage Service", "us-west-2", "Data", "prod", 12.0, 1.5),
    ("Amazon CloudFront", "global", "Frontend", "prod", 18.0, 3.0),
    ("Amazon CloudFront", "global", "Frontend", "staging", 5.0, 1.0),
    ("Amazon DynamoDB", "us-east-1", "Backend", "prod", 22.0, 2.5)
]

aws_records = []
for d in date_range:
    for service, region, team, env, base_cost, noise in aws_services:
        trend = (d - start_date).days * 0.02 if env == "prod" else (d - start_date).days * 0.005
        cost = max(0, np.random.normal(base_cost + trend, noise))
        
        # Inject ONLY ONE massive anomaly: Huge spike in EC2 3 days ago in PROD
        if service == "Amazon Elastic Compute Cloud - Compute" and env == "prod" and (end_date - d).days == 3:
            cost += 450.0  
            
        aws_records.append({
            "date": d.strftime("%Y-%m-%d"),
            "service": service,
            "region": region,
            "team": team,
            "env": env,
            "cost_usd": round(cost, 2),
            "account_id": "847291038472"
        })

# GCP Services & Params
gcp_services = [
    ("Compute Engine", "us-central1", "Backend", "prod", 40.0, 4.0),
    ("Compute Engine", "us-central1", "Backend", "dev", 12.0, 2.0),
    ("Cloud SQL", "us-central1", "Database", "prod", 50.0, 2.0),
    ("Cloud SQL", "us-central1", "Database", "staging", 20.0, 1.5),
    ("Cloud Storage", "us-central1", "Data", "prod", 15.0, 1.0),
    ("Kubernetes Engine", "europe-west1", "DevOps", "prod", 60.0, 6.0),
    ("Kubernetes Engine", "europe-west1", "DevOps", "staging", 25.0, 3.0),
    ("BigQuery", "us-central1", "Data", "prod", 25.0, 8.0)
]

gcp_records = []
for d in date_range:
    for service, region, team, env, base_cost, noise in gcp_services:
        trend = (d - start_date).days * 0.015 if env == "prod" else (d - start_date).days * 0.005
        cost = max(0, np.random.normal(base_cost + trend, noise))
            
        gcp_records.append({
            "date": d.strftime("%Y-%m-%d"),
            "service": service,
            "region": region,
            "team": team,
            "env": env,
            "cost_usd": round(cost, 2),
            "project_id": "cloudgaze-prod-99"
        })

aws_df = pd.DataFrame(aws_records)
gcp_df = pd.DataFrame(gcp_records)

aws_df.to_csv('./data/aws_line_items_12mo.csv', index=False)
gcp_df.to_csv('./data/gcp_billing_12mo.csv', index=False)

print("Successfully added dev and staging data!")
