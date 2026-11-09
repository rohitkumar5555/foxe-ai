import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Square,
  RotateCw,
  Plus,
  History,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Bot,
  ShieldAlert,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Mail,
} from 'lucide-react';
import { sendChatMessage, sendFeedback, fetchConversations } from '../api/client';

interface AssistantViewProps {
  conversations: any[];
  currentConversationId: string;
  messages: any[];
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRefreshMessages: () => void;
  onNavigateToSecurity: () => void;
  onNavigateToBrowser: () => void;
  onOpenSendEmailModal?: (data: { recipient?: string; subject?: string; message?: string }) => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  conversations,
  currentConversationId,
  messages,
  onSelectConversation,
  onNewConversation,
  onRefreshMessages,
  onNavigateToSecurity,
  onNavigateToBrowser,
  onOpenSendEmailModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: number; text: string } | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Real Speech Recognition
  const toggleMic = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your command.');
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

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setInputText(text);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech error:', err);
      setIsListening(false);
    }
  };

  // Handle Attach File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      setAttachedFile({
        name: file.name,
        size: file.size,
        text: text.slice(0, 1000), // First 1000 chars for context
      });
    };
    reader.readAsText(file);
  };

  // Send Command
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let textToSend = inputText.trim();
    if (!textToSend && attachedFile) {
      textToSend = `Analyze attached document: "${attachedFile.name}"`;
    }
    if (!textToSend || isProcessing) return;

    if (attachedFile) {
      textToSend += `\n[Attached Context: ${attachedFile.name} (${attachedFile.size} bytes)]\n${attachedFile.text}`;
    }

    setInputText('');
    setAttachedFile(null);
    setIsProcessing(true);

    try {
      await sendChatMessage(textToSend, currentConversationId);
      onRefreshMessages();
    } catch (err: any) {
      alert(`Execution Error: ${err.message || 'Failed'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy response
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Feedback rating
  const handleFeedback = async (id: string, rating: 'like' | 'dislike') => {
    await sendFeedback(id, rating);
    onRefreshMessages();
  };

  const toggleStepDetails = (id: string) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden relative">
      {/* Assistant Header */}
      <div className="px-4 py-3 bg-[#0A1124] border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>FOXE Multi-Agent Assistant</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-[10px] text-slate-400">
              Orchestrating Research, Browser, Email & Sentinel subagents
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            aria-label="Conversation History"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
            title="Conversation History"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">History</span>
          </button>

          <button
            onClick={onNewConversation}
            aria-label="New Conversation"
            className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* History Drawer Overlay */}
      {showHistoryDrawer && (
        <div className="absolute inset-y-0 right-0 w-72 bg-[#0A1124] border-l border-slate-800 shadow-2xl z-30 flex flex-col p-4 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Conversation History
            </h3>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 py-3">
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelectConversation(c.id);
                  setShowHistoryDrawer(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all ${
                  c.id === currentConversationId
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="truncate">{c.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {msg.sender === 'user' ? (
              <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-gradient-to-r from-[#0066FF] to-[#0052CC] p-3.5 text-white text-xs sm:text-sm shadow-md">
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className="block text-[9px] text-blue-200/70 mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ) : (
              <div className="max-w-[95%] sm:max-w-[85%] space-y-3">
                {/* Agent Header Tag */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <span className="font-semibold text-slate-200">
                    {msg.planData?.targetAgent || 'FOXE Agent'}
                  </span>
                  <span>•</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Main Content Bubble */}
                <div className="rounded-2xl rounded-tl-sm bg-[#0F172E] border border-slate-800 p-4 text-xs sm:text-sm text-slate-200 shadow-sm leading-relaxed space-y-3">
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Plan & Step Breakdown Accordion */}
                  {msg.planData?.steps && msg.planData.steps.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => toggleStepDetails(msg.id)}
                        className="flex items-center justify-between w-full text-xs text-blue-400 font-medium hover:text-blue-300 py-1"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Execution Plan ({msg.planData.steps.length} steps)</span>
                        </span>
                        {expandedSteps[msg.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {expandedSteps[msg.id] && (
                        <div className="mt-2 space-y-1.5 bg-[#070D1C] p-2.5 rounded-xl border border-slate-800 text-xs">
                          {msg.planData.steps.map((st: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-slate-300">
                              <span className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] text-slate-500">{idx + 1}.</span>
                                <span>{st.title}</span>
                              </span>
                              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                {st.tool}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Verified Tool Invocations */}
                  {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                    <div className="bg-[#070D1C] rounded-xl p-2.5 border border-slate-800/80 space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Verified Execution Results
                      </span>
                      {msg.toolInvocations.map((inv: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                          <span className="text-blue-400 font-semibold">{inv.tool}:</span>
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> VERIFIED ({inv.executionMs}ms)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Security Sentinel Gate Trigger Card */}
                  {msg.verifiedResult?.status === 'AWAITING_APPROVAL' && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold text-amber-400">
                          <ShieldAlert className="w-4 h-4" />
                          Security Sentinel Held Action
                        </span>
                        <button
                          onClick={onNavigateToSecurity}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors"
                        >
                          Review in Security Center
                        </button>
                      </div>
                      <p className="text-slate-300">
                        This operation involves external modification or financial commitment. Sentinel requires explicit user review.
                      </p>
                    </div>
                  )}

                  {/* Action Bar: Copy & Feedback */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-white flex items-center gap-1 transition-colors"
                        title="Copy Response"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[11px]">{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      <span className="text-slate-700">|</span>

                      <button
                        onClick={() => handleFeedback(msg.id, 'like')}
                        className={`hover:text-white transition-colors ${
                          msg.feedbackRating === 'like' ? 'text-emerald-400 font-bold' : ''
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'dislike')}
                        className={`hover:text-white transition-colors ${
                          msg.feedbackRating === 'dislike' ? 'text-rose-400 font-bold' : ''
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {msg.taskId && (
                      <span className="font-mono text-[10px] text-slate-500">
                        Task #{msg.taskId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3.5 py-2 w-fit animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin text-blue-400" />
            <span>FOXE is planning atomic steps & verifying tool permissions...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attached File Preview Chip */}
      {attachedFile && (
        <div className="px-4 py-2 bg-[#0A1124] border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-white">{attachedFile.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">({attachedFile.size} bytes)</span>
          </div>
          <button
            onClick={() => setAttachedFile(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input Composer Area */}
      <form onSubmit={handleSend} className="p-3 bg-[#0A1124] border-t border-slate-800">
        <div className="flex items-center gap-2 bg-[#070D1C] rounded-2xl px-3 py-2 border border-slate-700/80 focus-within:border-blue-500 transition-colors">
          {/* File Picker */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".txt,.pdf,.csv,.json,.md"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach File"
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Attach Document or Data"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Quick Real Email Dispatcher */}
          {onOpenSendEmailModal && (
            <button
              type="button"
              onClick={() => onOpenSendEmailModal({
                recipient: 'rohitmohitrajkumarnagar@gmail.com',
                subject: 'Message from FOXE AI Agent',
                message: inputText || 'Hello Rohit,\n\nThis is a real email sent directly via the official Gmail API.',
              })}
              aria-label="Dispatch Real Email"
              className="p-1.5 text-slate-400 hover:text-blue-400 transition-colors"
              title="Compose & Send Real Email (Choose Sender)"
            >
              <Mail className="w-4 h-4" />
            </button>
          )}

          {/* Natural Language Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? 'Listening to voice...' : 'Type natural language command or instruction...'}
            className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none py-1"
          />

          {/* Voice Microphone */}
          <button
            type="button"
            onClick={toggleMic}
            aria-label={isListening ? 'Stop listening' : 'Record voice command'}
            className={`p-1.5 rounded-full transition-all ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                : 'text-slate-400 hover:text-blue-400'
            }`}
            title="Voice Command"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Stop Button */}
          {isProcessing && (
            <button
              type="button"
              onClick={() => setIsProcessing(false)}
              aria-label="Stop Execution"
              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors"
              title="Stop Task"
            >
              <Square className="w-4 h-4" />
            </button>
          )}

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !attachedFile) || isProcessing}
            aria-label="Send Command"
            className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-40 text-white font-medium transition-all hover:scale-105 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
