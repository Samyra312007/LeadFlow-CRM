'use client';

import { useAuth } from '@/lib/auth';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

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
          NexusCRM
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-container">
            <span className="material-symbols-outlined">notifications</span>
          </button>
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
