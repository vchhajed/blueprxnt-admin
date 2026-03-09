import { CreditCard, TrendingUp, DollarSign, Users, Lock, ArrowUpRight, CheckCircle } from 'lucide-react';

const transactions = [
  { name: 'James Wilson', package: 'Elite Coaching', amount: '$697', status: 'Paid', date: 'Mar 8' },
  { name: 'Maria Garcia', package: 'Performance', amount: '$397', status: 'Paid', date: 'Mar 7' },
  { name: 'David Chen', package: 'Elite Coaching', amount: '$697', status: 'Paid', date: 'Mar 6' },
  { name: 'Sophie Martin', package: 'Foundation', amount: '$197', status: 'Pending', date: 'Mar 5' },
  { name: 'Emma Watson', package: 'Elite Coaching', amount: '$697', status: 'Paid', date: 'Mar 4' },
  { name: 'Ryan Thompson', package: 'Performance', amount: '$397', status: 'Refunded', date: 'Mar 3' },
];

const bars = [42, 68, 55, 79, 63, 88, 71, 95, 82, 76, 91, 84];
const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

export default function PaymentsPage() {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-violet-500/10 border border-violet-500/30 rounded-xl">
        <Lock className="w-4 h-4 text-violet-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-violet-300">Coming Soon — Payments & Billing</p>
          <p className="text-xs text-violet-400/70">Track revenue, manage invoices, and view payment history — all in your dashboard.</p>
        </div>
        <span className="ml-auto px-2.5 py-1 bg-violet-500/20 text-violet-300 text-xs font-bold rounded-full shrink-0">PREVIEW</span>
      </div>

      <div className="relative select-none pointer-events-none">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-[2px] rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-1">
              <CreditCard className="w-7 h-7 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Payments & Billing</h2>
            <p className="text-zinc-400 text-sm max-w-xs">Stripe-powered payments, automatic invoicing, and real-time revenue tracking.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {['Stripe integration', 'Auto invoicing', 'Subscriptions', 'Refunds', 'Revenue reports'].map(f => (
                <span key={f} className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full">{f}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5 opacity-40">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Monthly Revenue', value: '$8,340', change: '+14%', icon: DollarSign, color: '#10b981' },
              { label: 'Annual Revenue', value: '$74,280', change: '+22%', icon: TrendingUp, color: '#0ea5e9' },
              { label: 'Active Clients', value: '12', change: '+3', icon: Users, color: '#8b5cf6' },
              { label: 'Avg. Package', value: '$463', change: '+8%', icon: CreditCard, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg" style={{ background: `${s.color}20` }}>
                    <s.icon className="w-4 h-4 m-2" style={{ color: s.color }} />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs text-emerald-400 font-medium">
                    <ArrowUpRight className="w-3 h-3" />{s.change}
                  </span>
                </div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Revenue (12 months)</h3>
              <span className="text-xs text-emerald-400 font-medium">↑ $74,280 total</span>
            </div>
            <div className="flex items-end gap-1.5 h-28">
              {bars.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t" style={{
                    height: `${v * 1.1}px`,
                    background: i === bars.length - 1
                      ? 'linear-gradient(to top, #10b981, #0ea5e9)'
                      : 'linear-gradient(to top, #18181b, #27272a)',
                  }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1.5">
              {months.map(m => (
                <p key={m} className="text-[10px] text-zinc-700 flex-1 text-center">{m}</p>
              ))}
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Recent Transactions</h3>
              <div className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-lg">Export CSV</div>
            </div>
            <div className="space-y-2">
              {transactions.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.package}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    t.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' :
                    t.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>{t.status}</span>
                  <p className="text-sm font-bold text-white w-16 text-right">{t.amount}</p>
                  <p className="text-xs text-zinc-600 w-10 text-right">{t.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
