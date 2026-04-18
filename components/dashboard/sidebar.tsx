'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Bot, MessageSquare, Users,
  Plug, Settings, ChevronDown, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { label: 'Overview',       href: '/dashboard',              icon: LayoutDashboard },
  { label: 'AI Agents',      href: '/dashboard/agents',        icon: Bot },
  { label: 'Conversations',  href: '/dashboard/conversations', icon: MessageSquare },
  { label: 'Contacts',       href: '/dashboard/contacts',      icon: Users },
  { label: 'Integrations',   href: '/dashboard/integrations',  icon: Plug },
  { label: 'Settings',       href: '/dashboard/settings',      icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'flex flex-col bg-white border-r border-slate-200 transition-all duration-200',
      collapsed ? 'w-16' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-slate-200 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg text-slate-900">Iupiter</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-slate-600"
        >
          <ChevronDown className={cn('w-4 h-4 transition-transform', collapsed ? '-rotate-90' : 'rotate-90')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom status */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            AI Active — Free Plan
          </div>
        </div>
      )}
    </aside>
  );
}
