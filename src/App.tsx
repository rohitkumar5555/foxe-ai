import React, { useState, useEffect, useCallback } from 'react';
import {
  Sidebar,
  FoxeSection,
} from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { AssistantView } from './components/AssistantView';
import { TasksView } from './components/TasksView';
import { BrowserAgentView } from './components/BrowserAgentView';
import { ConnectedAppsView } from './components/ConnectedAppsView';
import { AutomationsView } from './components/AutomationsView';
import { FilesView } from './components/FilesView';
import { MemoryView } from './components/MemoryView';
import { NotificationsView } from './components/NotificationsView';
import { DeviceManagerView } from './components/DeviceManagerView';
import { SecurityCenterView } from './components/SecurityCenterView';
import { ActivityHistoryView } from './components/ActivityHistoryView';
import { SettingsView } from './components/SettingsView';
import { WorkspaceModal } from './components/WorkspaceModal';
import { LoginView } from './components/LoginView';
import { SendEmailModal } from './components/SendEmailModal';
import {
  fetchDashboard,
  fetchConversations,
  fetchTasks,
  fetchConnectedApps,
  fetchAutomations,
  fetchFiles,
  fetchMemories,
  fetchNotifications,
  fetchDevices,
  fetchSecurity,
  fetchActivityHistory,
  fetchProfile,
  fetchWorkspace,
  sendChatMessage,
  fetchAuthSession,
  logoutAuthSession,
  disconnectApp,
} from './api/client';
import { signOutFirebase } from './lib/firebase';
import {
  Menu,
  X,
  Bell,
  Shield,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Search,
  LogOut,
  AlertTriangle,
  Mail,
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeSection, setActiveSection] = useState<FoxeSection>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailModalData, setEmailModalData] = useState<{
    recipient?: string;
    subject?: string;
    message?: string;
  }>({
    recipient: 'rohitmohitrajkumarnagar@gmail.com',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Core Data Stores from Local DB
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('conv-1');
  const [messages, setMessages] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [apps, setApps] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [securityData, setSecurityData] = useState<{
    approvals: any[];
    auditLogs: any[];
    permissions: any[];
  }>({
    approvals: [],
    auditLogs: [],
    permissions: [],
  });
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [workspaceInfo, setWorkspaceInfo] = useState<any>(null);

  // Master Synchronizer
  const loadAllData = useCallback(async () => {
    try {
      const [
        dash,
        convs,
        tsks,
        conApps,
        autos,
        fls,
        mems,
        notifs,
        devs,
        sec,
        logs,
        prof,
        ws,
      ] = await Promise.all([
        fetchDashboard().catch(() => null),
        fetchConversations().catch(() => []),
        fetchTasks().catch(() => []),
        fetchConnectedApps().catch(() => []),
        fetchAutomations().catch(() => []),
        fetchFiles().catch(() => []),
        fetchMemories().catch(() => []),
        fetchNotifications().catch(() => []),
        fetchDevices().catch(() => []),
        fetchSecurity().catch(() => ({ approvals: [], auditLogs: [], permissions: [] })),
        fetchActivityHistory().catch(() => []),
        fetchProfile().catch(() => null),
        fetchWorkspace().catch(() => null),
      ]);

      if (dash) setDashboardData(dash);
      if (convs?.length) {
        setConversations(convs);
        // Find current or first conversation's messages
        const active = convs.find((c: any) => c.id === currentConversationId) || convs[0];
        if (active) {
          setCurrentConversationId(active.id);
          setMessages(active.messages || []);
        }
      }
      if (tsks) setTasks(tsks);
      if (conApps) setApps(conApps);
      if (autos) setAutomations(autos);
      if (fls) setFiles(fls);
      if (mems) setMemories(mems);
      if (notifs) setNotifications(notifs);
      if (devs) setDevices(devs);
      if (sec) setSecurityData(sec);
      if (logs) setActivityLogs(logs);
      if (prof) setUserProfile(prof);
      if (ws) setWorkspaceInfo(ws);
    } catch (err) {
      console.error('Data synchronization failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId]);

  // Authenticate session on load
  useEffect(() => {
    fetchAuthSession()
      .then((sess) => {
        if (sess?.isAuthenticated) {
          setIsAuthenticated(true);
          loadAllData();
        } else {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
        setIsLoading(false);
      });
  }, [loadAllData]);

  // Sign out and disconnect session handler
  const handleConfirmLogout = async (disconnectGmail: boolean) => {
    try {
      setIsLoggingOut(true);
      await signOutFirebase().catch(() => {});
      if (disconnectGmail) {
        await disconnectApp('gmail').catch(() => {});
      }
      await logoutAuthSession().catch(() => {});
      setIsAuthenticated(false);
      setShowLogoutModal(false);
    } catch (err) {
      console.error('Logout error:', err);
      setIsAuthenticated(false);
      setShowLogoutModal(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle switching conversation
  const handleSelectConversation = (convId: string) => {
    setCurrentConversationId(convId);
    const selected = conversations.find((c) => c.id === convId);
    if (selected) {
      setMessages(selected.messages || []);
    }
  };

  // Handle new conversation
  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    const newConv = {
      id: newId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newId);
    setMessages([]);
  };

  // Quick Command Execution from Home Dashboard
  const handleQuickCommand = async (commandText: string) => {
    setActiveSection('assistant');
    try {
      await sendChatMessage(commandText, currentConversationId);
      await loadAllData();
    } catch (err) {
      console.error('Error executing quick command:', err);
    }
  };

  // Badge calculations from real records
  const pendingApprovalsCount = securityData.approvals.filter(
    (a) => a.status === 'PENDING'
  ).length;
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const activeTasksCount = tasks.filter(
    (t) => t.status === 'RUNNING' || t.status === 'WAITING_APPROVAL' || t.status === 'PENDING'
  ).length;

  if (isAuthenticated === null) {
    return (
      <div className="h-screen w-screen bg-[#070D1C] flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center animate-pulse mb-4">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-xs text-slate-400 font-medium tracking-wide">Initializing FOXE AI Agent Sentinel...</p>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <LoginView
        onLoginSuccess={(_user) => {
          setIsAuthenticated(true);
          loadAllData();
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#070D1C] text-slate-100 overflow-hidden font-sans select-none antialiased">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          activeSection={activeSection}
          onSelectSection={(sec) => setActiveSection(sec)}
          pendingApprovals={pendingApprovalsCount}
          unreadNotifications={unreadNotificationsCount}
          activeTasks={activeTasksCount}
          onOpenWorkspace={() => setShowWorkspaceModal(true)}
        />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[#0A1124] h-full flex flex-col shadow-2xl">
            <div className="p-3 flex justify-end border-b border-slate-800">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar
                activeSection={activeSection}
                onSelectSection={(sec) => {
                  setActiveSection(sec);
                  setMobileMenuOpen(false);
                }}
                pendingApprovals={pendingApprovalsCount}
                unreadNotifications={unreadNotificationsCount}
                activeTasks={activeTasksCount}
                onOpenWorkspace={() => {
                  setShowWorkspaceModal(true);
                  setMobileMenuOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Execution Surface */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Global Master Header */}
        <header className="h-14 px-4 sm:px-6 bg-[#0A1124] border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {activeSection.replace('_', ' ')}
              </span>
              <span className="hidden sm:inline-block text-[10px] text-slate-500 font-mono">
                / production
              </span>
            </div>
          </div>

          {/* Quick System Indicators */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sentinel Pill */}
            <button
              onClick={() => setActiveSection('security')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                pendingApprovalsCount > 0
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
              title="Security Sentinel Status"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {pendingApprovalsCount > 0
                  ? `${pendingApprovalsCount} Approval Required`
                  : 'Sentinel Active'}
              </span>
              {pendingApprovalsCount > 0 && (
                <span className="sm:hidden text-[10px] font-bold bg-amber-500 text-slate-950 px-1 rounded-full">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveSection('notifications')}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
              title="View Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Real Email Dispatch Button */}
            <button
              onClick={() => {
                setEmailModalData({
                  recipient: 'rohitmohitrajkumarnagar@gmail.com',
                  subject: 'Message from FOXE AI Agent',
                  message: 'Hello Rohit,\n\nThis is a real email sent directly via the official Gmail API.',
                });
                setShowEmailModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/30 text-xs font-semibold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              title="Dispatch Real Email via Gmail API"
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send Real Email</span>
            </button>

            {/* Dev Cloud Computer Button */}
            <button
              onClick={() => setShowWorkspaceModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>

            {/* Profile Avatar / Settings Quick Nav */}
            <button
              onClick={() => setActiveSection('settings')}
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-600 flex items-center justify-center text-xs font-bold text-white hover:border-blue-400 transition-all shadow-sm"
              title="Account Settings"
            >
              {userProfile?.fullName?.slice(0, 2)?.toUpperCase() || 'AM'}
            </button>

            {/* Global Sign Out Button */}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700/60 transition-all cursor-pointer"
              title="Sign Out & Disconnect Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Section View (Zero Empty Screens) */}
        <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
          {activeSection === 'home' && (
            <HomeView
              onNavigate={(sec) => setActiveSection(sec)}
              dashboardData={dashboardData}
              onRefresh={loadAllData}
              onQuickCommand={handleQuickCommand}
            />
          )}

          {activeSection === 'assistant' && (
            <AssistantView
              conversations={conversations}
              currentConversationId={currentConversationId}
              messages={messages}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onRefreshMessages={loadAllData}
              onNavigateToSecurity={() => setActiveSection('security')}
              onNavigateToBrowser={() => setActiveSection('browser')}
              onOpenSendEmailModal={(data) => {
                setEmailModalData(data || {});
                setShowEmailModal(true);
              }}
            />
          )}

          {activeSection === 'tasks' && (
            <TasksView
              tasks={tasks}
              onRefresh={loadAllData}
              onNavigateToSecurity={() => setActiveSection('security')}
              onOpenSendEmailModal={(data) => {
                setEmailModalData(data || {});
                setShowEmailModal(true);
              }}
            />
          )}

          {activeSection === 'browser' && <BrowserAgentView />}

          {activeSection === 'connected_apps' && (
            <ConnectedAppsView
              apps={apps}
              onRefresh={loadAllData}
              onNavigateToSecurity={() => setActiveSection('security')}
            />
          )}

          {activeSection === 'automations' && (
            <AutomationsView automations={automations} onRefresh={loadAllData} />
          )}

          {activeSection === 'files' && (
            <FilesView files={files} onRefresh={loadAllData} />
          )}

          {activeSection === 'memory' && (
            <MemoryView memories={memories} onRefresh={loadAllData} />
          )}

          {activeSection === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onRefresh={loadAllData}
              onNavigate={(sec) => setActiveSection(sec)}
            />
          )}

          {activeSection === 'devices' && (
            <DeviceManagerView devices={devices} onRefresh={loadAllData} />
          )}

          {activeSection === 'security' && (
            <SecurityCenterView
              securityData={securityData}
              onRefresh={loadAllData}
            />
          )}

          {activeSection === 'history' && (
            <ActivityHistoryView logs={activityLogs} onRefresh={loadAllData} />
          )}

          {activeSection === 'settings' && (
            <SettingsView
              user={userProfile}
              onRefresh={loadAllData}
              onRequestSignOut={() => setShowLogoutModal(true)}
              onDisconnectGmail={async () => {
                await disconnectApp('gmail');
                loadAllData();
              }}
            />
          )}
        </main>
      </div>

      {/* Cloud Workspace Modal */}
      {showWorkspaceModal && (
        <WorkspaceModal
          workspace={workspaceInfo}
          onClose={() => setShowWorkspaceModal(false)}
          onRefresh={loadAllData}
        />
      )}

      {/* Sign Out & Disconnect Session Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0F172E] border border-rose-500/30 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <LogOut className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Sign Out & Disconnect Session</h3>
                <p className="text-[11px] text-slate-400">Security Sentinel Session Manager</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to end your active session? This will revoke access to the agent dashboard and require Google authentication to sign in again.
            </p>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <span className="font-semibold text-slate-300 block">Account: {userProfile?.email || 'Authenticated User'}</span>
              <span className="text-[11px]">Choose whether you also wish to disconnect your Gmail integration token.</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 text-xs">
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => setShowLogoutModal(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => handleConfirmLogout(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold cursor-pointer"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out Only'}
              </button>
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={() => handleConfirmLogout(true)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/30 cursor-pointer"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out & Disconnect Gmail'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Real Email Modal */}
      <SendEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        initialRecipient={emailModalData.recipient}
        initialSubject={emailModalData.subject}
        initialMessage={emailModalData.message}
        onSuccess={() => {
          loadAllData();
        }}
      />
    </div>
  );
}
