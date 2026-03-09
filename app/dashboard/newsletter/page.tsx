'use client';

import { useState } from 'react';
import { Mail, Search, Download, Trash2, Send, Users, TrendingUp, Calendar } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  name: string;
  date: string;
  status: 'active' | 'unsubscribed';
  source: string;
}

const subscribers: Subscriber[] = [
  { id: '1', email: 'john.smith@email.com', name: 'John Smith', date: 'Feb 10, 2026', status: 'active', source: 'Homepage' },
  { id: '2', email: 'sarah.j@email.com', name: 'Sarah Johnson', date: 'Feb 9, 2026', status: 'active', source: 'Blog' },
  { id: '3', email: 'mike.wilson@email.com', name: 'Mike Wilson', date: 'Feb 8, 2026', status: 'active', source: 'Coaching Page' },
  { id: '4', email: 'emily.d@email.com', name: 'Emily Davis', date: 'Feb 7, 2026', status: 'active', source: 'Homepage' },
  { id: '5', email: 'alex.t@email.com', name: 'Alex Turner', date: 'Feb 6, 2026', status: 'unsubscribed', source: 'Social Media' },
  { id: '6', email: 'lisa.a@email.com', name: 'Lisa Anderson', date: 'Feb 5, 2026', status: 'active', source: 'Homepage' },
  { id: '7', email: 'rob.kim@email.com', name: 'Robert Kim', date: 'Feb 4, 2026', status: 'active', source: 'Blog' },
  { id: '8', email: 'jessica.t@email.com', name: 'Jessica Taylor', date: 'Feb 3, 2026', status: 'active', source: 'Coaching Page' },
  { id: '9', email: 'david.m@email.com', name: 'David Martinez', date: 'Feb 2, 2026', status: 'active', source: 'Homepage' },
  { id: '10', email: 'anna.w@email.com', name: 'Anna Williams', date: 'Feb 1, 2026', status: 'active', source: 'Social Media' },
];

export default function NewsletterPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = subscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || s.status === filter;
    return matchesSearch && matchesFilter;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    setSelected(prev => prev.length === filtered.length ? [] : filtered.map(s => s.id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Newsletter</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage subscribers and send newsletters</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-black text-sm font-semibold rounded-lg hover:bg-sky-400 transition-colors">
          <Send className="w-4 h-4" />
          Send Newsletter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <Users className="w-4 h-4 text-sky-500 mb-2" />
          <p className="text-xl font-bold text-white">1,247</p>
          <p className="text-xs text-zinc-500">Total Subscribers</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <TrendingUp className="w-4 h-4 text-[#6366f1] mb-2" />
          <p className="text-xl font-bold text-white">+48</p>
          <p className="text-xs text-zinc-500">This Month</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <Mail className="w-4 h-4 text-[#f59e0b] mb-2" />
          <p className="text-xl font-bold text-white">68.4%</p>
          <p className="text-xs text-zinc-500">Open Rate</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
          <Calendar className="w-4 h-4 text-[#ef4444] mb-2" />
          <p className="text-xl font-bold text-white">Feb 8</p>
          <p className="text-xs text-zinc-500">Last Sent</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-sky-500"
          />
        </div>
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
          {(['all', 'active', 'unsubscribed'] as const).map(f => (
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
        <button className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 text-zinc-400 text-sm rounded-lg hover:text-white transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  className="rounded bg-zinc-800 border-zinc-700"
                />
              </th>
              <th className="p-4 text-left text-xs font-medium text-zinc-500">Name</th>
              <th className="p-4 text-left text-xs font-medium text-zinc-500">Email</th>
              <th className="p-4 text-left text-xs font-medium text-zinc-500">Source</th>
              <th className="p-4 text-left text-xs font-medium text-zinc-500">Date</th>
              <th className="p-4 text-left text-xs font-medium text-zinc-500">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sub => (
              <tr key={sub.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(sub.id)}
                    onChange={() => toggleSelect(sub.id)}
                    className="rounded bg-zinc-800 border-zinc-700"
                  />
                </td>
                <td className="p-4 text-sm text-white font-medium">{sub.name}</td>
                <td className="p-4 text-sm text-zinc-400">{sub.email}</td>
                <td className="p-4 text-sm text-zinc-400">{sub.source}</td>
                <td className="p-4 text-sm text-zinc-500">{sub.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    sub.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-zinc-500/10 text-zinc-500'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="p-4">
                  <button className="text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
