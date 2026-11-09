import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Bot,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { GoalItem } from '../types';
import { calculateGoalProgress } from '../utils/agentEngine';

interface GoalsTabProps {
  goals: GoalItem[];
  onToggleSubtask: (goalId: string, subtaskId: string) => void;
  onAddGoal: (title: string, category: GoalItem['category'], cadence: string, metric: string) => void;
}

export const GoalsTab: React.FC<GoalsTabProps> = ({
  goals,
  onToggleSubtask,
  onAddGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GoalItem['category']>('finance');
  const [newCadence, setNewCadence] = useState('Daily background check');
  const [newMetric, setNewMetric] = useState('Save $300');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddGoal(newTitle.trim(), newCategory, newCadence, newMetric);
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-slate-100 overflow-y-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Goals
          </h2>
          <p className="text-xs text-slate-400">
            Long-term objectives managed autonomously by Muse
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          aria-label="Add a new Goal"
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Goals Cards */}
      <div className="space-y-3.5">
        {goals.map((goal) => {
          const progress = calculateGoalProgress(goal.subtasks);

          return (
            <div
              key={goal.id}
              className="rounded-2xl bg-[#121724] border border-white/5 p-4 space-y-3 shadow-sm hover:border-blue-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {goal.category}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">
                      {goal.impactMetric}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white mt-1">{goal.title}</h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-lg font-extrabold text-blue-400">{progress}%</span>
                  <span className="block text-[10px] text-slate-400">Target: {goal.targetDate}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Subtasks breakdown */}
              <div className="bg-[#0B0E14]/70 rounded-xl p-3 border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/5">
                  <span className="flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                    Autonomous Cadence: {goal.autonomousCadence}
                  </span>
                  <span>
                    {goal.subtasks.filter((s) => s.completed).length} / {goal.subtasks.length} done
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {goal.subtasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onToggleSubtask(goal.id, task.id)}
                      aria-label={`Toggle subtask ${task.title}`}
                      className="w-full flex items-start gap-2 text-left py-1 px-1 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 group-hover:text-blue-400 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`flex-1 ${
                          task.completed
                            ? 'line-through text-slate-500'
                            : 'text-slate-300 font-medium'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.automatedByMuse && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 shrink-0">
                          Auto
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121724] border border-blue-500/30 rounded-2xl p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="font-bold text-sm text-white">Assign New Goal to Muse</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Save $1,200 on household energy & insurance"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
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
                  <option value="finance">Finance</option>
                  <option value="travel">Travel</option>
                  <option value="health">Health & Fitness</option>
                  <option value="career">Career</option>
                  <option value="lifestyle">Lifestyle</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Autonomous Cadence
                </label>
                <input
                  type="text"
                  value={newCadence}
                  onChange={(e) => setNewCadence(e.target.value)}
                  placeholder="e.g. Daily background VM check"
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Target Impact Metric
                </label>
                <input
                  type="text"
                  value={newMetric}
                  onChange={(e) => setNewMetric(e.target.value)}
                  placeholder="e.g. Save $1,200/yr"
                  className="w-full bg-[#0B0E14] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold"
                >
                  Activate Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
