import { Sparkles, Lock, Zap, FileText, TrendingUp, MessageSquare, RefreshCw, Copy } from 'lucide-react';

const suggestions = [
  { label: 'Write hero headline', prompt: 'Write a compelling hero headline for a performance health coaching website targeting high-achieving professionals.', icon: FileText },
  { label: 'Email campaign copy', prompt: 'Write a re-engagement email for subscribers who haven\'t opened in 30 days.', icon: MessageSquare },
  { label: 'Instagram caption', prompt: 'Write 3 Instagram captions for a post about the importance of sleep for performance.', icon: Sparkles },
  { label: 'SEO meta description', prompt: 'Write an SEO meta description for the coaching page targeting "performance health coaching".', icon: TrendingUp },
];

const fakeResponse = `Here's a compelling hero headline for your performance health coaching site:

**"The System Elite Athletes Use to Perform at Their Peak — Now Available to You."**

**Why this works:**
• Borrows credibility from elite sports
• Creates aspiration ("peak performance")
• Suggests exclusivity now made accessible
• Concise and punchy at under 15 words

**Alternative versions:**
1. "Built in the NFL. Engineered for Your Life."
2. "Stop Guessing. Start Performing. The Blueprxnt System."
3. "Your Health Isn't a Problem to Manage — It's a System to Build."`;

export default function AIPage() {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6 px-4 py-3 bg-violet-500/10 border border-violet-500/30 rounded-xl">
        <Lock className="w-4 h-4 text-violet-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-violet-300">Coming Soon — AI Assistant</p>
          <p className="text-xs text-violet-400/70">Claude-powered content generation, insights, and copy — built into your dashboard.</p>
        </div>
        <span className="ml-auto px-2.5 py-1 bg-violet-500/20 text-violet-300 text-xs font-bold rounded-full shrink-0">PREVIEW</span>
      </div>

      <div className="relative select-none pointer-events-none">
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0a]/60 backdrop-blur-[2px] rounded-2xl">
          <div className="flex flex-col items-center gap-3 text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-1">
              <Sparkles className="w-7 h-7 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white">AI Assistant</h2>
            <p className="text-zinc-400 text-sm max-w-xs">Powered by Claude — generate website copy, email campaigns, captions, and insights instantly.</p>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {['Headline writer', 'Email copy', 'SEO content', 'Analytics insights', 'Caption generator'].map(f => (
                <span key={f} className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full">{f}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5 opacity-40">
          {/* Left: prompt suggestions */}
          <div className="col-span-1 space-y-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <p className="text-sm font-semibold text-white">Quick Prompts</p>
              </div>
              <div className="space-y-2">
                {suggestions.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-800/60 cursor-pointer hover:bg-zinc-800">
                    <s.icon className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <p className="text-xs text-zinc-300">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-zinc-500 mb-3 uppercase tracking-wider">Usage This Month</p>
              <div className="space-y-2">
                {[
                  { label: 'Prompts used', value: '47 / 200' },
                  { label: 'Words generated', value: '12,480' },
                  { label: 'Time saved', value: '~6.2 hrs' },
                ].map(u => (
                  <div key={u.label} className="flex justify-between">
                    <p className="text-xs text-zinc-500">{u.label}</p>
                    <p className="text-xs text-white font-medium">{u.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full w-[23%] bg-gradient-to-r from-violet-500 to-sky-500 rounded-full" />
              </div>
            </div>
          </div>

          {/* Right: chat interface */}
          <div className="col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <p className="text-sm font-semibold text-white">AI Content Assistant</p>
              <span className="ml-auto text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-medium">Powered by Claude</span>
            </div>

            <div className="flex-1 p-4 space-y-4 overflow-auto">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-sm bg-sky-500/20 border border-sky-500/30 rounded-2xl rounded-tr-sm px-3 py-2">
                  <p className="text-xs text-sky-200">Write a compelling hero headline for a performance health coaching website targeting high-achieving professionals.</p>
                </div>
              </div>

              {/* AI response */}
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-violet-400" />
                </div>
                <div className="flex-1 bg-zinc-800/80 rounded-2xl rounded-tl-sm px-3 py-2">
                  <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">{fakeResponse}</p>
                  <div className="flex gap-2 mt-2">
                    <div className="flex items-center gap-1 px-2 py-1 bg-zinc-700 rounded text-[10px] text-zinc-400">
                      <Copy className="w-2.5 h-2.5" /> Copy
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-zinc-700 rounded text-[10px] text-zinc-400">
                      <RefreshCw className="w-2.5 h-2.5" /> Regenerate
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-zinc-800">
              <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
                <p className="text-xs text-zinc-600 flex-1">Ask AI to write, improve, or generate content...</p>
                <div className="p-1.5 bg-violet-500 rounded-md">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
