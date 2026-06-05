'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/leads', label: 'Leads', icon: 'group' },
  { href: '/contacts', label: 'Contacts', icon: 'contacts' },
  { href: '/deals', label: 'Deals', icon: 'account_tree' },
  { href: '/tasks', label: 'Tasks', icon: 'assignment' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const collapsedContent = (
    <>
      <div className="mb-8 px-2 flex flex-col items-center gap-2">
        <h1 className="font-headline-sm text-headline-sm font-black text-primary">N</h1>
        <button
          onClick={onToggleCollapse}
          className="p-1 text-on-surface-variant hover:text-primary rounded-lg transition-colors"
          title="Expand sidebar"
        >
          <span className="material-symbols-outlined text-[18px]">menu_open</span>
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        <button
          onClick={() => { router.push('/dashboard?new=true'); onClose(); }}
          className="flex items-center justify-center w-full p-2.5 mb-4 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-all"
          title="New Lead"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-center py-2.5 rounded-lg font-label-md text-label-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container ${
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
              title={item.label}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 mt-auto border-t border-outline-variant flex justify-center">
        <Link
          href="/settings"
          onClick={onClose}
          className="flex items-center justify-center p-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all"
          title="Settings"
        >
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </div>
    </>
  );

  const expandedContent = (
    <>
      <div className="mb-8 px-2 flex items-center justify-between">
        <h1 className="font-headline-sm text-headline-sm font-black text-primary">LeadFlow CRM</h1>
        <button
          onClick={onToggleCollapse}
          className="p-1 text-on-surface-variant hover:text-primary rounded-lg transition-colors"
          title="Collapse sidebar"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        <button
          onClick={() => { router.push('/dashboard?new=true'); onClose(); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 mb-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90 transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary-container"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Lead
        </button>

        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
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
      </div>
    </>
  );

  return (
    <>
      <aside className={`fixed left-0 top-0 h-full ${collapsed ? 'w-16' : 'w-64'} bg-surface-container-lowest border-r border-outline-variant flex flex-col p-4 z-50 hidden lg:flex transition-all duration-300`}>
        {collapsed ? collapsedContent : expandedContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col p-4 shadow-2xl animate-slide-in">
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="p-1 text-on-surface-variant hover:text-primary rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container"
                aria-label="Close navigation menu"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {expandedContent}
          </aside>
        </div>
      )}
    </>
  );
}
