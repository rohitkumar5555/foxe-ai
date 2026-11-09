import React from 'react';
import {
  MessageSquare,
  Layers,
  Target,
  Lightbulb,
  FolderArchive,
  Link2,
} from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingApprovalsCount: number;
  activeGoalsCount: number;
  newIdeasCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingApprovalsCount,
  activeGoalsCount,
  newIdeasCount,
}) => {
  const tabs = [
    {
      id: 'feed' as TabType,
      label: 'Feed',
      icon: MessageSquare,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'spaces' as TabType,
      label: 'Spaces',
      icon: Layers,
    },
    {
      id: 'goals' as TabType,
      label: 'Goals',
      icon: Target,
      badge: activeGoalsCount > 0 ? `${activeGoalsCount}` : undefined,
      badgeColor: 'bg-blue-500',
    },
    {
      id: 'ideas' as TabType,
      label: 'Ideas',
      icon: Lightbulb,
      badge: newIdeasCount > 0 ? `${newIdeasCount}` : undefined,
      badgeColor: 'bg-emerald-500',
    },
    {
      id: 'artifacts' as TabType,
      label: 'Library',
      icon: FolderArchive,
    },
    {
      id: 'connectors' as TabType,
      label: 'Connect',
      icon: Link2,
    },
  ];

  return (
    <nav className="bg-[#0D111A]/95 backdrop-blur-lg border-t border-white/5 py-1.5 px-2 flex justify-around items-center z-20">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            aria-label={`Open ${tab.label} tab`}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#465FFF] font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              {tab.badge && (
                <span
                  className={`absolute -top-1.5 -right-2.5 px-1 py-0.2 text-[9px] font-bold text-white rounded-full ${tab.badgeColor} min-w-[14px] text-center leading-tight shadow-sm`}
                >
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-[#465FFF] rounded-full mt-0.5 animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
