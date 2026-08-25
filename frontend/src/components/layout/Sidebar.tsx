import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  LineChart, 
  BrainCircuit 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const navItems = [
    { label: 'Jobs', path: '/jobs', icon: <Briefcase size={22} /> },
    { label: 'Hiring', path: '/hiring', icon: <Users size={22} /> },
    { label: 'Analytics', path: '/analytics', icon: <LineChart size={22} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform">
      <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BrainCircuit size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hireonomous</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ul className="space-y-1.5 font-medium">
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-base transition-all font-black tracking-wide ${
                    isActive
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User Profile Bottom */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-sm uppercase">
              {user?.name?.substring(0, 2) || 'US'}
            </div>
            <div className="flex flex-col truncate">
              <span className="text-base font-black text-slate-900 tracking-tight truncate">{user?.name || 'User'}</span>
              <span className="text-sm font-semibold text-slate-700 truncate">{user?.email || 'user@example.com'}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
