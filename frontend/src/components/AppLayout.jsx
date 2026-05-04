import React from 'react';
import { useAuthStore } from '../store/authStore';
import { NavLink, useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookText,
  Calendar,
  Settings,
  Tags,
  LogOut,
  Search as SearchIcon
} from 'lucide-react';

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Journal', path: '/entries', icon: BookText },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Tags', path: '/tags', icon: Tags },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/entries': return 'Journal Entries';
      case '/calendar': return 'Writing Calendar';
      case '/tags': return 'Tags';
      case '/settings': return 'Settings';
      default:
        if (location.pathname.includes('/entries/new')) return 'New Entry';
        if (location.pathname.includes('/entries/')) return 'Edit Entry';
        return 'Sanctuary Journal';
    }
  };

  // Pages that manage their own header — hide the global navbar
  const hideNavbar = location.pathname.includes('/entries/') && location.pathname !== '/entries';

  return (
    <div className="min-h-screen bg-background flex font-sans overflow-hidden h-screen">
      {/* Left Sidebar - 240px Width, Light Gray Background */}
      <aside className="w-[240px] flex-shrink-0 bg-background border-r border-outline flex flex-col z-20">
        <div className="p-lg">
          <div className="flex items-center gap-sm mb-xl px-sm">
            <div className="w-8 h-8 bg-primary rounded-[8px] flex items-center justify-center">
              <BookText className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface">Sanctuary</span>
          </div>

          <nav className="space-y-xs">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-md px-md py-sm rounded-buttons transition-colors
                  ${isActive
                    ? 'bg-surface-variant text-primary font-medium'
                    : 'text-on-surface-variant hover:bg-surface-variant/50'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-base">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-lg border-t border-outline">
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-md px-md py-sm rounded-buttons text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-base font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar — hidden on editor/detail pages which have their own navigation */}
        {!hideNavbar && (
          <header className="h-[64px] bg-background border-b border-outline flex items-center justify-between px-lg flex-shrink-0">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-on-surface">{getPageTitle()}</h1>
            </div>

            <div className="flex items-center gap-lg">
              {/* Note: Specific pages like EntryList handle their own localized search/actions for better context */}
              <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant text-xs font-bold">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
