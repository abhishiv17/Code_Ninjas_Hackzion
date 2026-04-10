'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, Ticket, ShieldAlert } from 'lucide-react';

const navItems = [
  { name: 'Dashboard',       path: '/dashboard',  icon: LayoutDashboard },
  { name: 'Live Monitoring', path: '/monitoring', icon: Activity },
  { name: 'Incident Tickets',path: '/tickets',    icon: Ticket },
  { name: 'AI Analytics',    path: '/ai',         icon: ShieldAlert },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="dash-sidebar">
      {/* Logo */}
      <div className="dash-sidebar-logo">
        <div className="dash-sidebar-logo-icon">
          <ShieldAlert style={{ width: '1rem', height: '1rem', color: 'var(--omni-cyan)' }} />
        </div>
        <h1>OMNI<span>SOLVE</span></h1>
      </div>

      {/* Nav */}
      <nav className="dash-sidebar-nav" aria-label="Main navigation">
        <div className="dash-nav-label">Command Center</div>

        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.name}
              href={item.path}
              className={`dash-nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <item.icon style={{ width: '1rem', height: '1rem', flexShrink: 0 }} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="dash-sidebar-footer">
        <span style={{ position: 'relative', display: 'inline-block', width: '0.625rem', height: '0.625rem' }}>
          <span style={{
            display: 'block', width: '100%', height: '100%',
            borderRadius: '50%', background: 'var(--omni-green)',
            boxShadow: '0 0 8px var(--omni-green)',
          }} />
          <span style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%', background: 'var(--omni-green)',
            opacity: 0.6, animation: 'omni-pulse 2s ease-in-out infinite',
          }} />
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--omni-text-muted)' }}>
          System Secure
        </span>
      </div>
    </div>
  );
}
