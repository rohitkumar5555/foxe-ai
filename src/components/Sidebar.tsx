import React from 'react';
import {
  Home,
  MessageSquare,
  CheckSquare,
  Globe,
  Grid,
  Zap,
  Folder,
  Brain,
  Bell,
  Smartphone,
  Shield,
  Clock,
  Settings,
  Cpu,
  ChevronRight,
} from 'lucide-react';

export type FoxeSection =
  | 'home'
  | 'assistant'
  | 'tasks'
  | 'browser'
  | 'connected_apps'
  | 'automations'
  | 'files'
  | 'memory'
  | 'notifications'
  | 'devices'
  | 'security'
  | 'history'
  | 'settings';

interface SidebarProps {
  activeSection: FoxeSection;
  onSelectSection: (section: FoxeSection) => void;
  pendingApprovals: number;
  unreadNotifications: number;
  activeTasks: number;
  onOpenWorkspace: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  pendingApprovals,
  unreadNotifications,
  activeTasks,
  onOpenWorkspace,
}) => {
  const navItems = [
    { id: 'home' as FoxeSection, label: 'Home Dashboard', icon: Home },
    { id: 'assistant' as FoxeSection, label: 'AI Assistant', icon: MessageSquare },
    {
      id: 'tasks' as FoxeSection,
      label: 'Task Manager',
      icon: CheckSquare,
      badge: activeTasks > 0 ? `${activeTasks}` : undefined,
      badgeColor: 'bg-blue-600',
    },
    { id: 'browser' as FoxeSection, label: 'Browser Agent', icon: Globe },
    { id: 'connected_apps' as FoxeSection, label: 'Connected Apps', icon: Grid },
    { id: 'automations' as FoxeSection, label: 'Automations', icon: Zap },
    { id: 'files' as FoxeSection, label: 'My Files', icon: Folder },
    { id: 'memory' as FoxeSection, label: 'Personal Memory', icon: Brain },
    {
      id: 'notifications' as FoxeSection,
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotifications > 0 ? `${unreadNotifications}` : undefined,
      badgeColor: 'bg-emerald-500',
    },
    { id: 'devices' as FoxeSection, label: 'Device Manager', icon: Smartphone },
    {
      id: 'security' as FoxeSection,
      label: 'Security Center',
      icon: Shield,
      badge: pendingApprovals > 0 ? `${pendingApprovals}` : undefined,
      badgeColor: 'bg-amber-500',
    },
    { id: 'history' as FoxeSection, label: 'Activity History', icon: Clock },
    { id: 'settings' as FoxeSection, label: 'Settings & Profile', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0A1124] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0066FF] to-[#00D4FF] flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="font-extrabold text-white text-base tracking-wider">F</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-bold text-white text-sm tracking-tight">FOXE</span>
                <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                  AGENT
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                v2.0 Production
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#0066FF] text-white shadow-md shadow-blue-600/25 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cloud Workspace Runtime Status Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070D1C]">
        <button
          onClick={onOpenWorkspace}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-left transition-all group"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <span className="text-[11px] font-semibold text-white block group-hover:text-blue-400 transition-colors">
                Dev Workspace
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Node Sandbox • 22% CPU</span>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>
    </aside>
  );
};
