import React from 'react';
import {
  Sparkles,
  Mic,
  Monitor,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  onOpenVoice: () => void;
  onOpenVm: () => void;
  onResetChat?: () => void;
  vmActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVoice,
  onOpenVm,
  onResetChat,
  vmActive,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0B0E14]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between transition-colors">
      {/* Brand & Meta identity */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0866FF] via-[#8B5CF6] to-[#06B6D4] p-[1.5px] flex items-center justify-center shadow-sm">
            <div className="w-full h-full bg-[#0B0E14] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#465FFF]" />
            </div>
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-[#0B0E14]" />
        </div>

        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <h1 className="font-bold text-sm tracking-tight text-white">Muse</h1>
            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Meta
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Autonomous Agent
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        {/* Reset / New Chat */}
        {onResetChat && (
          <button
            onClick={onResetChat}
            aria-label="Start New Chat"
            title="New Conversation"
            className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* VM Inspector Trigger */}
        <button
          onClick={onOpenVm}
          aria-label="Inspect Secure Virtual Machine"
          className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-white/5 transition-all"
        >
          <Monitor className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px]">VM</span>
          {vmActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        {/* Voice Mode */}
        <button
          onClick={onOpenVoice}
          aria-label="Start Voice Mode with Meta Muse"
          className="p-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-sm shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
          title="Talk with Muse"
        >
          <Mic className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
