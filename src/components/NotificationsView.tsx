import React from 'react';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Zap,
  Trash2,
  Check,
  ArrowRight,
} from 'lucide-react';
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from '../api/client';
import { FoxeSection } from './Sidebar';

interface NotificationsViewProps {
  notifications: any[];
  onRefresh: () => void;
  onNavigate: (section: FoxeSection) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onRefresh,
  onNavigate,
}) => {
  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    onRefresh();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    onRefresh();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval_request':
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'task_complete':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'task_failed':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case 'automation_run':
        return <Zap className="w-5 h-5 text-teal-400" />;
      default:
        return <Bell className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#070D1C] overflow-hidden p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-400" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-400">
            Real task completions, sentinel approvals, and background automation alerts
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Notification Stream */}
      <div className="flex-1 overflow-y-auto space-y-2.5">
        {notifications.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            No active notifications. All task events are cleared.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                n.isRead
                  ? 'bg-[#0F172E]/60 border-slate-800/60 opacity-80'
                  : 'bg-[#0F172E] border-blue-500/30 shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-white">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {n.relatedTaskId && (
                  <button
                    onClick={() => {
                      if (n.type === 'approval_request') {
                        onNavigate('security');
                      } else {
                        onNavigate('tasks');
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    title="Mark Read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(n.id)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                  title="Delete Notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
