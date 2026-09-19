import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, AlertTriangle, Info, Sparkles, ShieldCheck, X } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  is_read: boolean;
  link_tab?: string;
  link_task_id?: string;
  created_at: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateTab: (tab: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications, onMarkRead, onMarkAllRead, onNavigateTab
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL_DEFECT': return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
      case 'AI_PLAN_GENERATED': return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      case 'CONFLICT_DETECTED': return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Info className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
      >
        <Bell className="w-4 h-4 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-slideInDown">
          <div className="flex items-center justify-between p-3 border-b border-slate-800">
            <span className="text-xs font-bold text-white">Notifications ({unreadCount} unread)</span>
            {unreadCount > 0 && (
              <button onClick={onMarkAllRead} className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer">
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No notifications</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.is_read) onMarkRead(n.id);
                    if (n.link_tab) { onNavigateTab(n.link_tab); setIsOpen(false); }
                  }}
                  className={`p-3 border-b border-slate-800/60 cursor-pointer transition-all hover:bg-slate-800/50 ${
                    !n.is_read ? 'bg-slate-800/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-semibold ${!n.is_read ? 'text-white' : 'text-slate-400'}`}>{n.title}</span>
                        {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
