'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@astryxdesign/core/Button';
import { Banner } from '@astryxdesign/core/Banner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <div className="auth-header">
          <Link href="/" className="auth-brand">AdConsole</Link>
          <p className="auth-subtitle">Sign in to your training account</p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <Banner
                status="error"
                title="Sign in failed"
                description={error}
              />
            )}

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              label={loading ? 'Signing in…' : 'Sign in'}
              isDisabled={loading}
              style={{ width: '100%' }}
            />
          </form>

          <p className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="auth-link">Create one</Link>
          </p>
        </div>

        <p className="auth-back">
          <Link href="/" className="auth-link">Back to simulator</Link>
        </p>
      </div>
    </div>
  );
}
