'use client';

import { useState, useCallback } from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleCollapse = useCallback(() => setSidebarCollapsed((v) => !v), []);

  return (
    <div className="min-h-screen flex">
      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <Navbar onMenuClick={toggleSidebar} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
