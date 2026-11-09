import React, { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Globe,
  Sliders,
  Shield,
  Smartphone,
  Save,
  Trash2,
  LogOut,
  CheckCircle2,
  Key,
} from 'lucide-react';
import { updateProfile } from '../api/client';

interface SettingsViewProps {
  user: any;
  onRefresh: () => void;
  onRequestSignOut: () => void;
  onDisconnectGmail?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onRefresh,
  onRequestSignOut,
  onDisconnectGmail,
}) => {
  const [name, setName] = useState(user?.fullName || user?.name || 'Authorized User');
  const [email, setEmail] = useState(user?.email || 'user@gmail.com');
  // Asia/Kolkata default as explicitly required
  const [timezone, setTimezone] = useState(user?.timezone || user?.preferences?.timezone || 'Asia/Kolkata');
  const [language, setLanguage] = useState(user?.language || user?.preferences?.language || 'English (US)');
  const [approvalMode, setApprovalMode] = useState(user?.approvalMode || user?.preferences?.approvalMode || 'HIGH_RISK_ONLY');
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled !== false);
  const [memoryEnabled, setMemoryEnabled] = useState(user?.memoryEnabled !== false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        fullName: name,
        email,
        timezone,
        language,
        approvalMode,
        memoryEnabled,
        notificationsEnabled,
        preferences: {
          timezone,
          language,
          approvalMode,
        },
      });
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
      onRefresh();
    } catch (err) {
      console.error('Failed to update profile settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-300" />
            Settings & Profile
          </h1>
          <p className="text-xs text-slate-400">
            Account identity, agent execution autonomy boundaries, and interface preferences
          </p>
        </div>

        {savedNotice && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
            Changes Saved
          </span>
        )}
      </div>

      {/* Main Settings Body */}
      <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-5 max-w-3xl pr-1">
        {/* User Identity Section */}
        <div className="p-5 rounded-2xl bg-[#0F172E] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <User className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">User Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Agent Autonomy & Security Sentinel Rules */}
        <div className="p-5 rounded-2xl bg-[#0F172E] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Agent Autonomy & Approval Gates</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Sentinel Gate Enforcement Policy
              </label>
              <select
                value={approvalMode}
                onChange={(e) => setApprovalMode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="HIGH_RISK_ONLY">
                  High-Risk Only (Strict: Require approval for payments, emails, deletions)
                </option>
                <option value="ALWAYS_ASK">
                  Maximum Security (Require human approval for every external tool call)
                </option>
                <option value="AUTONOMOUS">
                  Full Autonomous (Execute and notify after completion)
                </option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-semibold text-white block">Persistent Memory Engine</span>
                <span className="text-[10px] text-slate-400">
                  Allow FOXE agent to remember project contexts, tool preferences, and routines
                </span>
              </div>
              <input
                type="checkbox"
                checked={memoryEnabled}
                onChange={(e) => setMemoryEnabled(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-semibold text-white block">Real-time Task Notifications</span>
                <span className="text-[10px] text-slate-400">
                  Receive alerts when long-running background tasks or automations finish
                </span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Regional & Localization */}
        <div className="p-5 rounded-2xl bg-[#0F172E] border border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <Globe className="w-4 h-4 text-teal-400" />
            <h3 className="font-bold text-sm text-white">Localization & System</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">System Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="Asia/Kolkata">India Standard Time (IST, UTC+05:30)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada, UTC-08:00)</option>
                <option value="America/New_York">Eastern Time (US & Canada, UTC-05:00)</option>
                <option value="Europe/London">London (GMT/BST, UTC+00:00)</option>
                <option value="Asia/Tokyo">Tokyo (JST, UTC+09:00)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="English (US)">English (US)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="English (UK)">English (UK)</option>
                <option value="Japanese">Japanese (日本語)</option>
                <option value="Spanish">Spanish (Español)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>

        {/* Danger Zone */}
        <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-3">
          <h3 className="font-bold text-xs text-rose-400 uppercase tracking-wider">Danger Zone</h3>
          <p className="text-xs text-slate-400">
            Actions here affect all stored agent credentials and active cloud sessions.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onRequestSignOut}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out & Disconnect Session
            </button>

            {onDisconnectGmail && (
              <button
                type="button"
                onClick={onDisconnectGmail}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Disconnect Gmail Account Only
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
