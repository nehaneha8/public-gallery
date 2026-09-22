import { useState, type FormEvent } from 'react';
import { GLOW_TEXT_STYLE } from '../ui/glowText';
import { navigate } from '../routes/router';
import { signup } from '../lib/api';
import { pageStyle, formStyle, inputStyle, submitStyle, linkStyle } from './LoginPage';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signup(email, password, username);
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
        <h1 style={{ ...GLOW_TEXT_STYLE, fontSize: 24, margin: '0 0 8px' }}>Create your gallery</h1>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            pattern="[a-zA-Z0-9-]{3,30}"
            style={inputStyle}
          />
          <div style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>
            Your gallery's address: yoursite.com/g/{username || 'username'} — letters, numbers, and hyphens
            only.
          </div>
        </div>
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
          placeholder="Password (8+ characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={inputStyle}
        />
        {error && <div style={{ color: '#ff9d9d', fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={busy} style={submitStyle}>
          {busy ? 'Creating…' : 'Create my gallery'}
        </button>
        <div style={{ fontSize: 13, opacity: 0.7, textAlign: 'center' }}>
          Already have an account?{' '}
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }} style={linkStyle}>
            Log in
          </a>
        </div>
      </form>
    </div>
  );
}
