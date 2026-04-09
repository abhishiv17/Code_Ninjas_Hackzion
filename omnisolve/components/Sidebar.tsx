'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, Ticket, BookOpen, Terminal, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { t } from '@/lib/translations';

const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: LayoutDashboard },
  { key: 'monitoring', path: '/monitoring', icon: Activity },
  { key: 'incident_tickets', path: '/tickets', icon: Ticket },
  { key: 'ai_diagnostics', path: '/ai', icon: ShieldAlert },
  { key: 'knowledge_base', path: '/knowledge', icon: BookOpen },
  { key: 'system_logs', path: '/logs', icon: Terminal },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-card/80 backdrop-blur-xl border-r border-white/5 h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mr-3 relative shadow-[0_0_15px_rgba(37,99,235,0.2)]">
          <ShieldAlert className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-wider text-white">CONTROL<span className="text-blue-500">GRID</span></h1>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest px-2 mb-4">{t("command_center")}</div>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link key={item.key} href={item.path} className="block relative">
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative z-10 ${isActive ? 'text-blue-100' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : ''}`} />
                <span className="text-sm font-medium">{t(item.key)}</span>
              </div>
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent border-y border-r border-blue-500/10 rounded-lg shadow-[inset_4px_0_0_rgba(59,130,246,1),0_0_15px_rgba(59,130,246,0.25)] z-0 overflow-hidden"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-6 py-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span className="text-xs font-medium text-gray-400">{t("system_secure")}</span>
        </div>
      </div>
    </div>
  );
}
