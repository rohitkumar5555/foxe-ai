import React, { useState, useEffect } from 'react';
import {
  Globe,
  Lock,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Camera,
  FileText,
  MousePointer,
  Hand,
  Square,
  Download,
  Plus,
  Terminal,
  Search,
  ExternalLink,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { fetchBrowserSession, navigateBrowser, toggleBrowserControl } from '../api/client';

export const BrowserAgentView: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [urlInput, setUrlInput] = useState('https://www.united.com/checkout/itinerary/UA875');
  const [activeTab, setActiveTab] = useState('tab-1');
  const [extractedContent, setExtractedContent] = useState('');
  const [capturedScreenshot, setCapturedScreenshot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const data = await fetchBrowserSession();
      setSession(data);
      if (data?.url) setUrlInput(data.url);
      if (data?.extractedContent) setExtractedContent(data.extractedContent);
    } catch (e) {
      console.warn('Error loading browser session:', e);
    }
  };

  const handleNavigate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;
    setIsLoading(true);
    let targetUrl = urlInput.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }
    const updated = await navigateBrowser(targetUrl);
    setSession(updated);
    setIsLoading(false);
  };

  const handleToggleControl = async () => {
    if (!session) return;
    const nextMode = !session.interactiveMode;
    const updated = await toggleBrowserControl(nextMode);
    setSession(updated);
  };

  const handleReadPage = () => {
    setExtractedContent(
      `[EXTRACTED PAGE TEXT @ ${session?.url || urlInput}]\n\nHeader: United Airlines - Booking Itinerary Hold\nFlight: UA875 Nonstop (SFO -> HND)\nDeparture: 11:30 AM (Nov 14, 2026)\nArrival: 04:45 PM (Nov 21, 2026)\nPassenger: Alex Vance\nSeat: 14A (Window, Forward Cabin)\nFare Breakdown: Base Fare $564.00 + Taxes/Fees $78.00 = $642.00 USD\nHold Expiry: 12 minutes remaining.\nSecurity Status: SSL 256-bit TLS 1.3 Verified.`
    );
  };

  const handleScreenshot = () => {
    setCapturedScreenshot(true);
    setTimeout(() => setCapturedScreenshot(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([extractedContent || 'Browser session content'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `browser_page_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Sandboxed Browser Agent
          </h1>
          <p className="text-xs text-slate-400">
            Isolated Chromium runner via Playwright with anti-fingerprint residential proxy
          </p>
        </div>

        {/* Browser Page Action Buttons (Part 5 requirements) */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleToggleControl}
            aria-label="Take Control of Browser"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
              session?.interactiveMode
                ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 font-bold'
                : 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/30'
            }`}
          >
            {session?.interactiveMode ? (
              <>
                <Hand className="w-3.5 h-3.5" />
                <span>Manual Control Active</span>
              </>
            ) : (
              <>
                <MousePointer className="w-3.5 h-3.5" />
                <span>Take Control</span>
              </>
            )}
          </button>

          <button
            onClick={handleReadPage}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 border border-slate-700/60"
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Read Page</span>
          </button>

          <button
            onClick={handleScreenshot}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 border border-slate-700/60"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span>{capturedScreenshot ? 'Captured!' : 'Screenshot'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 border border-slate-700/60"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Browser Chrome Container */}
      <div className="flex-1 rounded-2xl bg-[#0D1527] border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
        {/* Tab Strip */}
        <div className="bg-[#0A101F] px-3 pt-2 flex items-center gap-1 border-b border-slate-800/80">
          <div className="flex items-center gap-2 bg-[#0D1527] px-3 py-1.5 rounded-t-xl border-t border-x border-slate-700 text-xs text-white font-medium">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[160px]">United Airlines - Checkout</span>
          </div>

          <button
            onClick={() => alert('New sandboxed browser tab spawned')}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="New Tab"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Navigation & Address Bar (Part 5 requirements: Back, Forward, Refresh, Address Bar) */}
        <form
          onSubmit={handleNavigate}
          className="bg-[#0B1222] px-3 py-2 flex items-center gap-2 border-b border-slate-800 text-xs"
        >
          <button
            type="button"
            onClick={() => handleNavigate()}
            className="p-1 text-slate-400 hover:text-white"
            title="Back"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleNavigate()}
            className="p-1 text-slate-400 hover:text-white"
            title="Forward"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleNavigate()}
            className="p-1 text-slate-400 hover:text-white"
            title="Refresh"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          {/* Address input */}
          <div className="flex-1 bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 flex items-center gap-2 text-slate-200">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-mono text-[11px]">https://</span>
            <input
              type="text"
              value={urlInput.replace('https://', '')}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL or search query..."
              className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Open Website
          </button>
        </form>

        {/* Viewport Surface */}
        <div className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-y-auto relative">
          {session?.interactiveMode ? (
            <div className="mb-3 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <span>Interactive Take-Over Enabled: You have direct keyboard and cursor access.</span>
              <button
                onClick={handleToggleControl}
                className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
              >
                Return to Autonomous Agent
              </button>
            </div>
          ) : (
            <div className="mb-3 p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                FOXE Browser Agent is managing page elements autonomously.
              </span>
              <button
                onClick={handleToggleControl}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
              >
                Take Control
              </button>
            </div>
          )}

          {/* Rendered Page Content */}
          <div className="max-w-3xl mx-auto bg-[#0F172E] border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-400 tracking-wider">
                  united.com (Secured by Sentinel)
                </span>
                <h3 className="text-base font-bold text-white">
                  United Airlines - Itinerary Hold Confirmation
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Fare Guaranteed: $642.00
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Passenger</span>
                <span className="font-semibold text-white">Alex Vance</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Seat Assignment</span>
                <span className="font-semibold text-emerald-400">14A (Window, Economy)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Route & Dates</span>
                <span className="font-semibold text-white">SFO ⇄ HND (Nov 14 - Nov 21)</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Checkout Status</span>
                <span className="font-semibold text-amber-400">Held (Awaiting User OK)</span>
              </div>
            </div>

            {/* Extracted Page Content Viewer */}
            {extractedContent && (
              <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                {extractedContent}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Browser CDP Console Logs */}
        <div className="bg-[#070D1C] p-3 border-t border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1 text-[11px]">
            <Terminal className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">Playwright CDP Session Logs</span>
          </div>
          <div className="space-y-0.5 text-[11px] text-slate-400 max-h-20 overflow-y-auto">
            {session?.logs?.map((l: string, i: number) => (
              <div key={i} className="truncate">
                <span className="text-blue-500">&gt;</span> {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
