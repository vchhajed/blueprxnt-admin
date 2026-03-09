'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Check, X, DollarSign, Users, Star } from 'lucide-react';

interface Package {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  clients: number;
  revenue: string;
}

const initialPackages: Package[] = [
  {
    id: '1',
    name: 'Foundation',
    price: '$197',
    period: '/month',
    description: 'Essential coaching for beginners starting their performance health journey.',
    features: ['Personalized training plan', 'Nutrition guidelines', 'Weekly check-ins', 'Mobile app access'],
    popular: false,
    clients: 12,
    revenue: '$2,364',
  },
  {
    id: '2',
    name: 'Performance',
    price: '$397',
    period: '/month',
    description: 'Advanced coaching with deeper personalization and more frequent touchpoints.',
    features: ['Everything in Foundation', 'Bi-weekly video calls', 'Custom meal plans', 'Recovery protocols', 'Priority support'],
    popular: true,
    clients: 8,
    revenue: '$3,176',
  },
  {
    id: '3',
    name: 'Elite',
    price: '$697',
    period: '/month',
    description: 'The complete Blueprxnt experience. Full access to all systems and 1-on-1 coaching.',
    features: ['Everything in Performance', 'Daily check-ins', '1-on-1 video coaching', 'Lab work analysis', 'Mindset coaching', 'VIP community access'],
    popular: false,
    clients: 4,
    revenue: '$2,788',
  },
];

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [editing, setEditing] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const totalRevenue = '$8,328';
  const totalClients = packages.reduce((sum, p) => sum + p.clients, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Coaching Packages</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your coaching packages and pricing</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-black text-sm font-semibold rounded-lg hover:bg-sky-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Package
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-sky-500" />
            <span className="text-xs text-zinc-500">Monthly Revenue</span>
          </div>
          <p className="text-xl font-bold text-white">{totalRevenue}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[#6366f1]" />
            <span className="text-xs text-zinc-500">Active Clients</span>
          </div>
          <p className="text-xl font-bold text-white">{totalClients}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-[#f59e0b]" />
            <span className="text-xs text-zinc-500">Total Packages</span>
          </div>
          <p className="text-xl font-bold text-white">{packages.length}</p>
        </div>
      </div>

      {/* Packages List */}
      <div className="space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-1 pt-1 cursor-grab text-zinc-600">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                    {pkg.popular && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-500/20 text-sky-500 rounded-full uppercase">Popular</span>
                    )}
                    <span className="text-xl font-bold text-sky-500">
                      {pkg.price}<span className="text-sm text-zinc-500 font-normal">{pkg.period}</span>
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{pkg.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {pkg.features.map((f, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                        <Check className="w-3 h-3 text-sky-500" />
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right mr-4">
                  <p className="text-sm font-semibold text-white">{pkg.clients} clients</p>
                  <p className="text-xs text-zinc-500">{pkg.revenue}/mo</p>
                </div>
                <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
