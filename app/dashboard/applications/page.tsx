'use client';

import { useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, Eye, ChevronDown, FileText } from 'lucide-react';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  package: string;
  goals: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

const applications: Application[] = [
  { id: '1', name: 'James Wilson', email: 'james@email.com', phone: '+1 555-0101', package: 'Elite', goals: 'Training for marathon, need comprehensive coaching plan', date: 'Feb 10, 2026', status: 'pending' },
  { id: '2', name: 'Maria Garcia', email: 'maria@email.com', phone: '+1 555-0102', package: 'Performance', goals: 'Weight loss and strength training', date: 'Feb 9, 2026', status: 'pending' },
  { id: '3', name: 'David Chen', email: 'david@email.com', phone: '+1 555-0103', package: 'Elite', goals: 'Professional athlete recovery optimization', date: 'Feb 8, 2026', status: 'approved' },
  { id: '4', name: 'Sophie Martin', email: 'sophie@email.com', phone: '+1 555-0104', package: 'Foundation', goals: 'Getting started with fitness routine', date: 'Feb 7, 2026', status: 'approved' },
  { id: '5', name: 'Ryan Thompson', email: 'ryan@email.com', phone: '+1 555-0105', package: 'Performance', goals: 'Improve athletic performance for basketball', date: 'Feb 6, 2026', status: 'rejected' },
  { id: '6', name: 'Emma Watson', email: 'emma.w@email.com', phone: '+1 555-0106', package: 'Elite', goals: 'Complete health transformation', date: 'Feb 5, 2026', status: 'pending' },
  { id: '7', name: 'Tom Harris', email: 'tom.h@email.com', phone: '+1 555-0107', package: 'Foundation', goals: 'Nutrition guidance and meal planning', date: 'Feb 4, 2026', status: 'approved' },
  { id: '8', name: 'Nina Patel', email: 'nina@email.com', phone: '+1 555-0108', package: 'Performance', goals: 'Post-injury rehabilitation coaching', date: 'Feb 3, 2026', status: 'pending' },
];

export default function ApplicationsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = applications.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || a.status === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Applications</h1>
          <p className="text-zinc-500 text-sm mt-1">Review and manage coaching applications</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-amber-400/10 text-amber-400 text-xs font-semibold rounded-full">
            {pendingCount} pending review
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <FileText className="w-4 h-4 text-[#6366f1] mb-2" />
          <p className="text-xl font-bold text-white">{applications.length}</p>
          <p className="text-xs text-zinc-500">Total Applications</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <Clock className="w-4 h-4 text-amber-400 mb-2" />
          <p className="text-xl font-bold text-white">{pendingCount}</p>
          <p className="text-xs text-zinc-500">Pending</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <CheckCircle className="w-4 h-4 text-emerald-400 mb-2" />
          <p className="text-xl font-bold text-white">{applications.filter(a => a.status === 'approved').length}</p>
          <p className="text-xs text-zinc-500">Approved</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <XCircle className="w-4 h-4 text-red-400 mb-2" />
          <p className="text-xl font-bold text-white">{applications.filter(a => a.status === 'rejected').length}</p>
          <p className="text-xs text-zinc-500">Rejected</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search applications..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                filter === f ? 'bg-sky-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filtered.map(app => (
          <div key={app.id} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
              onClick={() => setExpanded(expanded === app.id ? null : app.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-[#6366f1] flex items-center justify-center text-white text-sm font-bold">
                  {app.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{app.name}</p>
                  <p className="text-xs text-zinc-500">{app.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-400">{app.package}</span>
                <span className="text-xs text-zinc-500">{app.date}</span>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  app.status === 'pending' ? 'bg-amber-400/10 text-amber-400' :
                  app.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400' :
                  'bg-red-400/10 text-red-400'
                }`}>
                  {app.status}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${expanded === app.id ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {expanded === app.id && (
              <div className="px-4 pb-4 border-t border-zinc-800 pt-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Phone</p>
                    <p className="text-sm text-white">{app.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Requested Package</p>
                    <p className="text-sm text-white">{app.package}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs text-zinc-500 mb-1">Goals</p>
                  <p className="text-sm text-zinc-300">{app.goals}</p>
                </div>
                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-md hover:bg-emerald-600 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white text-xs font-semibold rounded-md hover:bg-red-600 transition-colors">
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
