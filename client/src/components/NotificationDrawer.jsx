import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RotateCcw, 
  BookOpen, 
  AlertTriangle,
  Trash2
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
  const diffInDays = Math.floor(diffInDays / 24);
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
  onDeleteNotification,
  onClearAll,
  isLoading = false,
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  if (!isOpen) return null;

  const handleDeleteSingle = async (e, id) => {
    e.stopPropagation(); // Prevent marking as read or closing when clicking delete
    if (deletingId) return; // Prevent concurrent delete clicks
    setDeletingId(id);
    try {
      if (onDeleteNotification) {
        await onDeleteNotification(id);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmClearAll = async () => {
    if (isClearingAll) return;
    setIsClearingAll(true);
    try {
      if (onClearAll) {
        await onClearAll();
      }
      setShowClearConfirm(false);
    } finally {
      setIsClearingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Notifications inbox">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isClearingAll) {
            setShowClearConfirm(false);
            onClose();
          }
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#DCE7F5] shadow-2xl flex flex-col justify-between relative">
          
          {/* Clear All Confirmation Modal Overlay */}
          {showClearConfirm && (
            <div className="absolute inset-0 z-50 bg-[#0B1F3A]/60 backdrop-blur-xs flex items-center justify-center p-6">
              <div 
                className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="clear-dialog-title"
                aria-describedby="clear-dialog-desc"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 id="clear-dialog-title" className="text-sm font-bold text-[#0B1F3A]">
                      Clear All Notifications?
                    </h3>
                    <p className="text-[11px] text-slate-500">This removes alerts from your panel.</p>
                  </div>
                </div>

                <p id="clear-dialog-desc" className="text-xs text-slate-600 leading-relaxed">
                  Are you sure you want to dismiss all circulation alerts? Active loans, return requests, and book inventory will remain completely unaffected.
                </p>

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    disabled={isClearingAll}
                    className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClearAll}
                    disabled={isClearingAll}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isClearingAll && (
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    )}
                    <span>{isClearingAll ? 'Clearing...' : 'Yes, Clear All'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

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

            <div className="flex items-center space-x-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="inline-flex items-center text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
                  title="Mark all notifications as read"
                  aria-label="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1" />
                  Mark all read
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={isClearingAll || Boolean(deletingId)}
                  className="inline-flex items-center text-[11px] font-medium text-rose-600 hover:text-rose-700 transition-colors px-2 py-1 rounded hover:bg-rose-50 cursor-pointer disabled:opacity-50"
                  title="Clear all notifications"
                  aria-label="Clear all notifications"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Clear all
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0B1F3A] hover:bg-slate-200 transition-colors cursor-pointer ml-1"
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
                const isDeleting = deletingId === notif.id;

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (!isRead && onMarkAsRead) {
                        onMarkAsRead(notif.id);
                      }
                    }}
                    className={`py-3.5 px-3 rounded-xl transition-all cursor-pointer flex space-x-3 group mb-1 relative ${
                      isRead ? 'hover:bg-slate-50/80 bg-white' : 'bg-[#F0F7FF] border border-[#BFDBFE]/60 hover:bg-[#E6F0FA]'
                    } ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${visual.bg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 pr-1">
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

                    {/* Right-aligned Actions & Status */}
                    <div className="shrink-0 flex flex-col items-end justify-between self-stretch">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSingle(e, notif.id)}
                        disabled={isDeleting || Boolean(deletingId)}
                        className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all focus:opacity-100 focus:ring-1 focus:ring-rose-400 cursor-pointer disabled:opacity-30"
                        title="Delete notification"
                        aria-label={`Delete notification: ${notif.title}`}
                      >
                        {isDeleting ? (
                          <div className="animate-spin w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#2563EB] mb-1" title="Unread alert" />
                      )}
                    </div>
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
