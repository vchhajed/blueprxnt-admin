'use client';

import { Bell, Search, Settings, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-zinc-800 border-b border-zinc-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 pl-4 border-l border-zinc-700">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
              <p className="text-xs text-zinc-400">{user?.email || 'admin@blueprxnt.com'}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.name?.[0] || 'A'}
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
