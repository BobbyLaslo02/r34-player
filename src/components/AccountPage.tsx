import React, { useState } from 'react'
import { signUp, signIn, signInWithGoogle, logOut } from '../firebase'

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '420px', margin: '60px auto', padding: '40px',
    background: 'var(--r34-bgCard)', borderRadius: '12px',
    border: '1px solid var(--r34-border)',
  },
  title: { fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#fff' },
  subtitle: { fontSize: '14px', color: 'var(--r34-textSecondary)', marginBottom: '24px' },
  input: {
    width: '100%', padding: '10px 14px', marginBottom: '12px',
    background: 'var(--r34-bgLight)', border: '1px solid var(--r34-border)',
    borderRadius: '6px', color: '#fff', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box' as const,
  },
  btn: {
    width: '100%', padding: '10px', borderRadius: '6px', border: 'none',
    fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '8px',
  },
  primaryBtn: { background: 'var(--r34-accent)', color: '#000' },
  googleBtn: { background: '#fff', color: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  dangerBtn: { background: '#c0392b', color: '#fff' },
  toggle: {
    background: 'none', border: 'none', color: 'var(--r34-accent)',
    cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
  },
  error: { color: '#e74c3c', fontSize: '13px', marginBottom: '12px' },
  info: { fontSize: '13px', color: 'var(--r34-textSecondary)', marginBottom: '4px' },
  separator: {
    display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0',
    color: 'var(--r34-textSecondary)', fontSize: '12px',
  },
  line: { flex: 1, height: '1px', background: 'var(--r34-border)' },
}

interface AccountPageProps {
  userEmail?: string | null
  userUid?: string | null
  syncStatus?: string
  onSync?: () => void
}

export default function AccountPage({ userEmail, userUid, syncStatus, onSync }: AccountPageProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed')
    } finally { setBusy(false) }
  }

  const handleGoogle = async () => {
    setError('')
    setBusy(true)
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed')
    } finally { setBusy(false) }
  }

  const handleLogout = async () => {
    await logOut()
  }

  if (userUid) {
    return (
      <div style={styles.container}>
        <div style={styles.title}>Account</div>
        <div style={styles.subtitle}>Signed in</div>
        <div style={styles.info}>Email: {userEmail || 'No email'}</div>
        <div style={styles.info}>UID: {userUid.slice(0, 12)}…</div>
        <div style={styles.info}>Sync: {syncStatus || 'idle'}</div>
        <div style={{ height: '16px' }} />
        {onSync && (
          <button style={{ ...styles.btn, ...styles.primaryBtn }} onClick={onSync}>
            ⇅ Sync Now
          </button>
        )}
        <button style={{ ...styles.btn, ...styles.dangerBtn }} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>{isSignUp ? 'Create Account' : 'Sign In'}</div>
      <div style={styles.subtitle}>
        {isSignUp ? 'Sign up to sync your data across devices' : 'Sign in to access your cloud data'}
      </div>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button style={{ ...styles.btn, ...styles.primaryBtn }} type="submit" disabled={busy}>
          {busy ? '⋯' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <div style={styles.separator}>
        <div style={styles.line} />
        <span>or</span>
        <div style={styles.line} />
      </div>
      <button style={{ ...styles.btn, ...styles.googleBtn }} onClick={handleGoogle} disabled={busy}>
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z"/></svg>
        Sign in with Google
      </button>
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <button style={styles.toggle} onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
