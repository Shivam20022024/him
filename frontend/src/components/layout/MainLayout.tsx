import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopHeader onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
