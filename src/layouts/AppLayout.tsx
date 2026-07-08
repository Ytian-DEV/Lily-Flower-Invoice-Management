import { Outlet } from 'react-router';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-text">
      <div className="grid min-h-screen lg:grid-cols-[17rem_1fr]">
        <Sidebar />
        <div className="flex min-w-0 flex-col">
          <Navbar />
          <main className="flex-1 px-6 py-8 sm:px-8 lg:px-10">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
