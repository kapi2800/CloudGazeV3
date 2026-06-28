import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { format, parseISO } from 'date-fns';

const ChartsSection = ({ data, isDarkMode }) => {
  // ── Daily trend data ────────────────────────────────────────────────────────
  const dailyData = data.reduce((acc, curr) => {
    const existing = acc.find(i => i.date === curr.date);
    if (existing) existing.cost += curr.cost_usd;
    else acc.push({ date: curr.date, cost: curr.cost_usd });
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date));

  // ── Top 5 services ──────────────────────────────────────────────────────────
  const serviceDataMap = data.reduce((acc, curr) => {
    acc[curr.service] = (acc[curr.service] || 0) + curr.cost_usd;
    return acc;
  }, {});
  const serviceData = Object.keys(serviceDataMap)
    .map(k => ({ name: k, value: serviceDataMap[k] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // ── Provider split for donut ─────────────────────────────────────────────────
  const providerMap = data.reduce((acc, curr) => {
    acc[curr.cloud_provider] = (acc[curr.cloud_provider] || 0) + curr.cost_usd;
    return acc;
  }, {});
  const providerData = Object.keys(providerMap).map(k => ({
    name: k,
    value: Math.round(providerMap[k]),
  }));

  // ── Theme colors ─────────────────────────────────────────────────────────────
  const BAR_COLORS     = ['#4f46e5', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];
  const DONUT_COLORS   = ['#f97316', '#6366f1', '#10b981', '#ec4899'];
  const gridColor      = isDarkMode ? '#334155' : '#e2e8f0';
  const axisColor      = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg      = isDarkMode ? '#1e293b' : '#ffffff';
  const tooltipBorder  = isDarkMode ? '#334155' : '#e2e8f0';
  const cardBg         = 'bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm transition-colors duration-300';

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder }} className="border p-3 rounded-lg shadow-lg">
          {label && <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">{label}</p>}
          <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            ${Number(payload[0].value).toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const DonutLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Row 1: Area chart (wide) + Donut (narrow) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend Trend — takes 2/3 width */}
        <div className={`lg:col-span-2 ${cardBg}`}>
          <h3 className="text-slate-800 dark:text-white font-bold mb-6">Monthly Spend Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="date" tickFormatter={s => format(parseISO(s), 'MMM d')} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${v}`} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="cost" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCost)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Provider Split Donut — 1/3 width */}
        <div className={cardBg}>
          <h3 className="text-slate-800 dark:text-white font-bold mb-4">Spend by Provider</h3>
          <div className="h-64 w-full flex flex-col items-center justify-center">
            {providerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerData}
                    cx="50%" cy="45%"
                    innerRadius={55} outerRadius={90}
                    dataKey="value"
                    labelLine={false}
                    label={<DonutLabel />}
                    animationBegin={0}
                    animationDuration={900}
                  >
                    {providerData.map((entry, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle" iconSize={8}
                    formatter={(value) => <span style={{ color: axisColor, fontSize: 12 }}>{value}</span>}
                  />
                  <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Spend']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-sm">No data</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Top 5 Services bar chart full width */}
      <div className={cardBg}>
        <h3 className="text-slate-800 dark:text-white font-bold mb-6">Top 5 Services by Cost</h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviceData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke={gridColor} />
              <XAxis type="number" tickFormatter={v => `$${v.toLocaleString()}`} tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fill: axisColor, fontSize: 11, fontWeight: 500 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: isDarkMode ? '#334155' : '#f1f5f9' }} content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} animationDuration={900}>
                {serviceData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;