import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Monitor,
  Mic,
  MicOff,
  Check,
  X,
  Plane,
  CreditCard,
  Tag,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage } from '../types';

interface FeedTabProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onApproveAction: (approvalId: string) => void;
  onDeclineAction: (approvalId: string) => void;
  onOpenVm: () => void;
  isProcessing: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export const FeedTab: React.FC<FeedTabProps> = ({
  messages,
  onSendMessage,
  onApproveAction,
  onDeclineAction,
  onOpenVm,
  isProcessing,
  onSelectPrompt,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const starterCards = [
    {
      title: 'Book Flights to Tokyo',
      subtitle: 'Compare fares & hold seats in VM',
      icon: Plane,
      prompt: 'Find nonstop flights to Tokyo in November and hold the best seat',
      color: 'from-blue-600/20 to-blue-500/5 text-blue-400 border-blue-500/20',
    },
    {
      title: 'Audit Subscriptions',
      subtitle: 'Cancel inactive recurring bills',
      icon: CreditCard,
      prompt: 'Audit my active subscriptions and cancel unused ones',
      color: 'from-emerald-600/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    },
    {
      title: 'Track Price Drops',
      subtitle: 'Sony XM5 headphones discount',
      icon: Tag,
      prompt: 'Track price drops on Sony WH-1000XM5 across major stores',
      color: 'from-amber-600/20 to-amber-500/5 text-amber-400 border-amber-500/20',
    },
    {
      title: 'Create Custom Space',
      subtitle: 'Personal routine automation',
      icon: Layers,
      prompt: 'Build a custom Space for daily habit and expense tracking',
      color: 'from-purple-600/20 to-purple-500/5 text-purple-400 border-purple-500/20',
    },
  ];

  const toggleSteps = (msgId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Real Speech Recognition toggle
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  return (
    <div className="flex flex-col h-full bg-[#0B0E14] text-slate-100">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-3.5">
        {/* Clean Empty Starter Screen */}
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#0866FF] via-[#8B5CF6] to-[#06B6D4] p-[2px] shadow-[0_0_30px_rgba(8,102,255,0.3)] animate-muse-pulse">
                <div className="w-full h-full bg-[#0B0E14] rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#465FFF]" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">
                What can I do for you?
              </h2>
              <p className="text-xs text-slate-400">
                Ask Muse to execute tasks, track deals, or manage accounts.
              </p>
            </div>

            {/* Starter action chips */}
            <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm text-left">
              {starterCards.map((card) => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.title}
                    onClick={() => onSelectPrompt(card.prompt)}
                    className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} border hover:border-blue-500/40 transition-all flex flex-col justify-between h-24 group text-left`}
                  >
                    <Icon className="w-4 h-4" />
                    <div>
                      <h4 className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {card.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {card.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {msg.sender === 'user' ? (
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-white text-xs sm:text-sm shadow-md">
                  <p className="leading-relaxed">{msg.content}</p>
                  <span className="block text-[9px] text-blue-200/70 mt-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              ) : (
                <div className="max-w-[95%] sm:max-w-[90%] space-y-2">
                  {/* Clean Muse Bubble */}
                  <div className="rounded-2xl rounded-tl-sm bg-[#131722] border border-white/5 p-3 text-xs sm:text-sm text-slate-200 shadow-sm leading-relaxed">
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Compact Autonomous Steps dropdown */}
                    {msg.steps && msg.steps.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => toggleSteps(msg.id)}
                          className="flex items-center gap-1.5 text-[11px] text-blue-400 font-medium hover:text-blue-300"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>{msg.steps.length} background steps</span>
                          {expandedSteps[msg.id] ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {expandedSteps[msg.id] && (
                          <div className="mt-2 space-y-1.5 bg-[#0B0E14] p-2 rounded-xl border border-white/5 text-[11px]">
                            {msg.steps.map((step) => (
                              <div key={step.id} className="flex items-center justify-between text-slate-300">
                                <span className="truncate">{step.title}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {step.timestamp || 'done'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* VM Snapshot link */}
                    {msg.vmSnapshot && (
                      <button
                        onClick={onOpenVm}
                        className="mt-2 w-full flex items-center justify-between bg-blue-950/40 border border-blue-500/20 rounded-xl px-2.5 py-1.5 text-[11px] text-blue-300 hover:bg-blue-900/40 transition-colors"
                      >
                        <span className="flex items-center gap-1.5">
                          <Monitor className="w-3.5 h-3.5 text-blue-400" />
                          VM active on {msg.vmSnapshot.domain}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* "WITH YOUR OK" Compact Action Card */}
                  {msg.approvalRequest && (
                    <div className="w-full rounded-2xl bg-[#141A26] border border-amber-500/30 p-3 shadow-lg space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-[10px] uppercase font-bold text-amber-400">
                            With your OK
                          </span>
                        </div>
                        {msg.approvalRequest.amount && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-xs border border-emerald-500/20">
                            {msg.approvalRequest.amount}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold text-white">
                          {msg.approvalRequest.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {msg.approvalRequest.summary}
                        </p>
                      </div>

                      {/* Action buttons */}
                      {msg.approvalRequest.status === 'pending' ? (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => onApproveAction(msg.approvalRequest!.id)}
                            aria-label="Approve action"
                            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() => onDeclineAction(msg.approvalRequest!.id)}
                            aria-label="Decline action"
                            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl text-xs font-medium ${
                            msg.approvalRequest.status === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {msg.approvalRequest.status === 'approved' ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approved & completed</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5" />
                              <span>Declined</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-1.5 w-fit">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-400" />
            <span>Muse is working...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Pills (Only visible when conversation is active) */}
      {messages.length > 0 && (
        <div className="px-3 py-1.5 flex gap-1.5 overflow-x-auto no-scrollbar border-t border-white/5">
          {['Book flight to Tokyo', 'Audit subscriptions', 'Check deals', 'Create Space'].map(
            (prompt) => (
              <button
                key={prompt}
                onClick={() => onSelectPrompt(prompt)}
                className="px-2.5 py-1 rounded-full bg-[#131722] hover:bg-[#1A2130] text-[11px] text-slate-300 hover:text-white border border-white/5 whitespace-nowrap shrink-0 transition-colors"
              >
                {prompt}
              </button>
            )
          )}
        </div>
      )}

      {/* Message Composer Bar */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-[#0D111A] border-t border-white/5">
        <div className="flex items-center gap-2 bg-[#131722] rounded-2xl px-3 py-1.5 border border-white/10 focus-within:border-blue-500/50 transition-colors">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Listening...' : 'Ask Muse anything...'}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none py-1"
          />

          <button
            type="button"
            onClick={toggleSpeechRecognition}
            aria-label={isListening ? 'Stop listening' : 'Start voice dictation'}
            className={`p-1.5 rounded-full transition-colors ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                : 'text-slate-400 hover:text-blue-400'
            }`}
            title="Speech input"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            aria-label="Send prompt to Muse"
            className="p-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-40 text-white font-medium transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
