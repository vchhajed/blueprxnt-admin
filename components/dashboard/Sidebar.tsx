'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, TrendingUp, Users, DollarSign,
  Mail, FileText, MessageSquare, FileEdit, LogOut,
  Send, CalendarDays, CreditCard, Sparkles, Lock,
} from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';

const navItems = [
  { title: 'Overview', href: '/dashboard', icon: LayoutDashboard, tip: 'Dashboard summary — stats, recent activity, quick actions' },
  { title: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp, tip: 'Site traffic, page views, and performance metrics' },
  { title: 'Sales Pipeline', href: '/dashboard/pipeline', icon: Users, tip: 'Track leads and coaching prospects through your sales funnel' },
  { title: 'Coaching Packages', href: '/dashboard/packages', icon: DollarSign, tip: 'Manage your coaching tiers, pricing, and features' },
  { title: 'Newsletter', href: '/dashboard/newsletter', icon: Mail, tip: 'View and manage email newsletter subscribers' },
  { title: 'Applications', href: '/dashboard/applications', icon: FileText, tip: 'Review coaching applications submitted from your website' },
  { title: 'Messages', href: '/dashboard/messages', icon: MessageSquare, tip: 'Read and reply to contact form messages' },
  { title: 'Site Content', href: '/dashboard/content', icon: FileEdit, tip: 'Visual editor — click anything on your live site to edit it' },
];

const comingSoonItems = [
  { title: 'Email Campaigns', href: '/dashboard/campaigns', icon: Send, tip: 'Design and send email campaigns to your subscribers' },
  { title: 'Booking Calendar', href: '/dashboard/calendar', icon: CalendarDays, tip: 'Schedule and manage 1:1 coaching sessions' },
  { title: 'Payments & Billing', href: '/dashboard/payments', icon: CreditCard, tip: 'Track revenue, invoices, and payment history' },
  { title: 'AI Assistant', href: '/dashboard/ai', icon: Sparkles, tip: 'AI-powered content generation and insights' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] min-h-screen bg-[#0a0a0a] border-r border-[#27272a] flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-5 py-6">
        <h1 className="text-white font-display font-bold text-lg tracking-wide">BLUEPRXNT</h1>
        <p className="text-sky-500 text-xs mt-0.5">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Tooltip key={item.href} content={item.tip} side="right" delay={500}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all w-full ${
                  isActive
                    ? 'text-sky-400 bg-sky-500/10 border-l-2 border-sky-500'
                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span>{item.title}</span>
              </Link>
            </Tooltip>
          );
        })}

        {/* Coming Soon divider */}
        <div className="pt-4 pb-1 px-3">
          <p className="text-[10px] font-semibold tracking-widest text-zinc-700 uppercase">Coming Soon</p>
        </div>

        {comingSoonItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Tooltip key={item.href} content={`Preview: ${item.tip}`} side="right" delay={300}>
              <Link
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all w-full ${
                  isActive
                    ? 'text-violet-400 bg-violet-500/10 border-l-2 border-violet-500'
                    : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
                }`}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="flex-1">{item.title}</span>
                <Lock className="w-3 h-3 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
              </Link>
            </Tooltip>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-4 py-5 border-t border-[#27272a]">
        <p className="text-white text-sm font-semibold">Admin</p>
        <p className="text-zinc-500 text-xs">blueprxnt.com</p>
        <Tooltip content="Sign out of the admin panel" side="right">
          <button className="flex items-center gap-2 mt-3 text-red-400 hover:text-red-300 text-xs font-medium transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
