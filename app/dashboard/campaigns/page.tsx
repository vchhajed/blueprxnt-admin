import { Send, Users, Eye, MousePointer, TrendingUp, Lock, Sparkles } from 'lucide-react';

export default function CampaignsPage() {
  return (
    <div className="relative">
      {/* Coming Soon Banner */}
      <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-violet-500/10 border border-violet-500/30 rounded-xl">
        <Lock className="w-4 h-4 text-violet-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-violet-300">Coming Soon — Email Campaigns</p>
          <p className="text-xs text-violet-400/70">Design, schedule and send email campaigns directly from your dashboard.</p>
        </div>
        <span className="ml-auto px-2.5 py-1 bg-violet-500/20 text-violet-300 text-xs font-bold rounded-full shrink-0">PREVIEW</span>
      </div>

      {/* Blurred preview */}
      <div className="relative select-none pointer-events-none">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-[2px] rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-1">
              <Send className="w-7 h-7 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Email Campaigns</h2>
            <p className="text-zinc-400 text-sm max-w-xs">Send beautiful campaigns to your subscribers, track opens and clicks — all in one place.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {['Drag & drop editor', 'A/B testing', 'Segmentation', 'Automations', 'Analytics'].map(f => (
                <span key={f} className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Fake UI underneath */}
        <div className="space-y-5 opacity-40">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Emails Sent', value: '12,480', icon: Send, color: '#8b5cf6' },
              { label: 'Avg Open Rate', value: '41.2%', icon: Eye, color: '#0ea5e9' },
              { label: 'Avg Click Rate', value: '18.7%', icon: MousePointer, color: '#10b981' },
              { label: 'Subscribers', value: '1,247', icon: Users, color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
                <div className="w-8 h-8 rounded-lg mb-2" style={{ background: `${s.color}20` }}>
                  <s.icon className="w-4 h-4 m-2" style={{ color: s.color }} />
                </div>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-zinc-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Campaigns table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Recent Campaigns</h3>
              <div className="px-3 py-1.5 bg-violet-500 text-white text-xs font-bold rounded-lg">+ New Campaign</div>
            </div>
            <div className="space-y-3">
              {[
                { name: 'January Newsletter', status: 'Sent', sent: '1,247', opens: '512', clicks: '94', date: 'Jan 15' },
                { name: 'New Coaching Package Launch', status: 'Sent', sent: '1,198', opens: '487', clicks: '201', date: 'Jan 3' },
                { name: 'February Newsletter', status: 'Draft', sent: '—', opens: '—', clicks: '—', date: 'Feb 1' },
                { name: 'Spring Promo Campaign', status: 'Scheduled', sent: '—', opens: '—', clicks: '—', date: 'Mar 15' },
              ].map((c, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/50">
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{c.name}</p>
                    <p className="text-xs text-zinc-500">{c.date}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    c.status === 'Sent' ? 'bg-emerald-500/10 text-emerald-400' :
                    c.status === 'Draft' ? 'bg-zinc-700 text-zinc-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>{c.status}</span>
                  <div className="flex gap-4 text-xs text-zinc-400 w-40 justify-end">
                    <span>Sent: {c.sent}</span>
                    <span>Opens: {c.opens}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fake chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Open Rate Trend</h3>
            <div className="flex items-end gap-2 h-24">
              {[35, 42, 38, 51, 44, 48, 41].map((v, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: `${v * 1.8}px`, background: 'linear-gradient(to top, #8b5cf6, #6366f1)' }} />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <p key={d} className="text-xs text-zinc-600 flex-1 text-center">{d}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
