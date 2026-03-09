'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Mail,
  Package,
  MessageSquare,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const stats = [
  { label: 'Total Applications', value: '24', change: '+12%', up: true, icon: FileText, color: '#0ea5e9' },
  { label: 'Newsletter Subscribers', value: '1,247', change: '+8%', up: true, icon: Mail, color: '#6366f1' },
  { label: 'Active Packages', value: '3', change: '0%', up: true, icon: Package, color: '#f59e0b' },
  { label: 'Unread Messages', value: '12', change: '+3', up: false, icon: MessageSquare, color: '#ef4444' },
];

const recentActivity = [
  { action: 'New application received', name: 'John Smith', time: '2 minutes ago', type: 'application' },
  { action: 'Newsletter subscriber', name: 'sarah@email.com', time: '15 minutes ago', type: 'subscriber' },
  { action: 'Package purchased', name: 'Elite Package - Mike R.', time: '1 hour ago', type: 'purchase' },
  { action: 'New message', name: 'David K. - Training inquiry', time: '2 hours ago', type: 'message' },
  { action: 'Application approved', name: 'Emily Johnson', time: '3 hours ago', type: 'application' },
  { action: 'Content updated', name: 'Hero section published', time: '5 hours ago', type: 'content' },
];

const quickActions = [
  { label: 'Edit Site Content', href: '/dashboard/content', icon: FileText, color: '#0ea5e9' },
  { label: 'Manage Packages', href: '/dashboard/packages', icon: Package, color: '#6366f1' },
  { label: 'View Messages', href: '/dashboard/messages', icon: MessageSquare, color: '#f59e0b' },
  { label: 'View Applications', href: '/dashboard/applications', icon: Users, color: '#ef4444' },
];

export default function OverviewPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <p className="text-zinc-500 text-sm mt-1">Welcome back, Admin. Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-zinc-500 text-xs mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h2 className="text-white font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-md hover:bg-zinc-800 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  item.type === 'application' ? 'bg-sky-500' :
                  item.type === 'subscriber' ? 'bg-[#6366f1]' :
                  item.type === 'purchase' ? 'bg-[#f59e0b]' :
                  item.type === 'message' ? 'bg-[#ef4444]' : 'bg-sky-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-white">{item.action}</p>
                  <p className="text-xs text-zinc-500">{item.name}</p>
                </div>
                <span className="text-xs text-zinc-600">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-zinc-800 border border-zinc-800 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                    <Icon className="w-4 h-4" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white flex-1">{action.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                </Link>
              );
            })}
          </div>

          {/* System Status */}
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <h3 className="text-white text-sm font-semibold mb-3">System Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-xs text-zinc-400">Website Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                <span className="text-xs text-zinc-400">Database Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span className="text-xs text-zinc-400">Backup: 1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
