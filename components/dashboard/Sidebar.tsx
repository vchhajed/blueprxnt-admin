'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  DollarSign,
  Mail,
  FileText,
  MessageSquare,
  FileEdit,
  X,
  LogOut,
} from 'lucide-react';

const navItems = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
  { title: 'Sales Pipeline', href: '/dashboard/pipeline', icon: Users },
  { title: 'Coaching Packages', href: '/dashboard/packages', icon: DollarSign },
  { title: 'Newsletter', href: '/dashboard/newsletter', icon: Mail },
  { title: 'Applications', href: '/dashboard/applications', icon: FileText },
  { title: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { title: 'Site Content', href: '/dashboard/content', icon: FileEdit },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] min-h-screen bg-[#0a0a0a] border-r border-[#27272a] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-6">
        <div>
          <h1 className="text-white font-display font-bold text-lg tracking-wide">BLUEPRXNT</h1>
          <p className="text-sky-500 text-xs mt-0.5">Admin Panel</p>
        </div>
        <button className="text-zinc-600 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? 'text-sky-400 bg-sky-500/10 border-l-2 border-sky-500'
                  : 'text-zinc-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-5 border-t border-[#27272a]">
        <p className="text-white text-sm font-semibold">Admin</p>
        <p className="text-zinc-500 text-xs">admin@blueprxnt.com</p>
        <button className="flex items-center gap-2 mt-3 text-red-400 hover:text-red-300 text-xs font-medium transition-colors">
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
