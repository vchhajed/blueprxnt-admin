'use client';

import { useState } from 'react';
import { Plus, MoreHorizontal, User, Calendar, DollarSign } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  package: string;
  value: string;
  date: string;
  avatar: string;
}

const initialPipeline: Record<string, Lead[]> = {
  'New Leads': [
    { id: '1', name: 'James Wilson', email: 'james@email.com', package: 'Elite', value: '$697/mo', date: 'Today', avatar: 'JW' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@email.com', package: 'Performance', value: '$397/mo', date: 'Yesterday', avatar: 'SC' },
    { id: '3', name: 'Alex Turner', email: 'alex@email.com', package: 'Foundation', value: '$197/mo', date: '2 days ago', avatar: 'AT' },
  ],
  'Contacted': [
    { id: '4', name: 'Emily Davis', email: 'emily@email.com', package: 'Elite', value: '$697/mo', date: '3 days ago', avatar: 'ED' },
    { id: '5', name: 'Michael Brown', email: 'mike@email.com', package: 'Performance', value: '$397/mo', date: '4 days ago', avatar: 'MB' },
  ],
  'Qualified': [
    { id: '6', name: 'Lisa Anderson', email: 'lisa@email.com', package: 'Elite', value: '$697/mo', date: '5 days ago', avatar: 'LA' },
    { id: '7', name: 'Robert Kim', email: 'rob@email.com', package: 'Performance', value: '$397/mo', date: '1 week ago', avatar: 'RK' },
  ],
  'Closed Won': [
    { id: '8', name: 'Jessica Taylor', email: 'jessica@email.com', package: 'Elite', value: '$697/mo', date: '1 week ago', avatar: 'JT' },
  ],
};

const stageColors: Record<string, string> = {
  'New Leads': '#6366f1',
  'Contacted': '#f59e0b',
  'Qualified': '#00d4aa',
  'Closed Won': '#22c55e',
};

export default function PipelinePage() {
  const [pipeline] = useState(initialPipeline);

  const totalValue = Object.values(pipeline).flat().length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Pipeline</h1>
          <p className="text-zinc-500 text-sm mt-1">Track and manage your coaching leads</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-black text-sm font-semibold rounded-lg hover:bg-sky-400 transition-colors">
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Object.entries(pipeline).map(([stage, leads]) => (
          <div key={stage} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stageColors[stage] }} />
              <span className="text-xs text-zinc-400">{stage}</span>
            </div>
            <p className="text-xl font-bold text-white">{leads.length}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(pipeline).map(([stage, leads]) => (
          <div key={stage}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stageColors[stage] }} />
                <h3 className="text-sm font-semibold text-white">{stage}</h3>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{leads.length}</span>
              </div>
              <button className="text-zinc-500 hover:text-white">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {leads.map(lead => (
                <div key={lead.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-[#6366f1] flex items-center justify-center text-white text-xs font-bold">
                        {lead.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{lead.name}</p>
                        <p className="text-xs text-zinc-500">{lead.email}</p>
                      </div>
                    </div>
                    <button className="text-zinc-500 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs px-2 py-1 rounded-md bg-zinc-800 text-zinc-400">{lead.package}</span>
                    <span className="text-xs font-semibold text-sky-500">{lead.value}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Calendar className="w-3 h-3 text-zinc-600" />
                    <span className="text-xs text-zinc-600">{lead.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
