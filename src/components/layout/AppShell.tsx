import { useState } from 'react';
import { Outlet } from 'react-router';

import { Footer } from '@/components/layout/Footer';
import { MobileSidebar } from '@/components/layout/MobileSidebar';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavigation } from '@/components/layout/TopNavigation';

export function AppShell() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-text">
      <Sidebar />
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex min-h-screen min-w-0 flex-col lg:pl-72">
        <TopNavigation onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
