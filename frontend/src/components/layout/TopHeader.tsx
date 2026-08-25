import React from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopHeaderProps {
  onOpenSidebar: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ onOpenSidebar }) => {
  const { user } = useAuth();

  return (
    <header className="flex h-[88px] items-center justify-between border-b border-[#e2e8f0] bg-white px-5 lg:px-10 sticky top-0 z-30">
      <button 
        aria-label="Open navigation" 
        onClick={onOpenSidebar}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Menu size={24} />
      </button>
      
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{user?.name || "User"}</p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
            {user?.role?.replace('_', ' ') || 'Organization admin'}
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white uppercase">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <button aria-label="Account menu" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 transition-colors">
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
};

export default TopHeader;
