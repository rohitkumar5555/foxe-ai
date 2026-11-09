import React, { useState } from 'react';
import {
  Cpu,
  HardDrive,
  Activity,
  Play,
  Square,
  RotateCw,
  Terminal,
  X,
  Server,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { updateWorkspaceStatus } from '../api/client';

interface WorkspaceModalProps {
  workspace: any;
  onClose: () => void;
  onRefresh: () => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  workspace,
  onClose,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'terminal' | 'ports'>('metrics');
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isRunning = workspace?.status === 'running';

  const handleAction = async (status: string) => {
    setActionLoading(true);
    await updateWorkspaceStatus(status);
    setActionLoading(false);
    onRefresh();
  };

  const copySsh = () => {
    navigator.clipboard.writeText('ssh -i ~/.ssh/foxe_key agent@cloud.foxe.internal:2222');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="w-full max-w-2xl bg-[#0F172E] border border-slate-700 rounded-3xl shadow-2xl text-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  DEVELOPMENT WORKSPACE
                </h2>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-wider">
                  Isolated Runtime
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Environment ID: ws-cloud-8829 • Ubuntu 24.04 LTS (Node.js 22 + Chromium)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Workspace"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Runtime Control Toolbar */}
        <div className="px-5 py-3 bg-[#070D1C] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {workspace?.status || 'RUNNING'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              (Uptime: {workspace?.uptime || '4h 12m'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <>
                <button
                  onClick={() => handleAction('stopped')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-200 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition-all"
                >
                  <Square className="w-3.5 h-3.5" />
                  Stop Workspace
                </button>
                <button
                  onClick={() => handleAction('restarted')}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-blue-500/20 text-slate-200 hover:text-blue-400 text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition-all"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
                  Restart
                </button>
              </>
            ) : (
              <button
                onClick={() => handleAction('running')}
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Start Workspace
              </button>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-4 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`pb-2 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'metrics'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Resource Telemetry
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`pb-2 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'terminal'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Runtime Logs (CDP / Exec)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              {/* Telemetry Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-blue-400" />
                      CPU Usage
                    </span>
                    <span className="font-mono font-bold text-white">{workspace?.cpu || '22%'}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '22%' }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">4 vCPUs allocated</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                      Memory RAM
                    </span>
                    <span className="font-mono font-bold text-white">{workspace?.memory || '1.8 / 8.0 GB'}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '23%' }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">23% committed</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                      Disk NVMe
                    </span>
                    <span className="font-mono font-bold text-white">{workspace?.disk || '14.2 / 50 GB'}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: '28%' }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Encrypted LUKS partition</span>
                </div>
              </div>

              {/* Secure Container Access */}
              <div className="p-4 rounded-2xl bg-[#070D1C] border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-white block">
                  Agent Direct Terminal Access (SSH Bridge)
                </span>
                <p className="text-xs text-slate-400">
                  You can connect directly to this container workspace via secure key:
                </p>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
                  <code>ssh -i ~/.ssh/foxe_key agent@cloud.foxe.internal:2222</code>
                  <button
                    onClick={copySsh}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 ml-2"
                    title="Copy command"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terminal' && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 h-64 overflow-y-auto">
              <div className="text-slate-500"># Cloud Sandboxed Runtime Logs</div>
              <div className="text-emerald-400">[SYSTEM] Ubuntu 24.04 LTS (x86_64) kernel 6.6.137-linux</div>
              <div>[SYSTEM] Container cgroup limits: 8GB RAM, 4 vCPUs enforced</div>
              <div>[SYSTEM] Chromium daemon listening on ws://127.0.0.1:9222/devtools/browser</div>
              <div>[AGENT] Orchestrator PID 412 initialized with active memory cache</div>
              <div>[AGENT] Tool sandbox mounted at /app/workspace (read-write)</div>
              <div>[NETWORK] Outbound traffic routed via secure egress proxy</div>
              <div className="text-blue-400">[STATUS] Healthcheck: 200 OK (latency 1.4ms)</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
