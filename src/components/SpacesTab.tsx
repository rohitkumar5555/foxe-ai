import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Play,
  ShieldCheck,
  Sunrise,
  Plane,
  Activity,
  Sparkles,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { SpaceItem } from '../types';

interface SpacesTabProps {
  spaces: SpaceItem[];
  onCreateSpace: (title: string, description: string, category: SpaceItem['category']) => void;
  onRunRoutine: (space: SpaceItem) => void;
}

export const SpacesTab: React.FC<SpacesTabProps> = ({
  spaces,
  onCreateSpace,
  onRunRoutine,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<SpaceItem['category']>('productivity');
  const [routineRunningId, setRoutineRunningId] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Sunrise':
        return <Sunrise className="w-5 h-5 text-amber-400" />;
      case 'Plane':
        return <Plane className="w-5 h-5 text-blue-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-rose-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  const handleRun = (space: SpaceItem) => {
    setRoutineRunningId(space.id);
    onRunRoutine(space);
    setTimeout(() => {
      setRoutineRunningId(null);
    }, 1800);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateSpace(newTitle.trim(), newDesc.trim() || 'Custom automated Space created with Meta Muse prompt.', newCategory);
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-slate-100 overflow-y-auto px-4 py-4 space-y-4">
      {/* Hero Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Spaces
          </h2>
          <p className="text-xs text-slate-400">
            Mini-apps and autonomous routines built with natural language
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          aria-label="Create a new Space"
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Space
        </button>
      </div>

      {/* Spaces List */}
      <div className="grid grid-cols-1 gap-3.5">
        {spaces.map((space) => {
          const isRunning = routineRunningId === space.id;

          return (
            <div
              key={space.id}
              className={`rounded-2xl bg-gradient-to-br from-[#121724] to-[#0D121D] border p-4 transition-all hover:border-blue-500/40 relative overflow-hidden ${space.gradient}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                    {getIcon(space.icon)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-white">{space.title}</h3>
                      {space.isCustom && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      {space.stats}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleRun(space)}
                  disabled={isRunning}
                  aria-label={`Run routine for ${space.title}`}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 border border-white/5 shrink-0"
                >
                  {isRunning ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                      <span>Run</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                {space.description}
              </p>

              {/* Tags and stats footer */}
              <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {space.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span>Last run: {space.lastRun}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Space with AI Prompt */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121724] border border-blue-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-white">Create Space with Muse</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Space Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Freelance Invoicing & Tax Estimator"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  What should this Space automate? (Prompt)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Scan Gmail every Friday for completed client deliverables, calculate 15% estimated self-employment tax, and draft payment receipts."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="productivity">Productivity & Automation</option>
                  <option value="finance">Finance & Auditing</option>
                  <option value="wellness">Health & Wellness</option>
                  <option value="travel">Travel & Transit</option>
                  <option value="shopping">Shopping & Deals</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold"
                >
                  Build Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
