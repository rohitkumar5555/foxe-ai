import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  AlertTriangle,
  Lock,
  CheckCircle2,
  XCircle,
  Key,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { approveSecurityAction, rejectSecurityAction } from '../api/client';

interface SecurityCenterViewProps {
  securityData: {
    approvals: any[];
    auditLogs: any[];
    permissions: any[];
  };
  onRefresh: () => void;
}

export const SecurityCenterView: React.FC<SecurityCenterViewProps> = ({
  securityData,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'permissions' | 'audit'>('approvals');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);

  const pendingApprovals = securityData.approvals.filter((a) => a.status === 'PENDING');
  const resolvedApprovals = securityData.approvals.filter((a) => a.status !== 'PENDING');

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    await approveSecurityAction(id);
    setProcessingId(null);
    onRefresh();
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    await rejectSecurityAction(id);
    setProcessingId(null);
    onRefresh();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            Security Center & Sentinel
          </h1>
          <p className="text-xs text-slate-400">
            Autonomous permission gating, human-in-the-loop approvals, and immutable audit logs
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Status
        </button>
      </div>

      {/* Sentinel Health Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
        <div className="p-3.5 rounded-2xl bg-[#0F172E] border border-amber-500/20 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              Sentinel Engine
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">Active Protection (Enforcing)</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172E] border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              Pending Approvals
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              {pendingApprovals.length} Gate{pendingApprovals.length === 1 ? '' : 's'} Requiring OK
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0F172E] border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
              Authorized Scopes
            </span>
            <div className="text-sm font-bold text-white mt-0.5">
              {securityData.permissions?.length || 4} Enforced Boundaries
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 shrink-0 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'approvals'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Pending Approvals
          {pendingApprovals.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
              {pendingApprovals.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'permissions'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Active Scopes & Boundaries
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-teal-500 text-teal-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Sentinel Decision Log
        </button>
      </div>

      {/* Tab 1: Approvals */}
      {activeTab === 'approvals' && (
        <div className="flex-1 overflow-y-auto space-y-4">
          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center bg-[#0F172E] border border-slate-800 rounded-2xl space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-sm text-white">All Clear — No Actions Blocked</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Security Sentinel will intercept any dangerous action (emails, card payments, file deletion) and pause execution here for your explicit authorization.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Needs Immediate Authorization ({pendingApprovals.length})
              </div>
              {pendingApprovals.map((appr) => {
                const isProcessing = processingId === appr.id;

                return (
                  <div
                    key={appr.id}
                    className="p-4 rounded-2xl bg-[#0F172E] border border-amber-500/40 shadow-lg space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{appr.action}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Target: {appr.targetResource} • Risk: HIGH
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReject(appr.id)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 text-xs font-semibold flex items-center gap-1 border border-slate-700/60 transition-all"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          onClick={() => handleApprove(appr.id)}
                          disabled={isProcessing}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isProcessing ? 'Authorizing...' : 'Authorize Action'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">
                        Sentinel Intercept Detail
                      </span>
                      <div className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
                        {typeof appr.details === 'string'
                          ? appr.details
                          : JSON.stringify(appr.details, null, 2)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>Requested by: Orchestrator Sentinel</span>
                      <span>{appr.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Past Resolved Approvals */}
          {resolvedApprovals.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Recently Resolved Approvals
              </span>
              <div className="space-y-2">
                {resolvedApprovals.slice(0, 5).map((a, idx) => (
                  <div
                    key={`${a.id}-${idx}`}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      {a.status === 'APPROVED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-200">{a.action}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {a.targetResource}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          a.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {a.status}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{a.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Permissions */}
      {activeTab === 'permissions' && (
        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
            <strong>Zero-Trust Policy:</strong> All sensitive operations (sending email to external contacts, checkout payments, file deletions) require explicit user sign-off.
          </div>

          <div className="space-y-2">
            {(securityData.permissions || []).map((p: any, idx: number) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#0F172E] border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                    <Key className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{p.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">{p.resource}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  {p.requiresHumanOk ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold">
                      Human OK Required
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold">
                      Autonomous Allowed
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      p.granted
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.granted ? 'Enforced' : 'Revoked'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Sentinel Log */}
      {activeTab === 'audit' && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {securityData.auditLogs.map((log: any, idx: number) => {
            const actor = log.agentName || log.actor || 'Security Sentinel';
            const target = log.resource || log.target || 'internal_system';
            const status = log.securityDecision || log.status || 'PERMITTED';
            const timestamp = log.createdAt
              ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : (log.timestamp || 'Just now');

            return (
              <div
                key={`${log.id}-${idx}`}
                onClick={() => setSelectedAudit(log)}
                className="p-3 rounded-xl bg-[#0F172E] border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <div>
                    <span className="font-semibold text-white">{log.action}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      Actor: {actor} • Target: {target}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0F172E] border border-slate-700 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-400" />
                Audit Trail Record
              </h3>
              <button
                onClick={() => setSelectedAudit(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Record ID:</span>
                <span className="text-white">{selectedAudit.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Action:</span>
                <span className="text-white font-bold">{selectedAudit.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Actor Agent:</span>
                <span className="text-teal-400">{selectedAudit.actor}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Resource:</span>
                <span className="text-blue-400">{selectedAudit.target}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Timestamp:</span>
                <span className="text-slate-300">{selectedAudit.timestamp}</span>
              </div>
              <div className="py-2">
                <span className="text-slate-400 block mb-1">Audit Metadata:</span>
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 text-[11px] overflow-x-auto border border-slate-800">
                  {JSON.stringify(selectedAudit.details || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
