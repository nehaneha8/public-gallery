import { useState, type CSSProperties } from 'react';
import { GLOW_TEXT_STYLE } from '../ui/glowText';
import { navigate } from '../routes/router';

function GlowLink({ label, path }: { label: string; path: string }) {
  const [hovered, setHovered] = useState(false);

  const style: CSSProperties = {
    ...GLOW_TEXT_STYLE,
    fontSize: 'clamp(16px, 2.2vw, 24px)',
    background: 'none',
    border: 'none',
    padding: '8px 16px',
    cursor: 'pointer',
    opacity: hovered ? 1 : 0.85,
    transition: 'opacity 0.2s ease',
  };

  return (
    <button
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(path)}
    >
      {label}
    </button>
  );
}

export default function LandingPage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'clamp(24px, 6vw, 64px)',
        padding: '0 16px',
      }}
    >
      <GlowLink label="Enter Gallery" path="/gallery" />
    </div>
  );
}
