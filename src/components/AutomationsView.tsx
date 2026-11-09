import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Clock,
  CheckCircle2,
  Calendar,
  X,
  History,
} from 'lucide-react';
import { createAutomation, toggleAutomation, runAutomation, deleteAutomation } from '../api/client';

interface AutomationsViewProps {
  automations: any[];
  onRefresh: () => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({
  automations,
  onRefresh,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [instruction, setInstruction] = useState('');
  const [frequency, setFrequency] = useState('Daily at 8:00 AM');
  const [targetApp, setTargetApp] = useState('Gmail & Google Calendar');
  const [runningId, setRunningId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createAutomation(name.trim(), instruction.trim(), frequency, targetApp);
    setName('');
    setInstruction('');
    setShowModal(false);
    onRefresh();
  };

  const handleToggle = async (id: string) => {
    await toggleAutomation(id);
    onRefresh();
  };

  const handleRun = async (id: string) => {
    setRunningId(id);
    await runAutomation(id);
    setTimeout(() => {
      setRunningId(null);
      onRefresh();
    }, 800);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this scheduled automation?')) {
      await deleteAutomation(id);
      onRefresh();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-teal-400" />
            Automation Center
          </h1>
          <p className="text-xs text-slate-400">
            Persistent scheduled jobs executing on backend without requiring open browser tab
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Automation
        </button>
      </div>

      {/* Automations List */}
      <div className="flex-1 overflow-y-auto space-y-3.5">
        {automations.map((auto) => {
          const isRunning = runningId === auto.id;

          return (
            <div
              key={auto.id}
              className={`p-4 rounded-2xl bg-[#0F172E] border transition-all space-y-3 ${
                auto.isActive ? 'border-slate-800 hover:border-teal-500/40' : 'border-slate-800/40 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{auto.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Target: {auto.targetApp} • Schedule: {auto.frequencyLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      auto.isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {auto.isActive ? 'Scheduled Active' : 'Paused'}
                  </span>

                  <button
                    onClick={() => handleToggle(auto.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title={auto.isActive ? 'Pause Automation' : 'Resume Automation'}
                  >
                    {auto.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleRun(auto.id)}
                    disabled={isRunning}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{isRunning ? 'Running...' : 'Run Now'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(auto.id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                    title="Delete Automation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Natural Language Instruction */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-mono">
                "{auto.naturalInstruction}"
              </div>

              {/* Execution History Stream */}
              {auto.executionHistory?.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-slate-800/80 text-[11px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Execution Log
                  </span>
                  {auto.executionHistory.slice(0, 2).map((h: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/50">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {h.summary}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">{h.runAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Automation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F172E] border border-teal-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Create Scheduled Automation</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Automation Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily VIP Morning Briefing"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Natural Language Instruction</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Every morning at 8 AM, check my calendar and summarize my meetings and unread VIP emails."
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Daily at 8:00 AM">Daily at 8:00 AM</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Weekly on Monday">Weekly on Monday</option>
                  <option value="Weekdays at 9:00 AM">Weekdays at 9:00 AM</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Application</label>
                <input
                  type="text"
                  value={targetApp}
                  onChange={(e) => setTargetApp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold"
                >
                  Save & Register Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
