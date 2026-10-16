import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  GitCompare,
  Bookmark,
  LogIn,
  UserPlus,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Github,
} from 'lucide-react';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const navItems = [
    { label: 'Explore', href: '/', icon: <Search className="w-4 h-4" /> },
    { label: 'Compare', href: '/compare', icon: <GitCompare className="w-4 h-4" /> },
    { label: 'Curations', href: '/curations', icon: <Bookmark className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      const target = navSearch.trim();
      setNavSearch('');
      navigate(`/profile/${encodeURIComponent(target)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:border-teal-500/40 transition-colors">
              <Activity className="w-5 h-5 text-teal-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                Stack<span className="text-teal-400">Pulse</span>
              </span>
            </div>
          </Link>

          {/* Quick Search Bar (visible on md+ screens) */}
          <form onSubmit={handleNavSearch} className="hidden lg:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search @developer..."
                className="w-full bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400 transition-all font-mono"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'text-teal-400 bg-teal-500/10 border border-teal-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth State / Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <div className="h-4 w-px bg-slate-800" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[10px]">
                    {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                  </div>
                  <span className="font-medium max-w-[120px] truncate">{user.name || user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-400" />}
                  className="text-xs text-slate-400 hover:text-rose-400"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-3 pb-5 space-y-3">
          {/* Mobile Search */}
          <form onSubmit={handleNavSearch} className="mb-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Search @developer..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500"
              />
            </div>
          </form>

          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active ? 'text-teal-400 bg-teal-500/10' : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <UserIcon className="w-4 h-4 text-teal-400" />
                  <span className="font-medium truncate">{user.name || user.email}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full" leftIcon={<LogIn className="w-4 h-4" />}>
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full" leftIcon={<UserPlus className="w-4 h-4" />}>
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
