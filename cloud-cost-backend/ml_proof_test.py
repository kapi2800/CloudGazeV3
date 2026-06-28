"""
ML Proof Script — Run this to demonstrate anomaly detection & forecasting.
This is a standalone test. It does NOT affect the dashboard or real data.

Usage:
  cd Dashboard/cloud-cost-backend
  source venv/bin/activate
  python3 ml_proof_test.py
"""
import pandas as pd
from ml_engine import analyze_cost_anomalies, forecast_next_month

DIVIDER = "=" * 60

# ── Test 1: Clean data (no anomalies expected) ─────────────────────────────
print(DIVIDER)
print("TEST 1: CLEAN DATA — Stable $100/day spending")
print(DIVIDER)

df_clean = pd.read_csv('./data/ml_test_NO_anomaly.csv')
df_clean['cloud_provider'] = 'AWS'
df_clean['resource_id'] = 'test'

anomalies_clean = analyze_cost_anomalies(df_clean.copy())
forecast_clean  = forecast_next_month(df_clean.copy())

print(f"\n  Daily costs: all around $98-105 (no spikes)")
print(f"  Anomalies found: {len(anomalies_clean)}")

if len(anomalies_clean) == 0:
    print("  ✅ CORRECT — No anomalies detected in stable data")
else:
    print("  ⚠️  Unexpected — anomalies found in clean data:")
    for a in anomalies_clean:
        print(f"     {a['date']} → ${a['cost_usd']} (z={a['z_score']})")

if forecast_clean:
    print(f"\n  Forecast: ${forecast_clean['predicted_cost']} (trend: {forecast_clean['trend']})")
else:
    print("\n  Forecast: Not enough months")


# ── Test 2: Spiked data (anomalies expected) ───────────────────────────────
print(f"\n{DIVIDER}")
print("TEST 2: SPIKED DATA — Same data but $450 on Jan 12, $520 on Jan 20")
print(DIVIDER)

df_spike = pd.read_csv('./data/ml_test_WITH_anomaly.csv')
df_spike['cloud_provider'] = 'AWS'
df_spike['resource_id'] = 'test'

anomalies_spike = analyze_cost_anomalies(df_spike.copy())
forecast_spike  = forecast_next_month(df_spike.copy())

print(f"\n  Daily costs: ~$100, EXCEPT Jan 12 ($450) and Jan 20 ($520)")
print(f"  Anomalies found: {len(anomalies_spike)}")

if len(anomalies_spike) > 0:
    print("  ✅ CORRECT — ML caught the spending spikes:\n")
    for a in anomalies_spike:
        severity_color = "🔴" if a['severity'] == 'CRITICAL' else "🟡"
        print(f"     {severity_color} {a['date']} → Actual: ${a['cost_usd']}  Expected: ${a['expected_cost']}  Z-Score: {a['z_score']}  [{a['severity']}]")
else:
    print("  ❌ FAILED — Should have detected spikes but didn't")

if forecast_spike:
    print(f"\n  Forecast: ${forecast_spike['predicted_cost']} (trend: {forecast_spike['trend']})")


# ── Summary ─────────────────────────────────────────────────────────────────
print(f"\n{DIVIDER}")
print("SUMMARY")
print(DIVIDER)
print(f"  Clean data anomalies:  {len(anomalies_clean)} (expected: 0)")
print(f"  Spiked data anomalies: {len(anomalies_spike)} (expected: 2+)")
print()

if len(anomalies_clean) == 0 and len(anomalies_spike) >= 2:
    print("  ✅ ML IS WORKING CORRECTLY")
    print("     - Stable spending → no false alarms")
    print("     - Cost spikes → detected and flagged")
    print()
    print("  HOW IT WORKS:")
    print("     1. Group daily costs")
    print("     2. Calculate 7-day rolling average + standard deviation")
    print("     3. Z-Score = (actual - average) / std_deviation")
    print("     4. If Z > 1.5 → WARNING, if Z > 3.0 → CRITICAL")
    print("     5. Normal costs have Z ≈ 0, spikes have Z >> 1.5")
else:
    print("  ⚠️  Something unexpected — check the data files")
