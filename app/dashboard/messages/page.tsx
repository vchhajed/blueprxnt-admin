'use client';

import { useState } from 'react';
import { Search, Star, Trash2, Reply, Archive, Clock, Circle } from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  read: boolean;
  starred: boolean;
}

const initialMessages: Message[] = [
  { id: '1', name: 'David Kim', email: 'david.k@email.com', subject: 'Training inquiry', preview: 'Hi, I\'m interested in the Elite coaching package...', body: 'Hi, I\'m interested in the Elite coaching package. I\'m a former college athlete looking to get back into peak shape. Could we schedule a call to discuss the details? I\'m particularly interested in the lab work analysis component. Thanks!', date: '10 min ago', read: false, starred: true },
  { id: '2', name: 'Amanda Foster', email: 'amanda.f@email.com', subject: 'Question about nutrition plans', preview: 'Does the Foundation package include custom meal plans?', body: 'Does the Foundation package include custom meal plans? I have specific dietary requirements (celiac disease) and need to ensure any nutrition plan accounts for this. Also, how often are the meal plans updated?', date: '1 hour ago', read: false, starred: false },
  { id: '3', name: 'Chris Nguyen', email: 'chris.n@email.com', subject: 'Scheduling weekly check-in', preview: 'Can we move our Thursday call to Friday this week?', body: 'Can we move our Thursday call to Friday this week? I have a work conflict that came up. Any time after 2pm works for me. Let me know!', date: '3 hours ago', read: false, starred: false },
  { id: '4', name: 'Rachel Green', email: 'rachel.g@email.com', subject: 'Testimonial submission', preview: 'I wanted to share my experience with the Performance...', body: 'I wanted to share my experience with the Performance package. After 3 months, I\'ve lost 15 pounds, gained significant muscle mass, and my energy levels are through the roof. Would love for this to be featured on your site!', date: '5 hours ago', read: true, starred: true },
  { id: '5', name: 'Mark Patterson', email: 'mark.p@email.com', subject: 'Package upgrade request', preview: 'I\'d like to upgrade from Foundation to Performance...', body: 'I\'d like to upgrade from Foundation to Performance package. The Foundation has been great but I feel ready for more intensive coaching. What\'s the process for upgrading mid-cycle?', date: '1 day ago', read: true, starred: false },
  { id: '6', name: 'Karen Lewis', email: 'karen.l@email.com', subject: 'Payment issue', preview: 'My card was declined for this month\'s payment...', body: 'My card was declined for this month\'s payment. I\'ve updated my payment info. Could you please retry the charge? Sorry for the inconvenience.', date: '1 day ago', read: true, starred: false },
  { id: '7', name: 'Jake Morrison', email: 'jake.m@email.com', subject: 'Recovery protocol question', preview: 'How many rest days should I take between heavy...', body: 'How many rest days should I take between heavy lifting sessions? I\'ve been doing 3 heavy days per week but feeling more fatigued than usual. Should I adjust?', date: '2 days ago', read: true, starred: false },
];

export default function MessagesPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const selectedMsg = messages.find(m => m.id === selected);
  const unreadCount = messages.filter(m => !m.read).length;

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
  };

  const markRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    setSelected(id);
  };

  const filtered = messages.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-zinc-500 text-sm mt-1">
          {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Message List */}
        <div className="w-[400px] flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-zinc-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search messages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map(msg => (
              <div
                key={msg.id}
                onClick={() => markRead(msg.id)}
                className={`p-4 border-b border-zinc-800 cursor-pointer transition-colors ${
                  selected === msg.id ? 'bg-sky-500/5 border-l-2 border-l-sky-500' :
                  !msg.read ? 'bg-zinc-800/30 hover:bg-zinc-800/50' : 'hover:bg-zinc-800/30'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {!msg.read && <Circle className="w-2 h-2 fill-sky-500 text-sky-500" />}
                    <span className={`text-sm ${!msg.read ? 'font-semibold text-white' : 'text-zinc-300'}`}>{msg.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">{msg.date}</span>
                    <button onClick={(e) => toggleStar(msg.id, e)}>
                      <Star className={`w-3.5 h-3.5 ${msg.starred ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'}`} />
                    </button>
                  </div>
                </div>
                <p className={`text-xs mb-1 ${!msg.read ? 'text-zinc-300 font-medium' : 'text-zinc-400'}`}>{msg.subject}</p>
                <p className="text-xs text-zinc-600 truncate">{msg.preview}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Message Detail */}
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
          {selectedMsg ? (
            <div className="flex flex-col h-full">
              <div className="p-5 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-white">{selectedMsg.subject}</h2>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors">
                      <Reply className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors">
                      <Archive className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-[#6366f1] flex items-center justify-center text-white text-sm font-bold">
                    {selectedMsg.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{selectedMsg.name}</p>
                    <p className="text-xs text-zinc-500">{selectedMsg.email}</p>
                  </div>
                  <span className="ml-auto text-xs text-zinc-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedMsg.date}
                  </span>
                </div>
              </div>

              <div className="flex-1 p-5">
                <p className="text-sm text-zinc-300 leading-relaxed">{selectedMsg.body}</p>
              </div>

              <div className="p-4 border-t border-zinc-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                  />
                  <button className="px-4 py-2.5 bg-sky-500 text-black text-sm font-semibold rounded-lg hover:bg-sky-400 transition-colors">
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600">
              <p className="text-sm">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
