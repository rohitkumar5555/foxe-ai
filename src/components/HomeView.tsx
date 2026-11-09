import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Grid,
  RefreshCw,
  Plus,
  Play,
  Clock,
  Send,
  MessageSquare,
  Shield,
  Activity,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { FoxeSection } from './Sidebar';

interface HomeViewProps {
  onNavigate: (section: FoxeSection) => void;
  dashboardData: any;
  onRefresh: () => void;
  onQuickCommand: (cmd: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  dashboardData,
  onRefresh,
  onQuickCommand,
}) => {
  const [commandText, setCommandText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText.trim()) return;
    onQuickCommand(commandText.trim());
    setCommandText('');
  };

  const quickPrompts = [
    'Lock in $642 United flight to Tokyo in Sandboxed VM',
    'Audit inactive SaaS subscriptions and cancel unused ones',
    'Summarize my morning calendar meetings & unread emails',
    'Extract financial metrics from Q4 Audit Report PDF',
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#070D1C] p-4 sm:p-6 space-y-6">
      {/* Top Banner & Agent Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome back, Alex
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {dashboardData?.agentStatus || 'Active (Ready)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            FOXE multi-agent orchestration engine is monitoring 2 background automations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshClick}
            aria-label="Refresh Dashboard Metrics"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
            title="Refresh from Database"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={() => onNavigate('tasks')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0055EE] hover:to-[#0040B0] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Task
          </button>
        </div>
      </div>

      {/* Metrics Row (Actual DB Values) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div
          onClick={() => onNavigate('tasks')}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all group"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Active Tasks</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-blue-400">
              {dashboardData?.activeTasks ?? 0}
            </span>
            <Activity className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('tasks')}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all group"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Completed</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-emerald-400">
              {dashboardData?.completedTasks ?? 0}
            </span>
            <CheckCircle2 className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('tasks')}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all group"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Failed Tasks</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-rose-400">
              {dashboardData?.failedTasks ?? 0}
            </span>
            <AlertTriangle className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('security')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-slate-900/80 border border-amber-500/30 hover:border-amber-400 cursor-pointer transition-all group"
        >
          <span className="text-[11px] font-medium text-amber-300 block">Pending Approvals</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-amber-400">
              {dashboardData?.pendingApprovals ?? 0}
            </span>
            <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('connected_apps')}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all group"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Connected Apps</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-purple-400">
              {dashboardData?.connectedAppsCount ?? 0}
            </span>
            <Grid className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
          </div>
        </div>

        <div
          onClick={() => onNavigate('automations')}
          className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 cursor-pointer transition-all group"
        >
          <span className="text-[11px] font-medium text-slate-400 block">Automations</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-extrabold text-teal-400">
              {dashboardData?.upcomingAutomations ?? 0}
            </span>
            <Zap className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
        </div>
      </div>

      {/* Quick Natural Language Command Input */}
      <div className="p-4 rounded-2xl bg-[#0F172E] border border-blue-500/25 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">
            Execute Natural Language Command
          </h2>
        </div>

        <form onSubmit={handleCommandSubmit} className="flex gap-2">
          <input
            type="text"
            value={commandText}
            onChange={(e) => setCommandText(e.target.value)}
            placeholder="Instruct FOXE: 'Find flight SFO to Tokyo', 'Audit subscriptions', 'Check calendar'..."
            className="flex-1 bg-slate-950/80 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!commandText.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 shrink-0"
          >
            <span>Execute</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick prompt pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pt-1">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => onQuickCommand(p)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/50 whitespace-nowrap shrink-0 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Quick Buttons Grid (Part 2 requirement) */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Quick Workspaces
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <button
            onClick={() => onNavigate('assistant')}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-left transition-all"
          >
            <MessageSquare className="w-4 h-4 text-blue-400 mb-1.5" />
            <span className="text-xs font-semibold text-white block">Open Assistant</span>
            <span className="text-[10px] text-slate-400">Conversational AI</span>
          </button>

          <button
            onClick={() => onNavigate('tasks')}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-left transition-all"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400 mb-1.5" />
            <span className="text-xs font-semibold text-white block">View Tasks</span>
            <span className="text-[10px] text-slate-400">Execution Manager</span>
          </button>

          <button
            onClick={() => onNavigate('connected_apps')}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-purple-500/40 text-left transition-all"
          >
            <Grid className="w-4 h-4 text-purple-400 mb-1.5" />
            <span className="text-xs font-semibold text-white block">Connect App</span>
            <span className="text-[10px] text-slate-400">Gmail, Cal, Drive</span>
          </button>

          <button
            onClick={() => onNavigate('automations')}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-teal-500/40 text-left transition-all"
          >
            <Zap className="w-4 h-4 text-teal-400 mb-1.5" />
            <span className="text-xs font-semibold text-white block">Automations</span>
            <span className="text-[10px] text-slate-400">Recurring Jobs</span>
          </button>

          <button
            onClick={() => onNavigate('security')}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-left transition-all"
          >
            <Shield className="w-4 h-4 text-amber-400 mb-1.5" />
            <span className="text-xs font-semibold text-white block">Security Center</span>
            <span className="text-[10px] text-slate-400">Sentinel & Approvals</span>
          </button>

          <button
            onClick={() => onNavigate('notifications')}
            className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/40 text-left transition-all"
          >
            <Clock className="w-4 h-4 text-blue-400 mb-1.5" />
            <span className="text-xs font-semibold text-white block">Notifications</span>
            <span className="text-[10px] text-slate-400">Unread Alerts</span>
          </button>
        </div>
      </div>

      {/* Two-Column Activity & Tasks Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Tasks */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Recent Orchestrated Tasks
            </h3>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {dashboardData?.recentTasks?.map((task: any, i: number) => (
              <div
                key={`${task.id}-${i}`}
                onClick={() => onNavigate('tasks')}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-400'
                          : task.status === 'WAITING_APPROVAL'
                          ? 'bg-amber-400'
                          : 'bg-blue-400'
                      }`}
                    />
                    <h4 className="text-xs font-semibold text-white truncate">{task.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                    Agent: {task.assignedAgent} • {task.steps?.length || 1} steps
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : task.status === 'WAITING_APPROVAL'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                      : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Sentinel & Audit Activity */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Security Sentinel Audit Stream
            </h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
            >
              <span>Full Audit</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {dashboardData?.recentActivity?.map((audit: any, i: number) => (
              <div
                key={`${audit.id}-${i}`}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] font-semibold text-slate-200">
                      {audit.action}
                    </span>
                    <span className="text-[10px] text-slate-500">• {audit.agentName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                    Target: {audit.resource || 'internal_system'}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                    audit.securityDecision === 'APPROVED_BY_USER'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : audit.securityDecision === 'BLOCKED'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-blue-500/15 text-blue-400'
                  }`}
                >
                  {audit.securityDecision}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
