import React, { useState, useEffect, useMemo } from 'react';
import { subDays, parseISO, isAfter, subMonths } from 'date-fns';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import ReportsView from './components/ReportsView';
import CloudCredentialsPage from './components/CloudCredentialsPage';

// Layout
import Sidebar from './components/Sidebar';
import DashboardHeader from './components/DashboardHeader';

// Dashboard widgets
import { AnomalyBanner, SourceBadges } from './components/StatusWidgets';
import { ForecastCard, AIInsightsCard } from './components/InsightCards';
import KPIStats from './components/KPIStats';
import PremiumFilters from './components/PremiumFilters';
import ChartsSection from './components/ChartsSection';
import EnterpriseTable from './components/EnterpriseTable';

// Overlays
import TransactionModal from './components/TransactionModal';
import SettingsModal from './components/SettingsModal';


function App() {
  const { isLoggedIn, authFetch, user, logout } = useAuth();

  const [data, setData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSources, setDataSources] = useState({ aws: 'demo', gcp: 'demo' });

  const [currentView, setCurrentView] = useState('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isCompact, setIsCompact] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [forceDemo, setForceDemo] = useState(true); // Default to true for presentation
  const [filters, setFilters] = useState({ provider: 'All', team: 'All', env: 'All', service: 'All' });
  const [dateRange, setDateRange] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const toggleCompact = () => setIsCompact(prev => !prev);

  useEffect(() => {
    if (!isLoggedIn) return;

    setLoading(true);
    authFetch(`http://localhost:3001/api/spend?force_demo=${forceDemo}`)
      .then(res => {
        if (res.status === 401) {
          logout();
          throw new Error('Unauthorized');
        }
        return res.json();
      })
      .then(result => {
        setData(result.data || []);
        setAnomalies(result.anomalies || []);
        setForecast(result.forecast || null);
        if (result.sources) {
          setDataSources({ aws: result.sources.aws || 'demo', gcp: result.sources.gcp || 'demo' });
        }
        setLoading(false);
        return authFetch(`http://localhost:3001/api/ai-insights?force_demo=${forceDemo}`);
      })
      .then(res => {
        if (res.status === 401) throw new Error('Unauthorized');
        return res.json();
      })
      .then(result => setAiInsights(result))
      .catch(err => {
        console.error('Fetch error:', err);
        setLoading(false);
      });
  }, [isLoggedIn, authFetch, logout, forceDemo]);

  const uniqueTeams = useMemo(() => ['All', ...new Set(data.map(item => item.team))].sort(), [data]);
  const uniqueServices = useMemo(() => ['All', ...new Set(data.map(item => item.service))].sort(), [data]);

  const filteredData = useMemo(() => {
    if (data.length === 0) return [];

    const dates = data.map(d => new Date(d.date).getTime());
    const maxDate = new Date(Math.max(...dates));

    let cutoffDate = null;
    if (dateRange === '30d') cutoffDate = subDays(maxDate, 30);
    if (dateRange === '90d') cutoffDate = subDays(maxDate, 90);
    if (dateRange === '6m') cutoffDate = subMonths(maxDate, 6);
    if (dateRange === '1y') cutoffDate = subMonths(maxDate, 12);

    const searchLower = searchTerm.toLowerCase().trim();

    return data.filter(item => {
      const matchProvider = filters.provider === 'All' || item.cloud_provider === filters.provider;
      const matchTeam = filters.team === 'All' || item.team === filters.team;
      const matchEnv = filters.env === 'All' || item.env === filters.env;
      const matchService = filters.service === 'All' || item.service === filters.service;

      let matchDate = true;
      if (cutoffDate) matchDate = isAfter(parseISO(item.date), cutoffDate);

      let matchSearch = true;
      if (searchLower) {
        const rowString = `${item.cloud_provider} ${item.service} ${item.team} ${item.env} ${item.resource_id}`.toLowerCase();
        matchSearch = rowString.includes(searchLower);
      }

      return matchProvider && matchTeam && matchEnv && matchService && matchDate && matchSearch;
    });
  }, [data, filters, dateRange, searchTerm]);

  if (!isLoggedIn) {
    if (showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
    return <LandingPage onLoginClick={() => setShowLogin(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0E14] text-slate-900 dark:text-slate-200 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-500/30 transition-colors duration-300">

      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={user}
      />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        <DashboardHeader
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          isDarkMode={isDarkMode} toggleTheme={toggleTheme}
          showNotifications={showNotifications} setShowNotifications={setShowNotifications}
          user={user} logout={logout}
        />

        <main className="flex-1 p-8 overflow-y-auto" onClick={() => setShowNotifications(false)}>
          <div className="max-w-7xl mx-auto space-y-8">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {currentView === 'dashboard' ? (
                  <>
                    {/* Page Title + Source Badges */}
                    <div className="flex justify-between items-end">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Cloud Cost Overview</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Track and optimize your infrastructure spending.</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={() => setForceDemo(!forceDemo)}
                          className={`text-xs px-3 py-1 font-medium transition-colors rounded-full border ${forceDemo ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}
                        >
                          {forceDemo ? ' Mode: ON' : 'Mode: OFF'}
                        </button>
                        <SourceBadges dataSources={dataSources} />
                      </div>
                    </div>

                    <AnomalyBanner anomalies={anomalies} />

                    {/* Forecast + AI Insights row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ForecastCard forecast={forecast} />
                      <AIInsightsCard aiInsights={aiInsights} />
                    </div>

                    <KPIStats data={filteredData} />

                    <PremiumFilters
                      filters={filters} setFilters={setFilters}
                      dateRange={dateRange} setDateRange={setDateRange}
                      uniqueTeams={uniqueTeams} uniqueServices={uniqueServices}
                    />

                    <ChartsSection data={filteredData} isDarkMode={isDarkMode} />

                    <EnterpriseTable data={filteredData} onRowClick={setSelectedTx} isCompact={isCompact} />
                  </>
                ) : currentView === 'credentials' ? (
                  <CloudCredentialsPage />
                ) : (
                  <ReportsView
                    data={filteredData}
                    filters={filters} setFilters={setFilters}
                    dateRange={dateRange} setDateRange={setDateRange}
                    onRowClick={setSelectedTx}
                    isCompact={isCompact}
                    uniqueTeams={uniqueTeams}
                    uniqueServices={uniqueServices}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <TransactionModal isOpen={!!selectedTx} onClose={() => setSelectedTx(null)} data={selectedTx} />
      <SettingsModal
        isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode} toggleTheme={toggleTheme}
        isCompact={isCompact} toggleCompact={toggleCompact}
      />
    </div>
  );
}

export default App;