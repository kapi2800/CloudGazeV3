import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Cloud, Server, Activity } from 'lucide-react';
import { startOfMonth, subMonths, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

// Animated number that counts up from 0 to target over ~900ms
function useCountUp(target, duration = 900) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (typeof target !== 'number' || isNaN(target)) return;
    const start = performance.now();
    const from = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

const Sparkline = ({ data, color }) => (
  <div className="h-10 w-24 opacity-50">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

//  Helper to get theme-aware colors
const getColorClasses = (color) => {
  const map = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      text: 'text-indigo-600 dark:text-indigo-400',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-500/10',
      text: 'text-orange-600 dark:text-orange-400',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
    }
  };
  return map[color] || map.indigo;
};

const KPICard = ({ title, rawValue, prefix = '', suffix = '', icon: Icon, themeColor, trend, trendValue }) => {
  const animated = useCountUp(rawValue);
  const isCostIncrease = trend === 'up';

  const trendClasses = isCostIncrease
    ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
    : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';

  const TrendIcon = isCostIncrease ? ArrowUpRight : ArrowDownRight;
  const sparkColor = isCostIncrease ? '#e11d48' : '#10b981';
  const { bg: iconBg, text: iconText } = getColorClasses(themeColor);

  // Format the animated number
  const displayValue = prefix + Math.round(animated).toLocaleString() + suffix;

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${iconBg} ${iconText}`}>
          <Icon size={20} />
        </div>
        {trendValue !== 'N/A' && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border ${trendClasses}`}>
            <TrendIcon size={12} />
            {Math.abs(trendValue)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">{title}</h3>
        <div className="flex justify-between items-end">
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{displayValue}</div>
          <Sparkline data={Array.from({ length: 10 }, () => ({ value: Math.random() * 100 }))} color={sparkColor} />
        </div>
      </div>
    </div>
  );
};

const KPIStats = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.cost_usd, 0);
  const aws = data.filter(d => d.cloud_provider === 'AWS').reduce((acc, curr) => acc + curr.cost_usd, 0);
  const gcp = data.filter(d => d.cloud_provider === 'GCP').reduce((acc, curr) => acc + curr.cost_usd, 0);

  // Smart Trend Logic
  const calculateTrend = (providerFilter = null) => {
    if (data.length === 0) return { dir: 'neutral', val: 'N/A' };

    const dates = data.map(d => new Date(d.date).getTime());
    const maxDate = new Date(Math.max(...dates));
    
    const currentMonthStart = startOfMonth(maxDate);
    const prevMonthStart = startOfMonth(subMonths(maxDate, 1));
    const prevMonthEnd = endOfMonth(subMonths(maxDate, 1));

    const currentMonthData = data.filter(d => {
      const date = parseISO(d.date);
      const isTime = isWithinInterval(date, { start: currentMonthStart, end: maxDate });
      return providerFilter ? isTime && d.cloud_provider === providerFilter : isTime;
    });

    const prevMonthData = data.filter(d => {
      const date = parseISO(d.date);
      const isTime = isWithinInterval(date, { start: prevMonthStart, end: prevMonthEnd });
      return providerFilter ? isTime && d.cloud_provider === providerFilter : isTime;
    });

    const currSum = currentMonthData.reduce((acc, curr) => acc + curr.cost_usd, 0);
    const prevSum = prevMonthData.reduce((acc, curr) => acc + curr.cost_usd, 0);

    if (prevSum === 0) return { dir: 'neutral', val: 'N/A' };

    const percentChange = ((currSum - prevSum) / prevSum) * 100;
    
    return {
      dir: percentChange >= 0 ? 'up' : 'down',
      val: percentChange.toFixed(1)
    };
  };

  const totalTrend = useMemo(() => calculateTrend(), [data]);
  const awsTrend = useMemo(() => calculateTrend('AWS'), [data]);
  const gcpTrend = useMemo(() => calculateTrend('GCP'), [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <KPICard title="Total Spend"    rawValue={total} prefix="$" icon={DollarSign} themeColor="indigo"  trend={totalTrend.dir} trendValue={totalTrend.val} />
      <KPICard title="AWS Spend"      rawValue={aws}   prefix="$" icon={Cloud}       themeColor="orange"  trend={awsTrend.dir}   trendValue={awsTrend.val} />
      <KPICard title="GCP Spend"      rawValue={gcp}   prefix="$" icon={Server}      themeColor="blue"    trend={gcpTrend.dir}   trendValue={gcpTrend.val} />
      <KPICard title="Transactions"   rawValue={data.length} icon={Activity} themeColor="emerald" trend="up" trendValue="N/A" />
    </div>
  );
};

export default KPIStats;