'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { HStack, Stack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';

interface MenuItem {
  key: string;
  label: string;
  onClick?: () => void;
}

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

  const items: MenuItem[] = [
    {
      key: 'signout',
      label: 'Sign out',
      onClick: () => signOut({ callbackUrl: '/' }),
    },
  ];

  return (
    <div className="nav-account-wrap">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        label={name}
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
        width="auto"
        style={{
          padding: '4px 8px',
          minWidth: 0,
          maxWidth: 200,
        }}
      >
        <HStack gap={2} vAlign="center" style={{ minWidth: 0, maxWidth: '100%' }}>
          <span
            className="nav-account-avatar"
            aria-hidden="true"
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'var(--surface-2, #e5e7eb)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-xs, 0.75rem)',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {initial}
          </span>
          <Text
            type="body"
            weight="medium"
            maxLines={1}
            hasTruncateTooltip
            style={{
              minWidth: 0,
              maxWidth: 160,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </Text>
        </HStack>
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="nav-account-backdrop"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
          />
          <div
            className="nav-account-menu"
            style={{ top: menuPos.top, right: menuPos.right, minWidth: 200, maxWidth: 280 }}
          >
            <Stack gap={1}>
              <div className="nav-account-menu-header">
                <Text
                  type="body"
                  weight="semibold"
                  maxLines={1}
                  hasTruncateTooltip
                >
                  {session.user?.name}
                </Text>
                <Text
                  type="supporting"
                  size="sm"
                  maxLines={1}
                  hasTruncateTooltip
                  style={{ display: 'block' }}
                >
                  {session.user?.email}
                </Text>
              </div>
              {items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className="nav-account-menu-item"
                  onClick={item.onClick}
                >
                  {item.label}
                </button>
              ))}
            </Stack>
          </div>
        </>
      )}
    </div>
  );
}
