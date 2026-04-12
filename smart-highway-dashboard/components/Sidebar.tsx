'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, LayoutDashboard, Ticket, Activity, ShieldAlert,
  LogOut, LogIn, UserPlus, X, ChevronRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, sidebarOpen, setSidebarOpen, isAuthenticated, user } = useApp();
  const { t } = useLanguage();

  const navItems = [
    { name: t('nav.dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.tickets'), path: '/tickets', icon: Ticket },
    { name: t('nav.monitoring'), path: '/monitoring', icon: Activity },
    { name: t('nav.diagnostics'), path: '/ai', icon: ShieldAlert },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Backdrop overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-screen w-64 shrink-0 flex-col
          border-r border-slate-200 bg-gradient-to-b from-slate-100 to-white
          dark:border-slate-800 dark:from-slate-950 dark:to-slate-900
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header / Logo + close button */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md shadow-blue-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white">
                Control<span className="text-blue-600 dark:text-blue-400">Grid</span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Command Center</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto px-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Navigation
          </p>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className="group relative block"
              >
                <div
                  className={`relative z-10 flex items-center space-x-3 rounded-xl px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? 'border border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="flex-1 text-sm font-medium">{item.name}</span>
                  {isActive && <ChevronRight size={14} className="opacity-60" />}
                </div>
                {isActive && (
                  <div className="absolute bottom-0 left-0 top-0 w-1 rounded-r-full bg-blue-500 shadow-lg shadow-blue-500/40" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800 space-y-2">
          {isAuthenticated ? (
            <>
              {/* User Info */}
              <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2.5 dark:bg-slate-800/60">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center space-x-3 rounded-xl border border-slate-200 px-4 py-3 text-slate-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">{t('nav.logout')}</span>
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <Link
                href="/login"
                onClick={() => setSidebarOpen(false)}
                className="flex w-full items-center space-x-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 transition-all hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
              >
                <LogIn size={18} />
                <span className="text-sm font-medium">Login</span>
              </Link>

              {/* Sign Up */}
              <Link
                href="/login?tab=signup"
                onClick={() => setSidebarOpen(false)}
                className="flex w-full items-center space-x-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
              >
                <UserPlus size={18} />
                <span className="text-sm font-medium">Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  );
}