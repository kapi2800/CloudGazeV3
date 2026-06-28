import React from 'react';
import { Bell, Wifi, WifiOff } from 'lucide-react';

// Anomaly Banner — shows the worst detected anomaly at top of dashboard
export function AnomalyBanner({ anomalies }) {
  if (!anomalies || anomalies.length === 0) return null;

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-4 animate-in slide-in-from-top-4">
      <div className="bg-red-100 dark:bg-red-500/20 p-2 rounded-lg text-red-600 dark:text-red-400">
        <Bell size={20} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-red-800 dark:text-red-300">ML Anomaly Detected</h3>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          Z-Score analysis flagged abnormal spending on {anomalies[0].date}.
          Actual cost (${anomalies[0].cost_usd}) is significantly higher than the rolling average expected (${anomalies[0].expected_cost}).
        </p>
      </div>
    </div>
  );
}

// Source Badges — shows live/demo status per provider (reads from API response)
export function SourceBadges({ dataSources }) {
  const badges = [
    { key: 'aws', label: 'AWS' },
    { key: 'gcp', label: 'GCP' },
  ];

  return (
    <div className="flex items-center gap-2">
      {badges.map(({ key, label }) => {
        const isLive = dataSources[key] === 'live';
        return (
          <span
            key={key}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
              isLive
                ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                : 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
            }`}
          >
            {isLive ? <Wifi size={11} /> : <WifiOff size={11} />}
            {label} {isLive ? 'Live' : 'Demo'}
          </span>
        );
      })}
    </div>
  );
}

