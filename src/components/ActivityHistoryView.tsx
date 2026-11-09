import React, { useState } from 'react';
import {
  Clock,
  Search,
  Download,
  Trash2,
  Filter,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Database,
} from 'lucide-react';
import { clearActivityHistory } from '../api/client';

interface ActivityHistoryViewProps {
  logs: any[];
  onRefresh: () => void;
}

export const ActivityHistoryView: React.FC<ActivityHistoryViewProps> = ({
  logs,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'TASK' | 'SECURITY' | 'AUTOMATION' | 'AUTH'>('all');
  const [activeLog, setActiveLog] = useState<any | null>(null);

  const normalizedLogs = (logs || []).map((l, idx) => ({
    id: l.id || `audit-${idx}`,
    action: l.action || 'OPERATION_LOGGED',
    actor: l.agentName || l.actor || 'Security Sentinel',
    target: l.resource || l.target || 'internal_system',
    status: l.securityDecision || l.status || 'PERMITTED',
    timestamp: l.createdAt ? new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (l.timestamp || 'Just now'),
    payload: l.payload || l.details || {},
  }));

  const filteredLogs = normalizedLogs.filter((log) => {
    const s = search.toLowerCase();
    const matchesSearch =
      !s ||
      log.action.toLowerCase().includes(s) ||
      log.actor.toLowerCase().includes(s) ||
      log.target.toLowerCase().includes(s);

    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && log.action.toUpperCase().includes(selectedFilter);
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(normalizedLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `foxe_audit_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Action', 'Target', 'Status'];
    const rows = normalizedLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.actor}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.target}"`,
      `"${l.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `foxe_audit_history_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClear = async () => {
    if (confirm('Clear all audit logs from the database? This cannot be undone.')) {
      await clearActivityHistory();
      onRefresh();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            Activity History & Immutable Audit
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographically logged record of all agent intentions, tool invocations, and verified outcomes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
            title="Download full JSON log"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>

          <button
            onClick={handleClear}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/60"
            title="Clear History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search activity by action, tool, actor, or target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F172E] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-semibold">
          {(['all', 'TASK', 'SECURITY', 'AUTOMATION', 'AUTH'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-2.5 py-1.5 rounded-lg uppercase tracking-wider transition-all ${
                selectedFilter === filter
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center bg-[#0F172E] border border-slate-800 rounded-2xl text-xs text-slate-400">
            No audit records match the selected filter.
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const isSecurity =
              log.action.toLowerCase().includes('security') ||
              log.action.toLowerCase().includes('approval') ||
              log.actor.toLowerCase().includes('sentinel');
            const isTask = log.action.toLowerCase().includes('task');

            return (
              <div
                key={`${log.id}-${index}`}
                onClick={() => setActiveLog(log)}
                className="p-3.5 rounded-2xl bg-[#0F172E] border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl border ${
                      isSecurity
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : isTask
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {isSecurity ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                        {log.actor}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                      Target: {log.target}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      log.status === 'PERMITTED' || log.status === 'APPROVED_BY_USER'
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}
                  >
                    {log.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log Detail Modal */}
      {activeLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F172E] border border-slate-700 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Event Verification Payload</h3>
              <button onClick={() => setActiveLog(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Log ID:</span>
                <span className="text-white">{activeLog.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Action:</span>
                <span className="text-indigo-400 font-bold">{activeLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Actor Agent:</span>
                <span className="text-slate-200">{activeLog.actor}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Resource:</span>
                <span className="text-blue-400">{activeLog.target}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold">{activeLog.status}</span>
              </div>
              <div className="py-2">
                <span className="text-slate-400 block mb-1">Payload Details:</span>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 text-[11px] overflow-x-auto border border-slate-800">
                  {JSON.stringify(activeLog.payload || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
