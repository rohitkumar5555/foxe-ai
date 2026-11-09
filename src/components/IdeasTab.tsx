import React from 'react';
import {
  Lightbulb,
  Sparkles,
  ArrowRight,
  X,
  TrendingDown,
  Clock,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { IdeaItem } from '../types';
import { calculatePotentialSavings } from '../utils/agentEngine';

interface IdeasTabProps {
  ideas: IdeaItem[];
  onExecuteIdea: (idea: IdeaItem) => void;
  onDismissIdea: (ideaId: string) => void;
}

export const IdeasTab: React.FC<IdeasTabProps> = ({
  ideas,
  onExecuteIdea,
  onDismissIdea,
}) => {
  const activeIdeas = ideas.filter((i) => !i.isDismissed);
  const potentialSavings = calculatePotentialSavings(activeIdeas);

  const getBadgeStyle = (badge: IdeaItem['badge']) => {
    switch (badge) {
      case 'high_savings':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'time_saver':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'optimization':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-slate-100 overflow-y-auto px-4 py-4 space-y-4">
      {/* Header with Potential Savings metric */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-400" />
            Ideas
          </h2>
          <p className="text-xs text-slate-400">
            Proactive suggestions based on your data and habits
          </p>
        </div>
        {potentialSavings > 0 && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-right">
            <span className="block text-[10px] text-emerald-300 uppercase font-semibold">Identified</span>
            <span className="text-xs font-bold text-emerald-400">${potentialSavings}+ Savings</span>
          </div>
        )}
      </div>

      {/* Ideas Cards List */}
      <div className="space-y-3">
        {activeIdeas.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            No active ideas right now. Muse is scanning connected accounts in the background.
          </div>
        ) : (
          activeIdeas.map((idea) => (
            <div
              key={idea.id}
              className="rounded-2xl bg-[#121724] border border-white/5 p-4 shadow-sm hover:border-blue-500/30 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getBadgeStyle(
                      idea.badge
                    )}`}
                  >
                    {idea.badge.replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    via {idea.sourceConnector}
                  </span>
                </div>

                <button
                  onClick={() => onDismissIdea(idea.id)}
                  aria-label={`Dismiss idea ${idea.title}`}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5"
                  title="Dismiss suggestion"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-white">{idea.title}</h3>
                  <span className="text-xs font-semibold text-emerald-400">{idea.impact}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {idea.description}
                </p>
              </div>

              {/* Action Trigger */}
              <div className="pt-2 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => onExecuteIdea(idea)}
                  aria-label={`Execute idea: ${idea.suggestedPrompt}`}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Tell Muse to do this</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
