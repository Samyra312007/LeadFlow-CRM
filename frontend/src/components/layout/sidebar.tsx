'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard' },
  { href: '/leads', label: 'Leads', icon: 'group' },
  { href: '/tasks', label: 'Tasks', icon: 'assignment' },
  { href: '/activities', label: 'Activities', icon: 'event_note' },
  { href: '/analytics', label: 'Analytics', icon: 'bar_chart' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const content = (
    <>
      <div className="mb-8 px-2">
        <h1 className="font-headline-sm text-headline-sm font-black text-primary">LeadFlow CRM</h1>
      </div>

      <nav className="flex-1 space-y-1">
        <button
          onClick={() => { router.push('/?new=true'); onClose(); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 mb-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary-container"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Lead
        </button>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 mt-auto border-t border-outline-variant space-y-1">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all font-label-md text-label-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
        >
          <span className="material-symbols-outlined">settings</span>
          Settings
        </Link>
        <Link
          href="/support"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all font-label-md text-label-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
        >
          <span className="material-symbols-outlined">contact_support</span>
          Support
        </Link>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col p-4 z-50 hidden lg:flex">
        {content}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col p-4 shadow-2xl animate-slide-in">
            <div className="flex justify-end mb-2 lg:hidden">
              <button
                onClick={onClose}
                className="p-1 text-on-surface-variant hover:text-primary rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
                aria-label="Close navigation menu"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
