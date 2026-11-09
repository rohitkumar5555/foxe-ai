import React, { useState } from 'react';
import {
  X,
  Lock,
  RotateCw,
  Terminal,
  Shield,
  MousePointer,
  Hand,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VmBrowserState } from '../types';

interface VmViewerModalProps {
  vmState: VmBrowserState;
  onClose: () => void;
  onToggleTakeOver: () => void;
}

export const VmViewerModal: React.FC<VmViewerModalProps> = ({
  vmState,
  onClose,
  onToggleTakeOver,
}) => {
  const [showLogs, setShowLogs] = useState(true);
  const [manualFieldValue, setManualFieldValue] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0F1420] border border-blue-500/25 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Control Bar */}
        <div className="bg-[#141A28] px-4 py-2.5 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-rose-500 hover:opacity-80 transition-opacity"
                title="Close VM Viewer"
              />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="hidden sm:flex items-center gap-1.5 ml-2 text-xs font-mono text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Isolated Linux VM • Chromium 132</span>
            </div>
          </div>

          {/* Interactive Mode / Take Over Switch */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTakeOver}
              aria-label="Toggle Take Over Control mode"
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                vmState.interactiveMode
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                  : 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/30'
              }`}
            >
              {vmState.interactiveMode ? (
                <>
                  <Hand className="w-3.5 h-3.5" />
                  <span>Manual Control Active</span>
                </>
              ) : (
                <>
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>Take Over Control</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close VM inspector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Browser Chrome (URL Bar) */}
        <div className="bg-[#101622] px-4 py-2 border-b border-white/5 flex items-center gap-2 text-xs">
          <button className="p-1 text-slate-400 hover:text-white" title="Reload page">
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 bg-[#090D14] rounded-lg px-3 py-1 flex items-center gap-2 text-slate-300 border border-white/5">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono text-emerald-400 text-[11px]">https://</span>
            <span className="font-mono text-slate-200 truncate">{vmState.activeUrl.replace('https://', '')}</span>
          </div>

          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">
            Fingerprint Shield ON
          </span>
        </div>

        {/* Live VM Viewport Surface */}
        <div className="flex-1 bg-slate-950 overflow-y-auto p-4 sm:p-6 relative min-h-[300px]">
          {/* Autonomous Cursor Simulation */}
          {!vmState.interactiveMode && (
            <div className="absolute top-24 left-1/3 z-20 flex items-center gap-2 pointer-events-none animate-pulse">
              <div className="w-5 h-5 text-blue-400 filter drop-shadow">
                <MousePointer className="w-5 h-5" />
              </div>
              <span className="bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow">
                Muse Agent Navigating
              </span>
            </div>
          )}

          {/* Webpage Content Rendered in VM */}
          <div className="max-w-2xl mx-auto bg-[#131926] border border-slate-700/60 rounded-xl p-5 shadow-xl text-slate-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/50">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400">
                  {vmState.targetDomain}
                </span>
                <h3 className="text-lg font-bold text-white">
                  {vmState.mockPageContent?.heading || 'Secure Transaction Portal'}
                </h3>
                <p className="text-xs text-slate-400">
                  {vmState.mockPageContent?.subheading || vmState.currentStepDescription}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {vmState.mockPageContent?.statusPill || 'Checkout Ready'}
              </span>
            </div>

            {/* Simulated Form Fields */}
            <div className="space-y-3 text-xs">
              {vmState.mockPageContent?.fields.map((field, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border transition-all ${
                    idx === 0
                      ? 'border-blue-500/60 bg-blue-950/20'
                      : 'border-slate-800 bg-[#0C1018]'
                  }`}
                >
                  <div className="flex justify-between text-slate-400 mb-1">
                    <label className="font-medium text-slate-300">{field.label}</label>
                    {field.filled && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <CheckCircle className="w-3 h-3" /> Auto-filled by Muse
                      </span>
                    )}
                  </div>
                  {vmState.interactiveMode ? (
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full bg-[#141A28] text-white px-2 py-1.5 rounded border border-blue-500/40 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  ) : (
                    <div className="font-mono text-slate-200 font-semibold">{field.value}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Manual Control Notice */}
            {vmState.interactiveMode && (
              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center justify-between">
                <span>You now have direct mouse and keyboard access to this headless browser.</span>
                <button
                  onClick={onToggleTakeOver}
                  className="px-2 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                >
                  Return to Muse
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Terminal Logs Drawer */}
        <div className="bg-[#0A0D14] border-t border-white/10">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="w-full px-4 py-1.5 flex items-center justify-between text-xs text-slate-400 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-[11px]">Real-time Sandbox Audit Logs</span>
            </div>
            {showLogs ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {showLogs && (
            <div className="px-4 py-2 font-mono text-[11px] text-slate-400 max-h-32 overflow-y-auto space-y-1 bg-[#07090E]">
              {vmState.viewportLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-blue-500 select-none">&gt;</span>
                  <span className="text-slate-300">{log}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
