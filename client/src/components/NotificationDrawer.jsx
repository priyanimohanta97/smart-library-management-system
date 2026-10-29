import React from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RotateCcw, 
  BookOpen, 
  AlertTriangle 
} from 'lucide-react';

/**
 * Format relative time (e.g., 'Just now', '5m ago', '2h ago', '3d ago')
 */
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getNotificationVisual(type) {
  switch (type) {
    case 'LOAN_APPROVED':
      return {
        icon: CheckCircle2,
        bg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        badge: 'Approved',
      };
    case 'LOAN_REJECTED':
      return {
        icon: AlertCircle,
        bg: 'bg-rose-50 text-rose-600 border-rose-200',
        badge: 'Declined',
      };
    case 'RETURN_REQUEST':
      return {
        icon: RotateCcw,
        bg: 'bg-amber-50 text-amber-600 border-amber-200',
        badge: 'Return Pending',
      };
    case 'RETURN_CONFIRMED':
      return {
        icon: CheckCircle2,
        bg: 'bg-blue-50 text-blue-600 border-blue-200',
        badge: 'Returned',
      };
    case 'LOAN_OVERDUE':
      return {
        icon: AlertTriangle,
        bg: 'bg-orange-50 text-orange-600 border-orange-200',
        badge: 'Overdue Notice',
      };
    case 'LOAN_REQUEST':
    default:
      return {
        icon: Clock,
        bg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        badge: 'Circulation',
      };
  }
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications = [],
  unreadCount = 0,
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Notifications inbox">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#DCE7F5] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#DCE7F5] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#DCE7F5] flex items-center justify-center text-[#2563EB] relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0B1F3A] leading-tight">
                  Circulation Notifications
                </h2>
                <span className="text-[11px] text-slate-500">
                  {unreadCount > 0 ? `${unreadCount} unread update${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="inline-flex items-center text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0B1F3A] hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close notification drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
            {isLoading ? (
              <div className="p-8 text-center space-y-3">
                <div className="animate-spin w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full mx-auto" />
                <p className="text-xs text-slate-500">Loading library notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Bell className="w-6 h-6 stroke-1" />
                </div>
                <h3 className="font-bold text-sm text-[#0B1F3A]">No notifications yet</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Loan requests, due date reminders, and return confirmations from the circulation desk will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const visual = getNotificationVisual(notif.type);
                const IconComponent = visual.icon;
                const isRead = notif.isRead || notif.read;

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!isRead && onMarkAsRead) {
                        onMarkAsRead(notif.id);
                      }
                    }}
                    className={`py-3.5 px-3 rounded-xl transition-all cursor-pointer flex space-x-3.5 group mb-1 ${
                      isRead ? 'hover:bg-slate-50/80 bg-white' : 'bg-[#F0F7FF] border border-[#BFDBFE]/60 hover:bg-[#E6F0FA]'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${visual.bg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/80 border border-slate-200/60 text-slate-600">
                          {visual.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <h4 className={`text-xs font-semibold leading-snug line-clamp-1 ${isRead ? 'text-slate-800' : 'text-[#0B1F3A] font-bold'}`}>
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>

                    {!isRead && (
                      <div className="shrink-0 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-[#2563EB]" title="Unread" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 border-t border-[#DCE7F5] bg-[#F8FAFC] text-center">
            <span className="text-[11px] text-slate-500">
              VSSUT Central Library Circulation Desk · Automated Alerts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

