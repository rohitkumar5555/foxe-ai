import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Play,
  Pause,
  RotateCw,
  Trash2,
  Download,
  Terminal,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  X,
  FileText,
  StopCircle,
  Mail,
} from 'lucide-react';
import { createTask, pauseTask, resumeTask, retryTask, cancelTask, deleteTask, setAuthSession } from '../api/client';
import { authorizeGmail } from '../lib/firebase';

interface TasksViewProps {
  tasks: any[];
  onRefresh: () => void;
  onNavigateToSecurity: () => void;
  onOpenSendEmailModal?: (data: { recipient?: string; subject?: string; message?: string }) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onRefresh,
  onNavigateToSecurity,
  onOpenSendEmailModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newInstruction, setNewInstruction] = useState('');
  const [newAgent, setNewAgent] = useState('Browser Agent');
  const [connectingTaskId, setConnectingTaskId] = useState<string | null>(null);

  const handleConnectGmailForTask = async (taskId: string) => {
    try {
      setConnectingTaskId(taskId);
      const authData = await authorizeGmail();
      if (!authData?.accessToken) {
        throw new Error('Google did not return an OAuth access token. Please ensure you authorize the Gmail sending scope.');
      }
      await setAuthSession({
        email: authData.user.email,
        fullName: authData.user.displayName,
        avatarUrl: authData.user.photoURL,
        accessToken: authData.accessToken,
      });
      await retryTask(taskId);
      onRefresh();
    } catch (err: any) {
      console.error('Failed to authorize Gmail for task:', err);
      alert(
        `Google Gmail Authorization:\n${err.message || 'Popup closed or access denied'}\n\nImportant: Sign in with your developer account (rohitmohitrajkumarnagar@gmail.com). When Google shows "Google hasn't verified this app", click "Advanced" -> "Go to gen-lang-client-0525152265 (unsafe)" -> "Continue/Allow".`
      );
    } finally {
      setConnectingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.instruction.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createTask(newTitle.trim(), newInstruction.trim(), newAgent);
    setNewTitle('');
    setNewInstruction('');
    setShowCreateModal(false);
    onRefresh();
  };

  const handlePause = async (id: string) => {
    await pauseTask(id);
    onRefresh();
  };

  const handleResume = async (id: string) => {
    await resumeTask(id);
    onRefresh();
  };

  const handleRetry = async (id: string) => {
    await retryTask(id);
    onRefresh();
  };

  const handleCancel = async (id: string) => {
    if (confirm('Cancel this task and cease autonomous execution?')) {
      await cancelTask(id);
      onRefresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task record from database?')) {
      await deleteTask(id);
      if (selectedTask?.id === id) setSelectedTask(null);
      onRefresh();
    }
  };

  const handleDownloadResult = (task: any) => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(task, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${task.id}_result.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            Task Manager
          </h1>
          <p className="text-xs text-slate-400">
            Real-time execution queue, state transitions, and step verifications
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSendEmailModal && (
            <button
              onClick={() => onOpenSendEmailModal({
                recipient: 'rohitmohitrajkumarnagar@gmail.com',
                subject: 'Message from FOXE AI Agent',
                message: 'Hello Rohit,\n\nThis is a real email sent directly via the official Gmail API.',
              })}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>Send Real Email</span>
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2 shrink-0">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, instruction, or ID..."
            className="w-full bg-[#0F172E] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {['ALL', 'RUNNING', 'WAITING_APPROVAL', 'COMPLETED', 'FAILED', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl capitalize whitespace-nowrap transition-colors font-medium ${
                filterStatus === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st.replace('_', ' ').toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table / Cards */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No tasks found matching filter. Click "Create Task" to start a new job.
          </div>
        ) : (
          filteredTasks.map((t) => (
            <div
              key={t.id}
              className="p-4 rounded-2xl bg-[#0F172E] border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-400'
                        : t.status === 'WAITING_APPROVAL'
                        ? 'bg-amber-400 animate-pulse'
                        : t.status === 'RUNNING'
                        ? 'bg-blue-400 animate-spin'
                        : t.status === 'FAILED'
                        ? 'bg-rose-400'
                        : 'bg-slate-400'
                    }`}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{t.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {t.id} • Assigned: {t.assignedAgent} • Created: {new Date(t.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    t.status === 'COMPLETED'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : t.status === 'WAITING_APPROVAL'
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : t.status === 'RUNNING'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {t.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                {t.instruction}
              </p>

              {/* Error message if present */}
              {t.errorMessage && (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span><strong>Execution Error:</strong> {t.errorMessage}</span>
                  </div>

                  {(t.errorMessage.toLowerCase().includes('gmail') || t.errorMessage.toLowerCase().includes('token')) && (
                    <div className="p-3.5 bg-blue-950/60 border border-blue-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-blue-400" />
                          <span>Google Gmail Authorization Required</span>
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1">
                          Authorize your developer account <strong className="text-white">rohitmohitrajkumarnagar@gmail.com</strong> so FOXE can dispatch real emails from your inbox.
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleConnectGmailForTask(t.id)}
                          disabled={connectingTaskId === t.id}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Mail className="w-4 h-4" />
                          <span>{connectingTaskId === t.id ? 'Connecting with Google...' : 'Authorize Gmail & Send'}</span>
                        </button>
                        {onOpenSendEmailModal && (
                          <button
                            onClick={() => onOpenSendEmailModal({
                              recipient: 'rohitmohitrajkumarnagar@gmail.com',
                              subject: 'Message from FOXE AI Agent',
                              message: t.instruction,
                            })}
                            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>Choose Sender Account</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tool and Timing info */}
              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Tool: <strong className="text-blue-400">{t.steps?.[t.steps.length - 1]?.toolName || 'orchestrator_core'}</strong></span>
                <span>
                  Started: {new Date(t.createdAt).toLocaleTimeString()}
                  {t.completedAt && ` • Completed: ${new Date(t.completedAt).toLocaleTimeString()}`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Execution Progress</span>
                  <span className="font-mono">{t.progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${t.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Task Controls Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedTask(t)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>View Steps & Logs ({t.steps?.length || 0})</span>
                  </button>

                  {t.status === 'COMPLETED' && t.resultData && (
                    <button
                      onClick={() => handleDownloadResult(t)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download Output</span>
                    </button>
                  )}

                  {t.status === 'WAITING_APPROVAL' && (
                    <button
                      onClick={onNavigateToSecurity}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Sentinel Approval Required</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {(t.status === 'RUNNING' || t.status === 'WAITING_APPROVAL' || t.status === 'PENDING') && (
                    <button
                      onClick={() => handleCancel(t.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                      title="Cancel Task"
                    >
                      <StopCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  {t.status === 'RUNNING' && (
                    <button
                      onClick={() => handlePause(t.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      title="Pause Task"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {t.status === 'PENDING' && (
                    <button
                      onClick={() => handleResume(t.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 cursor-pointer"
                      title="Resume Task"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {(t.status === 'FAILED' || t.status === 'CANCELLED') && (
                    <button
                      onClick={() => handleRetry(t.id)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                      title="Retry Task"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Details & Steps Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0F172E] border border-blue-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">
                  Execution Trace: {selectedTask.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 flex-1 overflow-y-auto space-y-2.5">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Task Parameters
                </span>
                <p className="text-slate-200">{selectedTask.instruction}</p>
                <div className="mt-2 text-[11px] text-slate-400 font-mono">
                  Agent: {selectedTask.assignedAgent} • Status: {selectedTask.status}
                </div>
              </div>

              <span className="text-xs font-bold text-white block mt-2">
                Atomic Execution Steps ({selectedTask.steps?.length || 0})
              </span>

              {selectedTask.steps?.map((step: any, idx: number) => (
                <div
                  key={step.id || idx}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{step.title}</span>
                      <span className="font-mono text-[10px] text-slate-400">{step.executionMs}ms</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{step.description}</p>
                    <span className="font-mono text-[10px] text-blue-400 mt-1 block">
                      Tool: {step.toolName}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F172E] border border-blue-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Create New Orchestrated Task</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit Q4 SaaS overhead and cancel dormant licenses"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Detailed Instruction</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide precise objectives, constraints, and target websites/tools..."
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Subagent</label>
                <select
                  value={newAgent}
                  onChange={(e) => setNewAgent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Browser Agent">Browser Agent (Sandboxed Playwright)</option>
                  <option value="Research Agent">Research Agent (Public Information)</option>
                  <option value="Email Agent">Email Agent (Gmail & Messages)</option>
                  <option value="Calendar Agent">Calendar Agent (Events & Scheduling)</option>
                  <option value="Security Sentinel & Finance Agent">Security Sentinel & Finance Agent</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Start Execution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
