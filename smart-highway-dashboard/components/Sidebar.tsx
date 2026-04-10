'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, LayoutDashboard, Ticket, Activity, ShieldAlert, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useApp();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tickets', path: '/tickets', icon: Ticket },
    { name: 'Live Monitoring', path: '/monitoring', icon: Activity },
    { name: 'AI Diagnostics', path: '/ai', icon: ShieldAlert },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 shrink-0 bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-white">Smart<span className="text-blue-400">Way</span></h1>
          <p className="text-xs text-slate-400">Command Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-6">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-3 mb-4">Menu</p>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link key={item.name} href={item.path} className="block relative group">
              <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all relative z-10 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}>
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r shadow-lg shadow-blue-500/50"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-300 hover:bg-red-500/10 transition-all border border-slate-700 hover:border-red-500/30"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}