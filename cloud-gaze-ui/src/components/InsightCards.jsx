import React from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

// Forecast Card — shows ML Linear Regression prediction
export function ForecastCard({ forecast }) {
  if (!forecast) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">ML Forecast — Next Month</p>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">
          ${forecast.predicted_cost.toLocaleString()}
        </span>
        <span className={`flex items-center gap-1 text-sm font-medium pb-1 ${
          forecast.trend === 'increasing' ? 'text-red-500' :
          forecast.trend === 'decreasing' ? 'text-green-500' : 'text-slate-400'
        }`}>
          {forecast.trend === 'increasing' ? <TrendingUp size={15} /> :
           forecast.trend === 'decreasing' ? <TrendingDown size={15} /> :
           <Minus size={15} />}
          {forecast.change_pct > 0 ? '+' : ''}{forecast.change_pct}%
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        Based on {forecast.months_used} months · Last month ${forecast.last_month_cost.toLocaleString()}
      </p>
    </div>
  );
}

// AI Insights Card — shows AI-generated cost suggestions
export function AIInsightsCard({ aiInsights }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-indigo-400" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">AI Insights</p>
      </div>
      {!aiInsights ? (
        <p className="text-xs text-slate-400 animate-pulse">Generating insights...</p>
      ) : aiInsights.available ? (
        <ul className="space-y-2">
          {aiInsights.insights.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="text-indigo-400 font-bold mt-0.5">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-amber-500">
          Add AI_API_KEY to .env to enable AI suggestions.
        </p>
      )}
    </div>
  );
}
