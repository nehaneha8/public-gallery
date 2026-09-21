import type { CSSProperties } from 'react';
import { useAuthUser } from '../lib/useAuthUser';
import { navigate } from '../routes/router';
import { logout } from '../lib/api';

// Logged in: "Edit my gallery" + "Log out" everywhere the caller mounts
// this (directory, your own gallery, someone else's gallery). Logged out:
// "Log in" + "Create your gallery", but only where the caller opts in via
// `showLoggedOutLinks` — the home directory only, per the design.
export default function AuthButtons({
  showLoggedOutLinks = false,
  buttonStyle,
}: {
  showLoggedOutLinks?: boolean;
  buttonStyle?: CSSProperties;
}) {
  const user = useAuthUser();
  const style = { ...defaultButtonStyle, ...buttonStyle };

  if (user === undefined) return null; // still checking — avoid flashing the wrong state

  if (user) {
    return (
      <>
        <button onClick={() => navigate('/dashboard')} style={style}>
          Edit my gallery
        </button>
        <button onClick={() => logout().then(() => navigate('/'))} style={style}>
          Log out
        </button>
      </>
    );
  }

  if (!showLoggedOutLinks) return null;

  return (
    <>
      <button onClick={() => navigate('/login')} style={style}>
        Log in
      </button>
      <button onClick={() => navigate('/signup')} style={{ ...style, borderColor: 'rgba(255,176,102,0.6)' }}>
        Create your gallery
      </button>
    </>
  );
}

const defaultButtonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 4,
  border: '1px solid rgba(255,176,102,0.3)',
  background: 'transparent',
  color: '#ffb066',
  fontFamily: 'inherit',
  fontSize: 13,
  cursor: 'pointer',
};
