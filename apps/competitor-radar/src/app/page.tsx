'use client';

import React, { useState } from 'react';
import { 
  Radar, 
  ShieldCheck, 
  Play, 
  Activity, 
  Video, 
  Tag, 
  CheckCircle2, 
  Globe, 
  ExternalLink,
  Cpu,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

interface ScanResult {
  competitorName: string;
  url: string;
  sessionId: string;
  replayUrl: string;
  analysis: {
    pageTitle: string;
    detectedPrices: string[];
    confidence: number;
    timestamp: string;
    summary: string;
  };
}

export default function SolariRadarDashboard() {
  const [targetUrl, setTargetUrl] = useState('https://vercel.com/pricing');
  const [competitorName, setCompetitorName] = useState('Vercel Pricing');
  const [loading, setLoading] = useState(false);
  const [activeScan, setActiveScan] = useState<ScanResult | null>(null);

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl) return;

    setLoading(true);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, competitorName }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveScan(data);
      } else {
        alert(data.error || 'Scan failed');
      }
    } catch (err) {
      alert('Network error running scan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Banner */}
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-2">
              <Radar className="w-3.5 h-3.5" /> Powered by Solari Cloud Browsers & Sandboxes
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Autonomous Competitor Radar
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Stealth anti-bot scraping, live session recordings, and microVM pricing diff analysis.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Solari US-West Active
            </span>
          </div>
        </header>

        {/* Scan Input Control */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleRunScan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Competitor Name
                </label>
                <input
                  type="text"
                  value={competitorName}
                  onChange={(e) => setCompetitorName(e.target.value)}
                  placeholder="e.g. OpenAI Pricing"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Website URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://example.com/pricing"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition-all whitespace-nowrap shadow-lg shadow-emerald-500/20"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Scanning...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-slate-950" /> Trigger Radar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* Live Status & Results */}
        {activeScan && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analysis Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-bold text-white text-lg">
                      {activeScan.competitorName} Scan Complete
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Session: {activeScan.sessionId.slice(0, 12)}...
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeScan.analysis.summary}
                </p>

                {/* Pricing Tiers Extracted */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-400" /> Detected Price Points in Sandbox
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeScan.analysis.detectedPrices.map((price, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-sm font-semibold"
                      >
                        {price}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Solari Feature Inspection Sidebar */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Video className="w-4 h-4 text-sky-400" /> Solari Session Recording
                </h4>
                <p className="text-xs text-slate-400">
                  Full browser replay captured through residential egress with anti-bot stealth bypass.
                </p>

                <a
                  href={activeScan.replayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs py-2.5 rounded-xl border border-slate-700 transition-colors"
                >
                  Watch Session Replay <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" /> MicroVM Sandbox Status
                </h4>
                <div className="text-xs text-slate-300 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Template:</span>
                    <span className="text-slate-100">base (headless)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence:</span>
                    <span className="text-emerald-400">{(activeScan.analysis.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lifecycle:</span>
                    <span className="text-slate-100">Killed & Reclaimed</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}