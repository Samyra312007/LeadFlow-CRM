'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

interface NavbarProps {
  onMenuClick: () => void;
}

const NOTIFICATIONS = [
  { id: 1, title: 'New lead created', description: 'John Doe has been added as a lead', time: '2 min ago', icon: 'person_add', color: 'text-blue-500' },
  { id: 2, title: 'Deal stage updated', description: 'Enterprise deal moved to Negotiation', time: '15 min ago', icon: 'account_tree', color: 'text-amber-500' },
  { id: 3, title: 'Task completed', description: 'Follow up with client marked as done', time: '1 hour ago', icon: 'task_alt', color: 'text-emerald-500' },
  { id: 4, title: 'Contact created', description: 'Jane Smith added from Website', time: '3 hours ago', icon: 'contact_page', color: 'text-purple-500' },
];

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center w-full px-6 py-4 bg-surface/85 backdrop-blur-xl shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-primary hover:bg-surface-container-high rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h2 className="font-headline-sm text-headline-sm font-bold text-primary hidden sm:block">
          LeadFlow CRM
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <p className="font-label-md text-label-md text-primary font-semibold">Notifications</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setNotifOpen(false)}
                      className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-surface-container-low transition-colors border-b border-outline-variant/10 last:border-0"
                    >
                      <span className={`material-symbols-outlined text-[20px] mt-0.5 ${n.color}`}>{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-md text-label-sm text-primary">{n.title}</p>
                        <p className="text-body-sm text-on-surface-variant truncate">{n.description}</p>
                        <p className="text-[10px] text-outline-variant mt-0.5">{n.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-label-md text-primary">{user?.name || 'User'}</p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">
              {user?.role || 'User'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
