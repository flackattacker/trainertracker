"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../page.module.css';
import { Button } from '@repo/ui/button';

export default function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3001/api/auth/client-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem('client-portal-token', data.token);
      localStorage.setItem('client-portal-user', JSON.stringify(data.user));
      router.push('/client');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1>Client Portal Login</h1>
          <p>Access your training and progress</p>
        </div>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div className={styles.loginForm}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={styles.input}
          />
          <div className={styles.loginButtons}>
            <Button appName="web" onClick={handleLogin} disabled={loading} className={styles.primaryButton}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 