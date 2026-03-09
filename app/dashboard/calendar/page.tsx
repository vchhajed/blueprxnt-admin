import { CalendarDays, Clock, Users, CheckCircle, Lock, Video } from 'lucide-react';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

const sessions = [
  { name: 'James Wilson', type: 'Elite Coaching', time: '9:00 AM', duration: '60 min', day: 1, color: '#0ea5e9' },
  { name: 'Maria Garcia', type: 'Performance', time: '11:00 AM', duration: '45 min', day: 2, color: '#8b5cf6' },
  { name: 'David Chen', type: 'Elite Coaching', time: '2:00 PM', duration: '60 min', day: 3, color: '#0ea5e9' },
  { name: 'Sophie Martin', type: 'Foundation', time: '10:00 AM', duration: '30 min', day: 4, color: '#10b981' },
  { name: 'Emma Watson', type: 'Performance', time: '3:00 PM', duration: '45 min', day: 5, color: '#8b5cf6' },
];

export default function CalendarPage() {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-violet-500/10 border border-violet-500/30 rounded-xl">
        <Lock className="w-4 h-4 text-violet-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-violet-300">Coming Soon — Booking & Calendar</p>
          <p className="text-xs text-violet-400/70">Let clients book sessions directly. Manage your schedule without the back-and-forth.</p>
        </div>
        <span className="ml-auto px-2.5 py-1 bg-violet-500/20 text-violet-300 text-xs font-bold rounded-full shrink-0">PREVIEW</span>
      </div>

      <div className="relative select-none pointer-events-none">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-[2px] rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-1">
              <CalendarDays className="w-7 h-7 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Booking & Calendar</h2>
            <p className="text-zinc-400 text-sm max-w-xs">Automated scheduling, session reminders, and calendar sync — all in one dashboard.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {['Auto-scheduling', 'Zoom integration', 'SMS reminders', 'Cal.com sync', 'Session notes'].map(f => (
                <span key={f} className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full">{f}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5 opacity-40">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'This Week', value: '5', icon: CalendarDays, color: '#8b5cf6' },
              { label: 'Hours Booked', value: '14.5h', icon: Clock, color: '#0ea5e9' },
              { label: 'Active Clients', value: '12', icon: Users, color: '#10b981' },
              { label: 'Completed', value: '48', icon: CheckCircle, color: '#f59e0b' },
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

          {/* Calendar grid */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Week of March 9 – 15</h3>
              <div className="flex gap-2">
                <div className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-lg">← Prev</div>
                <div className="px-3 py-1.5 bg-zinc-800 text-zinc-400 text-xs rounded-lg">Next →</div>
              </div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              <div /> {/* time column header */}
              {days.map(d => (
                <div key={d} className="text-center text-xs text-zinc-500 py-1 font-medium">{d}</div>
              ))}
              {hours.map((h, hi) => (
                <>
                  <div key={h} className="text-xs text-zinc-600 py-2 pr-2 text-right">{h}</div>
                  {days.map((_, di) => {
                    const session = sessions.find(s => s.day === di && s.time.startsWith(h.replace(' AM', '').replace(' PM', '')));
                    return (
                      <div key={di} className="min-h-[36px] rounded border border-zinc-800/50 relative">
                        {session && (
                          <div className="absolute inset-0 rounded p-1 text-[10px] font-medium"
                            style={{ background: `${session.color}20`, borderLeft: `2px solid ${session.color}` }}>
                            <p style={{ color: session.color }}>{session.name.split(' ')[0]}</p>
                            <p className="text-zinc-500">{session.duration}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          {/* Upcoming sessions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Upcoming Sessions</h3>
            <div className="space-y-2">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/50">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: `${s.color}30`, color: s.color }}>
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-300">{days[s.day - 1]} · {s.time}</p>
                    <p className="text-xs text-zinc-600">{s.duration}</p>
                  </div>
                  <div className="p-1.5 rounded-md bg-zinc-700">
                    <Video className="w-3.5 h-3.5 text-zinc-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
