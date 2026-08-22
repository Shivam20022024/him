import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Helper to determine if a link is active
  const isActive = (path: string) => location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  // Don't render full navbar on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 ${isScrolled
          ? 'py-3'
          : 'py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {user?.role === 'SUPER_ADMIN' && user?.org_id !== null && location.pathname !== '/superadmin/dashboard' && (
           <div className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-t-xl text-center flex items-center justify-center gap-2 relative z-0 mx-4 -mb-2 shadow-inner">
             <span>SUPER ADMIN VIEW</span>
             <span className="opacity-60">•</span>
             <span>Viewing Workspace</span>
             <Link to="/superadmin/dashboard" className="underline hover:text-indigo-200 ml-2">Return to Global Dashboard</Link>
           </div>
        )}

        <div
          className={`flex items-center justify-between px-4 sm:px-6 h-[72px] rounded-[24px] border transition-all duration-500 relative z-10 ${isScrolled
              ? 'bg-white/80 backdrop-blur-xl border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
              : 'bg-white border-transparent'
            }`}
        >
          {/* Logo Section */}
          <Link
            to={user?.role === 'SUPER_ADMIN' ? '/superadmin/dashboard' : '/dashboard'}
            onClick={closeMobileMenu}
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-blue-200">
              <img src="/logo.png" alt="Hireonomous" className="h-full w-full object-contain p-1" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              {user?.role === 'SUPER_ADMIN' ? 'Novalantis' : 'Hireonomous'}
            </span>
          </Link>

          {/* Center Navigation */}
          {user && user.role !== 'SUPER_ADMIN' && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-50/50 p-1 rounded-full border border-slate-100">
              <Link
                to="/jobs"
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${isActive('/jobs')
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-100'
                    : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Jobs
              </Link>
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="hidden lg:flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-slate-800">
                    {user.organization_name || user.role.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-500">
                    {user.role === 'ORGANIZATION_ADMIN' && user.organization_name ? 'Organization Admin' : 'Authenticated'}
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="hidden lg:flex">
                <Link to="/login" className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md">
                  Sign In
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="mt-4 lg:hidden animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xl">
              {user ? (
                <div className="flex flex-col gap-2">
                   {user.role !== 'SUPER_ADMIN' && (
                      <Link
                        to="/jobs"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-between px-4 py-4 rounded-2xl text-slate-900 font-bold hover:bg-slate-50 transition-colors"
                      >
                        Jobs Board
                      </Link>
                  )}
                  <div className="h-px bg-slate-100 my-2"></div>
                  <button
                    onClick={() => { closeMobileMenu(); handleLogout(); }}
                    className="flex items-center justify-between px-4 py-4 rounded-2xl text-red-600 font-bold hover:bg-red-50 transition-colors w-full text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                   <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-between px-4 py-4 rounded-2xl text-blue-600 font-bold hover:bg-blue-50 transition-colors w-full text-left"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
