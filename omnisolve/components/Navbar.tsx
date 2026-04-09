'use client';

import { ShieldAlert, Settings, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else if (saved === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    html.classList.toggle("dark");
    
    const isDarkNow = html.classList.contains("dark");
    setIsDark(isDarkNow);
    localStorage.setItem("theme", isDarkNow ? "dark" : "light");
  };

  return (
    <nav className="h-16 border-b border-white/10 dark:bg-black/40 bg-white/40 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {/* Placeholder for Breadcrumbs or Page Context */}
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-[pulse-fast_1s_ease-in-out_infinite]"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Online</span>
        </div>
        <div className="h-6 w-px bg-gray-300 dark:bg-white/10"></div>
        <button onClick={toggleTheme} className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 group">
          <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-lg blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
          {isDark ? <Sun className="w-5 h-5 relative z-10" /> : <Moon className="w-5 h-5 relative z-10" />}
        </button>
        <button className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 group">
          <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 rounded-lg blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
          <ShieldAlert className="w-5 h-5 relative z-10" />
        </button>
        <button className="relative p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300 group">
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 rounded-lg blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
          <Settings className="w-5 h-5 relative z-10" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border border-white/20 shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer"></div>
      </div>
    </nav>
  );
}
