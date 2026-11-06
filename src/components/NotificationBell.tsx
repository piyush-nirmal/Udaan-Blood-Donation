import React, { useState, useEffect, useRef } from 'react';
import { AppNotification } from '../types/api';
import { listNotifications, markNotificationsRead } from '../lib/api';
import { Locale, translations } from '../lib/i18n';
import { Bell, CheckCheck, Clock } from 'lucide-react';

interface NotificationBellProps {
  locale: Locale;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ locale }) => {
  const t = translations[locale];
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchNotifs = async () => {
    try {
      const data = await listNotifications();
      setNotifications(data || []);
    } catch {
      // Ignored
    }
  };

  // Poll notifications every 30 seconds
  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const latestFive = notifications.slice(0, 5);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // Handled
    }
  };

  const formatTime = (dateStr: string) => {
    const diffMin = Math.max(1, Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60)));
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return `${Math.floor(diffH / 24)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 rounded-xl text-[#1C1917] hover:bg-[#F3EEEA] transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D62839] focus-visible:ring-offset-1"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5 stroke-[1.75]" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#D62839] px-1 text-[10px] font-bold text-white tabular-nums">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[16px] bg-white border border-[#E8E0DA] shadow-[0_8px_24px_rgba(28,25,23,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
          <div className="px-4 py-3 border-b border-[#E8E0DA] flex items-center justify-between bg-[#FAF7F5]">
            <span className="text-xs font-bold text-[#1C1917]">
              {locale === 'en' ? 'Notifications' : 'सूचनाएं'}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#D62839] hover:text-[#B81F2E] flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>{t.notifs_mark_all_read}</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E8E0DA]/60">
            {latestFive.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6B625C]">
                {t.notifs_empty}
              </div>
            ) : (
              latestFive.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 text-xs transition-colors hover:bg-[#FAF7F5] ${
                    !n.read ? 'bg-[#FDECEE]/40' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-[#1C1917] leading-snug">{n.title}</h4>
                    <span className="text-[10px] text-[#6B625C] shrink-0 flex items-center gap-0.5 tabular-nums">
                      <Clock className="w-2.5 h-2.5 stroke-[1.75]" />
                      {formatTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B625C] mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
