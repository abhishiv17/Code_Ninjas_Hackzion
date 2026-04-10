'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, LayoutDashboard, Ticket, Activity, ShieldAlert, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useApp();
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
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-gradient-to-b from-slate-100 to-white dark:border-slate-800 dark:from-slate-950 dark:to-slate-900">
      {/* Logo */}
      <div className="flex items-center space-x-3 border-b border-slate-200 p-6 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 dark:text-white">
            Smart<span className="text-blue-600 dark:text-blue-400">Way</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Command Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex-1 space-y-2 px-4">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-500">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link key={item.name} href={item.path} className="group relative block">
              <div
                className={`relative z-10 flex items-center space-x-3 rounded-lg px-4 py-3 transition-all ${
                  isActive
                    ? 'border border-blue-500/40 bg-blue-500/15 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-200/80 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                }`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-0 top-0 w-1 rounded-r bg-blue-500 shadow-lg shadow-blue-500/40" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 rounded-lg border border-slate-200 px-4 py-3 text-slate-600 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-500/30 dark:hover:bg-red-500/10 dark:hover:text-red-300"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">{t('nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
}