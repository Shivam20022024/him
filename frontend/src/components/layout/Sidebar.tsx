import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BriefcaseBusiness, 
  UsersRound, 
  LayoutGrid, 
  LogOut,
  BrainCircuit
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = [
    { label: 'Jobs', path: '/jobs', icon: <BriefcaseBusiness size={22} strokeWidth={1.8} /> },
    { label: 'Hiring', path: '/hiring', icon: <UsersRound size={22} strokeWidth={1.8} /> },
    { label: 'Analytics', path: '/analytics', icon: <LayoutGrid size={22} strokeWidth={1.8} /> },
  ];

  return (
    <aside className="hidden lg:flex w-[255px] shrink-0 flex-col border-r border-[#e2e8f0] bg-white h-screen fixed left-0 top-0 z-40">
      <div className="flex h-[150px] items-center justify-between border-b border-[#e2e8f0] px-6">
        <div className="flex items-center gap-3">
          <div className="brand-mark">
            <BrainCircuit size={24} />
          </div>
          <div>
            <p className="text-[20px] font-bold tracking-[-0.04em] text-slate-900 leading-tight">Hireonomous</p>
            <p className="mt-0.5 text-[11px] font-medium leading-tight text-[#003d9b]">
              Find the right talent,<br />faster.
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 overflow-y-auto" aria-label="Main navigation">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex w-full items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#eef3f8] text-slate-900'
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
  );
};

export default Sidebar;
