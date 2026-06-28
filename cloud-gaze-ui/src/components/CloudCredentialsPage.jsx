import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Cloud, Server, CheckCircle, AlertCircle, Trash2, Save, Eye, EyeOff, Loader } from 'lucide-react';

const NODE_URL = 'http://localhost:4000';

export default function CloudCredentialsPage() {
  const { authFetch } = useAuth();

  
  const [status, setStatus] = useState({ aws: { configured: false }, gcp: { configured: false } });
  const [statusLoading, setStatusLoading] = useState(true);

  // AWS form state
  const [awsKeyId, setAwsKeyId] = useState('');
  const [awsSecret, setAwsSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [awsSaving, setAwsSaving] = useState(false);
  const [awsMsg, setAwsMsg] = useState(null);

  // GCP form state
  const [gcpJson, setGcpJson] = useState('');
  const [gcpSaving, setGcpSaving] = useState(false);
  const [gcpMsg, setGcpMsg] = useState(null);

  useEffect(() => {
    authFetch(`${NODE_URL}/api/credentials/status`)
      .then(r => r.json())
      .then(d => { setStatus(d); setStatusLoading(false); })
      .catch(() => setStatusLoading(false));
  }, []);

  async function saveAws(e) {
    e.preventDefault();
    setAwsSaving(true);
    setAwsMsg(null);
    try {
      const res = await authFetch(`${NODE_URL}/api/credentials`, {
        method: 'POST',
        body: JSON.stringify({ awsKeyId, awsSecret }),
      });
      const d = await res.json();
      if (d.success) {
        setAwsMsg({ type: 'ok', text: 'AWS credentials saved successfully.' });
        setStatus(s => ({ ...s, aws: { configured: true, keyIdPreview: `${awsKeyId.slice(0, 4)}...${awsKeyId.slice(-4)}` } }));
        setAwsKeyId(''); setAwsSecret('');
      } else {
        setAwsMsg({ type: 'err', text: d.message || 'Failed to save.' });
      }
    } catch {
      setAwsMsg({ type: 'err', text: 'Cannot connect to auth server.' });
    }
    setAwsSaving(false);
  }

  async function saveGcp(e) {
    e.preventDefault();
    setGcpSaving(true);
    setGcpMsg(null);
    try {
      const res = await authFetch(`${NODE_URL}/api/credentials`, {
        method: 'POST',
        body: JSON.stringify({ gcpJson }),
      });
      const d = await res.json();
      if (d.success) {
        setGcpMsg({ type: 'ok', text: 'GCP credentials saved successfully.' });
        setStatus(s => ({ ...s, gcp: { configured: true } }));
        setGcpJson('');
      } else {
        setGcpMsg({ type: 'err', text: d.message || 'Failed to save.' });
      }
    } catch {
      setGcpMsg({ type: 'err', text: 'Cannot connect to auth server.' });
    }
    setGcpSaving(false);
  }

  async function removeProvider(provider) {
    await authFetch(`${NODE_URL}/api/credentials/${provider}`, { method: 'DELETE' });
    setStatus(s => ({ ...s, [provider]: { configured: false } }));
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Cloud Connections</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Enter your cloud provider credentials. They are stored securely on the server never in your browser.
        </p>
      </div>

      {/* ── AWS Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl">
              <Cloud size={20} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Amazon Web Services</h2>
              <p className="text-xs text-slate-500">AWS Cost Explorer API — requires IAM key with <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-xs">AWSBillingReadOnlyAccess</code></p>
            </div>
          </div>

          {/* Status badge */}
          {!statusLoading && (
            status.aws.configured ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                  <CheckCircle size={12} /> Connected · {status.aws.keyIdPreview}
                </span>
                <button onClick={() => removeProvider('aws')} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                <AlertCircle size={12} /> Not configured
              </span>
            )
          )}
        </div>

        {!status.aws.configured && (
          <form onSubmit={saveAws} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Access Key ID</label>
                <input
                  type="text"
                  value={awsKeyId}
                  onChange={e => setAwsKeyId(e.target.value)}
                  placeholder="AKIA..."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Secret Access Key</label>
                <div className="relative">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={awsSecret}
                    onChange={e => setAwsSecret(e.target.value)}
                    placeholder="••••••••••••••••"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition"
                  />
                  <button type="button" onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showSecret ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {awsMsg && (
              <div className={`text-xs px-3 py-2.5 rounded-lg ${awsMsg.type === 'ok' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                {awsMsg.text}
              </div>
            )}

            <button type="submit" disabled={awsSaving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
              {awsSaving ? <><Loader size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save AWS Credentials</>}
            </button>
          </form>
        )}
      </div>

      {/* ── GCP Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
              <Server size={20} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Google Cloud Platform</h2>
              <p className="text-xs text-slate-500">Paste your Service Account JSON key file contents below</p>
            </div>
          </div>

          {!statusLoading && (
            status.gcp.configured ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                  <CheckCircle size={12} /> Connected
                </span>
                <button onClick={() => removeProvider('gcp')} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                <AlertCircle size={12} /> Not configured
              </span>
            )
          )}
        </div>

        {!status.gcp.configured && (
          <form onSubmit={saveGcp} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">Service Account JSON</label>
              <textarea
                value={gcpJson}
                onChange={e => setGcpJson(e.target.value)}
                placeholder={'{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}'}
                rows={7}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition resize-none"
              />
            </div>

            {gcpMsg && (
              <div className={`text-xs px-3 py-2.5 rounded-lg ${gcpMsg.type === 'ok' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500'}`}>
                {gcpMsg.text}
              </div>
            )}

            <button type="submit" disabled={gcpSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition">
              {gcpSaving ? <><Loader size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save GCP Credentials</>}
            </button>
          </form>
        )}
      </div>

      {/* Info box */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <p className="font-semibold text-slate-700 dark:text-slate-300">How credentials are stored</p>
        <p>Credentials are sent to the Node.js backend over localhost and saved in a <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">credentials.json</code> file on the server.</p>
        <p>Your browser never stores your keys. Refresh the page the form is empty by design.</p>
        <p>The Python data service reads this file when making live API calls to AWS and GCP.</p>
      </div>
    </div>
  );
}
