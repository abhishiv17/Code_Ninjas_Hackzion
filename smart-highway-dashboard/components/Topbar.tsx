'use client';

import { useApp } from '@/context/AppContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Activity, AlertCircle, Moon, Sun, PanelRight, Globe } from 'lucide-react';

export default function Topbar() {
  const { user, backendOnline, systemHealth, setSlidePanelOpen } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 pl-[calc(1rem+16rem)] backdrop-blur-md dark:border-slate-800 dark:bg-gradient-to-r dark:from-slate-950 dark:to-slate-900/50 md:px-8 md:pl-[calc(2rem+16rem)]">
      <div className="min-w-0 pl-2 md:pl-0">
        <h1 className="truncate text-xl font-semibold text-slate-900 dark:text-white md:text-2xl">
          {t('topbar.title')}
        </h1>
        <p className="mt-1 hidden text-sm text-slate-500 dark:text-slate-400 sm:block">
          {t('topbar.subtitle')}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4 md:gap-6">
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
          title="Toggle Language"
        >
          <Globe size={18} className="text-blue-500" />
          <span className="hidden sm:inline uppercase">{language}</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          <span className="hidden sm:inline">{theme === 'dark' ? t('topbar.light') : t('topbar.dark')}</span>
        </button>

        <button
          type="button"
          onClick={() => setSlidePanelOpen(true)}
          className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
        >
          <PanelRight size={18} />
          <span className="hidden sm:inline">Panel</span>
        </button>

        <div
          className={`hidden items-center space-x-2 rounded-full border px-3 py-2 md:flex ${
            backendOnline
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10'
              : 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10'
          }`}
        >
          <div
            className={`h-2 w-2 rounded-full ${backendOnline ? 'animate-pulse bg-emerald-500' : 'bg-red-500'}`}
          />
          <span
            className={`text-sm font-medium ${
              backendOnline
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-red-700 dark:text-red-400'
            }`}
          >
            {backendOnline ? 'Backend Online' : 'Offline'}
          </span>
        </div>

        <div className="hidden items-center space-x-3 sm:flex">
          <div className="text-right text-sm">
            <p className="font-medium text-slate-800 dark:text-slate-300">
              {user?.name || 'Engineer'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              {systemHealth.activeVehicles.toLocaleString()} vehicles
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
            <Activity size={18} className="text-white" />
          </div>
        </div>

        <div className="flex md:hidden">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              backendOnline ? 'bg-emerald-500/15' : 'bg-red-500/15'
            }`}
          >
            <AlertCircle
              size={18}
              className={backendOnline ? 'text-emerald-600' : 'text-red-500'}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
