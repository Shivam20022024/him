import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BriefcaseBusiness, 
  UsersRound, 
  LayoutGrid, 
  LogOut,
  BrainCircuit,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = [
    { label: 'Jobs', path: '/jobs', icon: <BriefcaseBusiness size={22} strokeWidth={1.8} /> },
    { label: 'Hiring', path: '/hiring', icon: <UsersRound size={22} strokeWidth={1.8} /> },
    { label: 'Analytics', path: '/analytics', icon: <LayoutGrid size={22} strokeWidth={1.8} /> },
  ];

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" 
          onClick={onClose} 
        />
      )}

      {/* Drawer */}
      <aside 
        className={`fixed left-0 top-0 z-50 h-screen w-[280px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[150px] items-center justify-between border-b border-[#e2e8f0] px-6">
          <div className="flex items-center gap-3">
            <div className="brand-mark">
              <BrainCircuit size={24} />
            </div>
            <div>
              <p className="text-[20px] font-bold tracking-[-0.04em] text-slate-900 leading-tight">Hireonomous</p>
              <p className="mt-0.5 text-[11px] font-medium leading-tight text-[#6d28d9]">
                Find the right talent,<br />faster.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 overflow-y-auto" aria-label="Main navigation">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex w-full items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-100 shadow-sm text-slate-900'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-[#e2e8f0] p-6 mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white uppercase">
              {user?.name?.substring(0, 2) || 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name || 'User'}</p>
              <p className="truncate text-xs text-slate-500">{user?.email || 'user@example.com'}</p>
            </div>
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              aria-label="Sign out" 
              title="Logout"
              className="rounded-lg border border-[#e2e8f0] p-2 text-slate-500 hover:bg-slate-50 hover:text-red-500 transition-colors"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
