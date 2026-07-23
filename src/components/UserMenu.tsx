'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  if (status === 'loading') {
    return <div className="nav-account-skeleton" aria-hidden="true" />;
  }

  // Sign-in/sign-up live on the landing and auth pages — the console itself
  // is usable without an account, so there's nothing to show here.
  if (!session) return null;

  const name = session.user?.name || session.user?.email || '';
  const initial = (session.user?.name?.[0] || session.user?.email?.[0] || '?').toUpperCase();

  const toggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="nav-account-wrap">
      <button
        ref={buttonRef}
        className="nav-account"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="nav-account-avatar">{initial}</span>
        <span className="nav-account-name">{name}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            className="nav-account-backdrop"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
          />
          <div className="nav-account-menu" style={{ top: menuPos.top, right: menuPos.right }}>
            <div className="nav-account-menu-header">
              <p className="nav-account-menu-name">{session.user?.name}</p>
              <p className="nav-account-menu-email">{session.user?.email}</p>
            </div>
            <button
              className="nav-account-menu-item"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
