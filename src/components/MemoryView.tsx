import React, { useState } from 'react';
import {
  Brain,
  Plus,
  Trash2,
  Search,
  Shield,
  Check,
  X,
  Target,
  Sliders,
  Briefcase,
  FileText,
} from 'lucide-react';
import { addMemory, deleteMemory } from '../api/client';

interface MemoryViewProps {
  memories: any[];
  onRefresh: () => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({ memories, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState<'preference' | 'goal' | 'project' | 'context'>('preference');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [memoryEnabled, setMemoryEnabled] = useState(true);

  const filtered = memories.filter(
    (m) =>
      !searchQuery ||
      m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !value.trim()) return;
    await addMemory(category, key.trim(), value.trim());
    setKey('');
    setValue('');
    setShowAddModal(false);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this memory record?')) {
      await deleteMemory(id);
      onRefresh();
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'preference':
        return <Sliders className="w-4 h-4 text-blue-400" />;
      case 'goal':
        return <Target className="w-4 h-4 text-emerald-400" />;
      case 'project':
        return <Briefcase className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            Personal Memory & Context Store
          </h1>
          <p className="text-xs text-slate-400">
            User-approved preferences and long-term project parameters
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Disable / Enable Memory Toggle Button (Part 10 requirement) */}
          <button
            onClick={() => setMemoryEnabled(!memoryEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              memoryEnabled
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {memoryEnabled ? 'Memory Active' : 'Memory Disabled'}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            disabled={!memoryEnabled}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Memory
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative shrink-0">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stored preferences, goals, or project context..."
          className="w-full bg-[#0F172E] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Memory Cards Grid */}
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-2xl bg-[#0F172E] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                    {getCategoryIcon(m.category)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {m.category}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  title="Delete Memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="font-bold text-sm text-white mt-2">{m.key}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                {m.value}
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="w-3 h-3" /> Approved by User
              </span>
              <span>{new Date(m.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F172E] border border-blue-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Save Approved Memory</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="preference">User Preference (Airline, Tone, Schedule)</option>
                  <option value="goal">Personal Goal (Savings target, Health)</option>
                  <option value="project">Active Project Context</option>
                  <option value="context">General Background Context</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Key / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flight Seat Preference"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Memory Value</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Always select forward window seat (Rows 10-18) on long flights"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
