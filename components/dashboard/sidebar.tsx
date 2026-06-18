'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bot, MessageSquare, Users, Plug, Settings, PanelLeftClose, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { label: 'Overview',      href: '/dashboard',              icon: LayoutDashboard },
  { label: 'AI Agents',     href: '/dashboard/agents',        icon: Bot },
  { label: 'Conversations', href: '/dashboard/conversations', icon: MessageSquare },
  { label: 'Contacts',      href: '/dashboard/contacts',      icon: Users },
  { label: 'Integrations',  href: '/dashboard/integrations',  icon: Plug },
  { label: 'Settings',      href: '/dashboard/settings',      icon: Settings },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn('flex flex-col transition-all duration-200', collapsed ? 'w-[60px]' : 'w-56')}
      style={{ background: '#0A0A0B', borderRight: '1px solid rgba(255,255,255,0.10)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-4 shrink-0"
        style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.10)' }}
      >
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-2 text-[15px] font-bold tracking-tight no-underline"
            style={{ fontFamily: 'var(--font-display)', color: '#ECEBE6', textDecoration: 'none' }}
          >
            <span style={{ width: 24, height: 24, borderRadius: 6, background: '#C8FF34', color: '#16210A', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0 }}>I</span>
            Iupiter
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded transition-colors"
          style={{ color: '#6E6E69' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ECEBE6')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6E6E69')}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors')}
              style={isActive
                ? { background: 'rgba(200,255,52,0.12)', color: '#C8FF34', fontWeight: 600 }
                : { color: '#9B9B96' }
              }
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#ECEBE6'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = '#9B9B96'; }}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer status */}
      {!collapsed && (
        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <div className="flex items-center gap-2 text-[11px]" style={{ color: '#6E6E69' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#2FBF71' }} />
            AI active — Free plan
          </div>
        </div>
      )}
    </aside>
  );
}
