import React from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64 min-w-0">
        <TopHeader />
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
