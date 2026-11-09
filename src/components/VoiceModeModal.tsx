import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles } from 'lucide-react';

interface VoiceModeModalProps {
  onClose: () => void;
  onSendVoiceQuery: (query: string) => void;
}

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  onClose,
  onSendVoiceQuery,
}) => {
  const [isListening, setIsListening] = useState(true);
  const [status, setStatus] = useState<'listening' | 'speaking'>('listening');
  const [transcript, setTranscript] = useState('Listening... Speak now');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const text = Array.from(event.results)
            .map((res: any) => res[0].transcript)
            .join('');
          setTranscript(text);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.warn('Speech recognition error:', e);
      }
    } else {
      // Fallback
      setTranscript('Listening... (Tap a voice action or speak)');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleExecute = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Got it. Executing in background VM.');
      window.speechSynthesis.speak(utterance);
    }
    onSendVoiceQuery(text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07090E]/95 backdrop-blur-xl flex flex-col justify-between items-center p-6 text-white animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between max-w-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-xs text-slate-300">Muse Voice</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Voice Mode"
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Meta AI Voice Visualizer Orb */}
      <div className="flex flex-col items-center justify-center space-y-6 my-auto text-center">
        <div className="relative flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#0866FF] via-[#8B5CF6] to-[#06B6D4] p-1 shadow-[0_0_40px_rgba(8,102,255,0.4)]">
            <div className="w-full h-full bg-[#0B0E14] rounded-full flex items-center justify-center overflow-hidden">
              <div className="flex items-center gap-1.5 h-10">
                {[40, 75, 100, 60, 85, 50, 95].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-blue-500 to-cyan-300 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 max-w-xs px-4">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isListening ? 'Listening' : 'Ready'}
          </span>
          <p className="text-sm text-slate-200 font-medium">
            {transcript || 'Say something...'}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 pb-4">
        <button
          onClick={() => handleExecute(transcript.startsWith('Listening') ? 'Check my flights to Tokyo' : transcript)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold text-xs shadow-md transition-all active:scale-95"
        >
          Execute Command
        </button>
        <button
          onClick={onClose}
          aria-label="Exit voice"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
