'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="text-zinc-400 hover:text-white text-sm transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/register"
          className="bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-white/20 transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-medium">
          {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="text-sm hidden md:block">{session.user?.name || session.user?.email}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-800 border border-white/10 rounded-lg py-1 z-50 shadow-xl">
            <div className="px-4 py-2 border-b border-white/5">
              <p className="text-sm text-zinc-300">{session.user?.name}</p>
              <p className="text-xs text-zinc-500">{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
