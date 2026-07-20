'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (status === 'loading') {
    return (
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-3)', animation: 'pulse 1.5s infinite' }} />
    );
  }

  if (!session) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <a
          href="/auth/login"
          style={{ color: 'var(--nav-ink-dim)', fontSize: 'var(--text-sm)', textDecoration: 'none', transition: 'color var(--duration-fast) var(--ease-out)' }}
        >
          Sign in
        </a>
        <a
          href="/auth/register"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--nav-ink)', padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: 'none', transition: 'background var(--duration-fast) var(--ease-out)' }}
        >
          Sign up
        </a>
      </div>
    );
  }

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--nav-ink-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: 'var(--radius-md)', transition: 'color var(--duration-fast) var(--ease-out)' }}
      >
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(6, 125, 98, 0.2)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
          {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || '?'}
        </div>
        <span style={{ fontSize: 'var(--text-sm)' }} className="nav-user-name">{session.user?.name || session.user?.email}</span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 200, background: 'var(--surface-3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: '4px 0', zIndex: 50, boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--nav-ink)' }}>{session.user?.name}</p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--nav-ink-dim)' }}>{session.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{ width: '100%', textAlign: 'left', padding: '8px 16px', fontSize: 'var(--text-sm)', color: 'var(--nav-ink-dim)', background: 'none', border: 'none', cursor: 'pointer', transition: 'all var(--duration-fast) var(--ease-out)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--nav-ink)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--nav-ink-dim)'; }}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
