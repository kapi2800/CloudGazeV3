import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression


def analyze_cost_anomalies(df):
    """
    Detects days where spending was abnormally high using Z-Score method.
    Z-Score = how many standard deviations a value is from the rolling average.
    Threshold lowered to 1.5 so we catch more meaningful spikes.
    """
    if df is None or df.empty:
        return []

    df['date'] = pd.to_datetime(df['date'])
    daily_cost = df.groupby('date')['cost_usd'].sum().reset_index().sort_values('date')

    if len(daily_cost) < 7:
        return []

    # 7-day rolling mean + std
    daily_cost['rolling_mean'] = daily_cost['cost_usd'].rolling(window=7, min_periods=1).mean()
    daily_cost['rolling_std']  = daily_cost['cost_usd'].rolling(window=7, min_periods=1).std().fillna(1e-5)

    # Z-Score: how far is today's cost from the 7-day average?
    daily_cost['z_score'] = (daily_cost['cost_usd'] - daily_cost['rolling_mean']) / daily_cost['rolling_std']

    # Flag anything beyond 1.5 standard deviations (catches more anomalies than strict 2.0)
    anomalies = daily_cost[daily_cost['z_score'] > 1.5]

    results = []
    for _, row in anomalies.iterrows():
        results.append({
            "date": row['date'].strftime('%Y-%m-%d'),
            "cost_usd": round(row['cost_usd'], 2),
            "expected_cost": round(row['rolling_mean'], 2),
            "z_score": round(row['z_score'], 2),
            "severity": "CRITICAL" if row['z_score'] > 3.0 else "WARNING",
        })

    return sorted(results, key=lambda x: x['z_score'], reverse=True)[:10]  # Top 10 worst


def forecast_next_month(df):
    """
    Predicts next month's total cloud spend using Linear Regression on monthly totals.
    Simple, explainable, and runs in milliseconds.

    Examiner explanation:
    'We aggregate historical costs by month, number each month 0, 1, 2...
    then fit a straight line (y = mx + c) through the data using scikit-learn.
    The model extrapolates that line one step forward to predict next month's cost.'
    """
    if df is None or df.empty:
        return None

    try:
        df['date'] = pd.to_datetime(df['date'])

        # Aggregate to monthly totals
        monthly = df.groupby(df['date'].dt.to_period('M'))['cost_usd'].sum().reset_index()
        monthly.columns = ['month', 'total_cost']
        monthly = monthly.sort_values('month')

        if len(monthly) < 3:  # Need at least 3 months to draw a meaningful line
            return None

        # X = month index (0, 1, 2, ...), Y = total cost
        X = np.arange(len(monthly)).reshape(-1, 1)
        y = monthly['total_cost'].values

        model = LinearRegression()
        model.fit(X, y)

        # Predict the NEXT month (index = len)
        next_idx = np.array([[len(monthly)]])
        predicted = float(model.predict(next_idx)[0])
        predicted = max(0, predicted)  # cost can't be negative

        # Trend direction based on slope
        slope = model.coef_[0]
        if slope > 5:
            trend = "increasing"
        elif slope < -5:
            trend = "decreasing"
        else:
            trend = "stable"

        last_month_cost = float(monthly['total_cost'].iloc[-1])
        change_pct = ((predicted - last_month_cost) / last_month_cost * 100) if last_month_cost > 0 else 0

        return {
            "predicted_cost": round(predicted, 2),
            "last_month_cost": round(last_month_cost, 2),
            "change_pct": round(change_pct, 1),
            "trend": trend,
            "months_used": len(monthly),
        }

    except Exception as e:
        print(f"Forecast error: {e}")
        return None
