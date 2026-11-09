import React, { useState } from 'react';
import { Mail, X, Send, CheckCircle2, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { authorizeGmail, getAccessToken } from '../lib/firebase';
import { sendDirectEmail, setAuthSession } from '../api/client';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: string;
  initialSubject?: string;
  initialMessage?: string;
  onSuccess?: () => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  initialRecipient = 'rohitmohitrajkumarnagar@gmail.com',
  initialSubject = 'Message from FOXE AI Agent',
  initialMessage = 'Hello Rohit,\n\nThis is a real email dispatched directly through FOXE AI Agent using the official Gmail API.\n\nBest regards,\nFOXE AI Agent',
  onSuccess,
}) => {
  const [senderEmail, setSenderEmail] = useState<string>('');
  const [recipient, setRecipient] = useState<string>(initialRecipient);
  const [subject, setSubject] = useState<string>(initialSubject);
  const [message, setMessage] = useState<string>(initialMessage);
  const [oauthToken, setOauthToken] = useState<string | null>(getAccessToken());
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    messageId: string;
    from: string;
    to: string;
    subject: string;
  } | null>(null);

  if (!isOpen) return null;

  // Trigger Google Account Picker so user can choose WHICH Google account to send FROM
  const handleSelectSenderAccount = async () => {
    try {
      setIsAuthorizing(true);
      setError(null);
      const authData = await authorizeGmail();
      if (!authData?.accessToken) {
        throw new Error('Google did not return an OAuth access token. Please select an account and approve Gmail permissions.');
      }

      setSenderEmail(authData.user.email);
      setOauthToken(authData.accessToken);

      // Sync to backend session
      await setAuthSession({
        email: authData.user.email,
        fullName: authData.user.displayName,
        avatarUrl: authData.user.photoURL,
        accessToken: authData.accessToken,
      });
    } catch (err: any) {
      console.error('Failed to select sender account:', err);
      setError(
        `Google Account Selection: ${err.message || 'Popup was cancelled or access denied'}\n\nTip: When Google shows "Google hasn't verified this app", click "Advanced" -> "Go to gen-lang-client-0525152265 (unsafe)" -> "Continue/Allow".`
      );
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipient.trim()) {
      setError('Please provide a recipient email address.');
      return;
    }

    if (!message.trim()) {
      setError('Please provide message content.');
      return;
    }

    // If no OAuth token yet, prompt user to select sender Google account first
    let token = oauthToken || getAccessToken();
    let currentSender = senderEmail;

    if (!token) {
      try {
        setIsAuthorizing(true);
        const authData = await authorizeGmail();
        if (!authData?.accessToken) {
          throw new Error('Google OAuth token is required to dispatch real emails.');
        }
        token = authData.accessToken;
        currentSender = authData.user.email;
        setSenderEmail(currentSender);
        setOauthToken(token);

        await setAuthSession({
          email: authData.user.email,
          fullName: authData.user.displayName,
          avatarUrl: authData.user.photoURL,
          accessToken: authData.accessToken,
        });
      } catch (authErr: any) {
        setError(`Please authorize a Google account to send this email: ${authErr.message}`);
        setIsAuthorizing(false);
        return;
      } finally {
        setIsAuthorizing(false);
      }
    }

    try {
      setIsSending(true);
      const res = await sendDirectEmail({
        from: currentSender || undefined,
        to: recipient.trim(),
        subject: subject.trim(),
        message: message.trim(),
        accessToken: token || undefined,
      });

      setSuccessData({
        messageId: res.messageId,
        from: res.from || currentSender || 'Your Connected Gmail',
        to: res.to,
        subject: res.subject,
      });

      if (onSuccess) onSuccess();
    } catch (sendErr: any) {
      console.error('Email send failed:', sendErr);
      setError(sendErr.message || 'Failed to dispatch email via Gmail API');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0F172E] border border-blue-500/40 rounded-2xl p-6 shadow-2xl text-slate-100 relative space-y-4 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Send Real Email via Gmail API</h2>
              <p className="text-[11px] text-slate-400">Official Gmail API dispatch directly from your chosen Google account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success View */}
        {successData ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Email Dispatched Successfully!</h3>
              <p className="text-xs text-slate-300 mt-1">
                The message was dispatched by Google's Gmail API and delivered to <strong className="text-emerald-400">{successData.to}</strong>.
              </p>
            </div>

            <div className="bg-[#070D1C] border border-slate-800 rounded-xl p-3.5 text-left text-xs font-mono space-y-1 text-slate-300">
              <div><span className="text-slate-500">Sent From:</span> <strong className="text-white">{successData.from}</strong></div>
              <div><span className="text-slate-500">Delivered To:</span> <strong className="text-emerald-300">{successData.to}</strong></div>
              <div><span className="text-slate-500">Subject:</span> <span className="text-slate-200">"{successData.subject}"</span></div>
              <div><span className="text-slate-500">Gmail Message ID:</span> <span className="text-blue-400">{successData.messageId}</span></div>
            </div>

            <p className="text-[11px] text-slate-400">
              Check the inbox of <strong>{successData.to}</strong> or the Sent folder of <strong>{successData.from}</strong> in Gmail!
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setSuccessData(null);
                  setMessage('');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Send Another Email
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4 text-xs">
            {/* 1. SENDER SELECTION (Choose WHICH email sends it) */}
            <div className="bg-[#070D1C] border border-slate-800/90 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300">
                  1. Sending From (Choose Gmail Account):
                </span>
                {oauthToken && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> OAuth Active
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                <div className="truncate">
                  <div className="text-[11px] text-slate-400">Active Sender:</div>
                  <div className="font-semibold text-white truncate">
                    {senderEmail || 'No sender account selected yet'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSelectSenderAccount}
                  disabled={isAuthorizing}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer shrink-0 disabled:opacity-60"
                >
                  <RefreshCw className={`w-3 h-3 ${isAuthorizing ? 'animate-spin' : ''}`} />
                  <span>{senderEmail ? 'Change Account' : 'Choose Google Account'}</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400">
                You can choose any of your Google accounts (e.g. your personal account or developer account). Google will ask for permission to send emails from that account.
              </p>
            </div>

            {/* Error display */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="whitespace-pre-line leading-relaxed">{error}</div>
              </div>
            )}

            {/* 2. RECIPIENT */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">2. Recipient Email (To):</label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setRecipient('rohitmohitrajkumarnagar@gmail.com')}
                    className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    rohitmohitrajkumarnagar@gmail.com
                  </button>
                </div>
              </div>
              <input
                type="email"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="recipient@gmail.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
            </div>

            {/* 3. SUBJECT */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">3. Subject:</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
              />
            </div>

            {/* 4. MESSAGE BODY */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">4. Message Body:</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your email message here..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs leading-relaxed"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending || isAuthorizing}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending via Gmail API...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Real Email via Gmail</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
