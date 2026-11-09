import React, { useState } from 'react';
import { googleSignIn } from '../lib/firebase';
import { setAuthSession } from '../api/client';
import { Shield, Sparkles, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDirectLogin, setShowDirectLogin] = useState(false);
  const [directEmail, setDirectEmail] = useState('rohitmohitrajkumarnagar@gmail.com');
  const [directName, setDirectName] = useState('Rohit');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Trigger Google Auth popup with standard profile scopes
      // (Restricted Gmail scopes are decoupled to prevent Google Error 403 verification blocker)
      const authData = await googleSignIn();

      // 2. Synchronize verified account and access token to server session store
      const sessionRes = await setAuthSession({
        email: authData.user.email,
        fullName: authData.user.displayName,
        avatarUrl: authData.user.photoURL,
        accessToken: authData.accessToken,
      });

      // 3. Complete authentication and redirect to dashboard
      onLoginSuccess(sessionRes.user || authData.user);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      const errMsg = err?.message || '';
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-In popup was closed. Please try again or use Direct Sign-In below.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups or use Direct Sign-In below.');
      } else if (errMsg.includes('403') || errMsg.includes('access_denied') || errMsg.includes('verification') || err.code === 'auth/access-denied') {
        setError(
          'Google Cloud OAuth is currently in "Testing" mode on the Google Cloud Console. Restricted/unverified accounts (like institutional emails) are blocked by Google until added as Test Users. You can use Direct Sign-In below to immediately access your account!'
        );
        setShowDirectLogin(true);
      } else {
        setError(err.message || 'Failed to authenticate with Google. You can sign in directly below.');
        setShowDirectLogin(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!directEmail.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const sessionRes = await setAuthSession({
        email: directEmail.trim(),
        fullName: directName.trim() || directEmail.split('@')[0],
      });
      onLoginSuccess(sessionRes.user);
    } catch (err: any) {
      console.error('Direct sign-in error:', err);
      setError(err.message || 'Direct sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1C] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
      {/* Background aesthetic glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#0F172E]/90 border border-slate-800/80 rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 mb-4 border border-blue-400/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            FOXE <span className="text-blue-500">AI AGENT</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">Autonomous Personal AI Executive & Task Agent</p>
        </div>

        {/* Sentinel Architecture Badges */}
        <div className="bg-[#0A1124] border border-slate-800 rounded-xl p-4 mb-6 space-y-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Standard Google OAuth 2.0 (Fast & Unrestricted)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>On-Demand Gmail API Connector (`gmail.send`)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Persistent Background Queue & Crash Recovery</span>
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {/* Google Sign In Action */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          type="button"
          className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 font-medium rounded-xl flex items-center justify-center gap-3 transition-all duration-150 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer active:scale-[0.99]"
        >
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Authenticating with Google...</span>
            </div>
          ) : (
            <>
              {/* Official Google G Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="text-sm font-semibold tracking-tight">Sign in with Google</span>
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0F172E] px-2 text-slate-400">or</span>
          </div>
        </div>

        {/* Direct Sign-In toggle / form */}
        {!showDirectLogin ? (
          <button
            onClick={() => setShowDirectLogin(true)}
            type="button"
            className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-colors border border-slate-700/60 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>Sign in directly with your email (Bypass Google Test Block)</span>
          </button>
        ) : (
          <form onSubmit={handleDirectLogin} className="space-y-3 bg-[#0A1124] p-4 rounded-xl border border-slate-800">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Your Email</label>
              <input
                type="email"
                required
                value={directEmail}
                onChange={(e) => setDirectEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Your Name</label>
              <input
                type="text"
                value={directName}
                onChange={(e) => setDirectName(e.target.value)}
                placeholder="Rohit"
                className="w-full h-9 bg-slate-900 border border-slate-700 rounded-lg px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Continue to FOXE AI Agent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* Quick Developer Access */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setDirectEmail('rohitmohitrajkumarnagar@gmail.com');
              setDirectName('Rohit');
              handleDirectLogin();
            }}
            type="button"
            className="text-[11px] text-blue-400 hover:text-blue-300 underline underline-offset-4 cursor-pointer transition-colors"
          >
            Quick Access as Rohit (rohitmohitrajkumarnagar@gmail.com)
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            By signing in, you grant FOXE AI Sentinel access to orchestrate your tasks and send authorized emails on your behalf upon confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};
