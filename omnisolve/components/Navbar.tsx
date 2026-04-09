'use client';

import { ShieldAlert, Settings, Moon, Sun, LogOut } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/translations';

export default function Navbar() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(true);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
    
    const savedLang = localStorage.getItem("lang");
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    
    const isDarkNow = html.classList.contains("dark");
    setIsDark(isDarkNow);
    localStorage.setItem("theme", isDarkNow ? "dark" : "light");
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem("lang", newLang);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    router.push("/");
  };

  return (
    <nav className="h-16 border-b border-white/10 dark:bg-black/40 bg-white/40 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* Placeholder for Breadcrumbs or Page Context */}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-[pulse-fast_1s_ease-in-out_infinite]"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("system_online")}</span>
        </div>
        <div className="h-6 w-px bg-gray-300 dark:bg-white/10"></div>
        <select 
          value={language} 
          onChange={handleLanguageChange}
          className="bg-transparent text-sm text-gray-700 dark:text-gray-300 font-medium outline-none cursor-pointer border border-gray-200 dark:border-white/10 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500/50 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <option value="en" className="text-gray-900 bg-white">English</option>
          <option value="hi" className="text-gray-900 bg-white">Hindi</option>
          <option value="kn" className="text-gray-900 bg-white">Kannada</option>
        </select>
        <button onClick={toggleTheme} className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 group">
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-lg blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
          {isDark ? <Sun className="w-5 h-5 relative z-10" /> : <Moon className="w-5 h-5 relative z-10" />}
        </button>
        <button className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 group">
          <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 rounded-lg blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
          <ShieldAlert className="w-5 h-5 relative z-10" />
        </button>
        <button onClick={handleLogout} title={t("logout")} className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 group">
          <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 rounded-lg blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
          <LogOut className="w-5 h-5 relative z-10" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20 shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer"></div>
      </div>
    </nav>
  );
}
