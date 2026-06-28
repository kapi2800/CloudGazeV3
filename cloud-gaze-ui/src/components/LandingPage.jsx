import React from 'react';
import { ArrowRight, BarChart3, BrainCircuit, ShieldAlert, Sparkles, Cloud, LayoutDashboard, Terminal } from 'lucide-react';

export default function LandingPage({ onLoginClick }) {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none flex justify-center">
        <div className="absolute top-[-10%] w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cloud className="text-white" size={18} fill="currentColor" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">CloudGaze</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition">Features</a>
          <a href="#architecture" className="text-sm font-medium text-slate-400 hover:text-white transition hidden md:block">Architecture</a>
          <button 
            onClick={onLoginClick}
            className="text-sm font-semibold text-white bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full backdrop-blur-md border border-white/10 transition"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-8">
          <Sparkles size={14} /> Next-Gen Cloud Intelligence
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-8">
          Stop Guessing Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">Cloud Costs.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          CloudGaze aggregates AWS and GCP billing data into a single pane of glass. Powered by Machine Learning anomaly detection and AI insights.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={onLoginClick}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            Access Dashboard <ArrowRight size={18} />
          </button>
          <a 
            href="#features"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2"
          >
            Explore Features
          </a>
        </div>

        {/* Dashboard Preview Image/Mock */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-transparent to-transparent z-10" />
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-sm overflow-hidden">
            <div className="rounded-xl border border-slate-800/50 bg-[#0B0E14] overflow-hidden flex flex-col h-[400px]">
              {/* Fake UI Header */}
              <div className="h-12 border-b border-slate-800 flex items-center px-4 gap-4 bg-slate-900">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="h-6 w-64 bg-slate-800 rounded-md" />
              </div>
              {/* Fake UI Body */}
              <div className="flex flex-1 p-6 gap-6 opacity-60">
                <div className="w-48 space-y-4 hidden sm:block">
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                  <div className="h-4 w-32 bg-slate-800 rounded" />
                  <div className="h-4 w-20 bg-slate-800 rounded" />
                </div>
                <div className="flex-1 space-y-6">
                  <div className="flex gap-4">
                    <div className="h-24 flex-1 bg-slate-800 rounded-xl" />
                    <div className="h-24 flex-1 bg-slate-800 rounded-xl" />
                    <div className="h-24 flex-1 bg-slate-800 rounded-xl" />
                  </div>
                  <div className="h-48 bg-slate-800 rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-slate-900/50 border-y border-slate-800 py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Enterprise-Grade Intelligence</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Monitor, forecast, and optimize your cloud infrastructure.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-[#0B0E14] border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mb-6 text-red-400">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Z-Score Anomaly Detection</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our Python ML engine constantly monitors daily spend. If costs spike beyond 1.5 standard deviations from the 7-day rolling average, it's instantly flagged.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0B0E14] border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/50 transition">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-emerald-400">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Linear Regression Forecasting</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                We use scikit-learn to aggregate monthly totals and predict next month's spending. This provides an explainable, non-black-box forecast in milliseconds.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0B0E14] border border-slate-800 p-8 rounded-2xl hover:border-indigo-500/50 transition relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles size={100} />
              </div>
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center mb-6 text-indigo-400 relative z-10">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 relative z-10">AI Insights</h3>
              <p className="text-slate-400 text-sm leading-relaxed relative z-10">
                Aggregated spending summaries are analyzed securely by Artificial Intelligence, returning tailored, actionable cost optimization strategies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Tech Stack */}
      <footer className="relative z-10 container mx-auto px-6 py-12 text-center border-t border-slate-800 mt-20">
        <div className="flex flex-wrap justify-center gap-6 mb-8 text-slate-500">
          <div className="flex items-center gap-2"><LayoutDashboard size={16}/> React (Vite)</div>
          <div className="flex items-center gap-2"><Terminal size={16}/> Node.js (Auth)</div>
          <div className="flex items-center gap-2"><Sparkles size={16}/> Python Flask (ML)</div>
        </div>
        <p className="text-slate-600 text-sm">© 2026 CloudGaze Project. Final Year CS Submission.</p>
      </footer>
    </div>
  );
}
