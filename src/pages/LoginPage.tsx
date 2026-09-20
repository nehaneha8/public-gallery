import { useState, type CSSProperties, type FormEvent } from 'react';
import { GLOW_TEXT_STYLE } from '../ui/glowText';
import { navigate } from '../routes/router';
import { login } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={pageStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h1 style={{ ...GLOW_TEXT_STYLE, fontSize: 24, margin: '0 0 8px' }}>Log in</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        {error && <div style={{ color: '#ff9d9d', fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={busy} style={submitStyle}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
        <div style={{ fontSize: 13, opacity: 0.7, textAlign: 'center' }}>
          No account?{' '}
          <a href="/signup" onClick={(e) => { e.preventDefault(); navigate('/signup'); }} style={linkStyle}>
            Create your gallery
          </a>
        </div>
      </form>
    </div>
  );
}

export const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#000000',
  color: '#f0e6d8',
  fontFamily: 'Georgia, serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
};

export const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
  width: '100%',
  maxWidth: 340,
};

export const inputStyle: CSSProperties = {
  padding: '10px 12px',
  borderRadius: 4,
  border: '1px solid rgba(255,176,102,0.3)',
  background: 'rgba(255,255,255,0.03)',
  color: '#f0e6d8',
  fontFamily: 'inherit',
  fontSize: 14,
};

export const submitStyle: CSSProperties = {
  padding: '10px 14px',
  borderRadius: 4,
  border: '1px solid rgba(255,176,102,0.5)',
  background: 'rgba(255,176,102,0.1)',
  color: '#ffb066',
  fontFamily: 'inherit',
  fontSize: 14,
  cursor: 'pointer',
};

export const linkStyle: CSSProperties = { color: '#ffb066' };
