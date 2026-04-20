'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Bot, MessageSquare, Users,
  Plug, Settings, PanelLeftClose, PanelLeft,
} from 'lucide-react';
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
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'flex flex-col bg-[#FAFAF9] border-r border-[#EAEAEA] transition-all duration-200',
      collapsed ? 'w-[60px]' : 'w-56',
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-14 border-b border-[#EAEAEA] shrink-0">
        {!collapsed && (
          <Link href="/" className="font-semibold text-[15px] tracking-tight text-[#0A0A0A]">
            Iupiter
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-[#A3A3A3] hover:text-[#0A0A0A] transition-colors p-1.5 rounded hover:bg-white"
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
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors',
                isActive
                  ? 'bg-white text-[#0A0A0A] font-medium shadow-[0_0_0_1px_rgba(0,0,0,0.04)]'
                  : 'text-[#525252] hover:bg-white hover:text-[#0A0A0A]',
              )}
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
        <div className="px-4 py-3 border-t border-[#EAEAEA]">
          <div className="flex items-center gap-2 text-[11px] text-[#737373]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            AI active — Free plan
          </div>
        </div>
      )}
    </aside>
  );
}
