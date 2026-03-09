'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Eye, Users, Clock, MousePointer } from 'lucide-react';

const metrics = [
  { label: 'Page Views', value: '12,847', change: '+18.2%', up: true, icon: Eye },
  { label: 'Unique Visitors', value: '3,621', change: '+12.5%', up: true, icon: Users },
  { label: 'Avg. Session Duration', value: '4m 32s', change: '+8.1%', up: true, icon: Clock },
  { label: 'Bounce Rate', value: '34.2%', change: '-5.3%', up: true, icon: MousePointer },
];

const pageViews = [
  { page: 'Homepage', views: 4521, percentage: 35 },
  { page: 'Coaching Packages', views: 2847, percentage: 22 },
  { page: 'About', views: 2103, percentage: 16 },
  { page: 'Contact / Apply', views: 1876, percentage: 15 },
  { page: 'System Overview', views: 1500, percentage: 12 },
];

const trafficSources = [
  { source: 'Organic Search', visitors: 1520, percentage: 42, color: '#0ea5e9' },
  { source: 'Direct', visitors: 890, percentage: 25, color: '#6366f1' },
  { source: 'Social Media', visitors: 650, percentage: 18, color: '#f59e0b' },
  { source: 'Referral', visitors: 361, percentage: 10, color: '#ef4444' },
  { source: 'Email', visitors: 200, percentage: 5, color: '#8b5cf6' },
];

const weeklyData = [
  { day: 'Mon', views: 1840 },
  { day: 'Tue', views: 2120 },
  { day: 'Wed', views: 1950 },
  { day: 'Thu', views: 2340 },
  { day: 'Fri', views: 2100 },
  { day: 'Sat', views: 1200 },
  { day: 'Sun', views: 1297 },
];

const maxViews = Math.max(...weeklyData.map(d => d.views));

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('7d');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-zinc-500 text-sm mt-1">Track your website performance and visitor insights</p>
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {['24h', '7d', '30d', '90d'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                period === p ? 'bg-sky-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-zinc-500" />
                <span className={`text-xs font-medium ${m.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {m.up ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                  {m.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{m.value}</p>
              <p className="text-zinc-500 text-xs mt-1">{m.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h2 className="text-white font-semibold mb-4">Weekly Page Views</h2>
          <div className="flex items-end gap-3 h-48">
            {weeklyData.map(d => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-zinc-500">{d.views.toLocaleString()}</span>
                <div
                  className="w-full bg-sky-500/20 rounded-t-md relative overflow-hidden"
                  style={{ height: `${(d.views / maxViews) * 100}%` }}
                >
                  <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-sky-500/40 to-transparent" />
                </div>
                <span className="text-xs text-zinc-400">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <h2 className="text-white font-semibold mb-4">Traffic Sources</h2>
          <div className="space-y-4">
            {trafficSources.map(s => (
              <div key={s.source}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-zinc-300">{s.source}</span>
                  <span className="text-xs text-zinc-500">{s.visitors.toLocaleString()} ({s.percentage}%)</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.percentage}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h2 className="text-white font-semibold mb-4">Top Pages</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-3 text-xs text-zinc-500 font-medium pb-2 border-b border-zinc-800">
            <span>Page</span>
            <span className="text-right">Views</span>
            <span className="text-right">Share</span>
          </div>
          {pageViews.map((p, i) => (
            <div key={p.page} className="grid grid-cols-3 items-center py-2">
              <span className="text-sm text-zinc-300">{p.page}</span>
              <span className="text-sm text-white text-right font-medium">{p.views.toLocaleString()}</span>
              <div className="flex items-center justify-end gap-2">
                <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: `${p.percentage}%` }} />
                </div>
                <span className="text-xs text-zinc-500 w-8 text-right">{p.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
