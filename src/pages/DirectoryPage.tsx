import { useEffect, useState, type CSSProperties } from 'react';
import { GLOW_TEXT_STYLE } from '../ui/glowText';
import { navigate } from '../routes/router';
import { fetchDirectory } from '../lib/api';

interface GalleryListing {
  slug: string;
  displayName: string;
  thumbnail: string | null;
}

export default function DirectoryPage() {
  const [galleries, setGalleries] = useState<GalleryListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDirectory()
      .then((data) => setGalleries(data.galleries))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#f0e6d8',
        fontFamily: 'Georgia, serif',
        padding: '48px 20px 80px',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ ...GLOW_TEXT_STYLE, fontSize: 'clamp(22px, 3.5vw, 34px)', margin: 0 }}>Galleries</h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/login')} style={navButtonStyle}>
              Log in
            </button>
            <button onClick={() => navigate('/signup')} style={{ ...navButtonStyle, borderColor: 'rgba(255,176,102,0.6)' }}>
              Create your gallery
            </button>
          </div>
        </div>

        {error && <p style={{ opacity: 0.7 }}>Couldn't load galleries: {error}</p>}

        {!error && galleries === null && <p style={{ opacity: 0.6 }}>Loading…</p>}

        {galleries?.length === 0 && (
          <p style={{ opacity: 0.7 }}>No galleries yet — be the first to create one.</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
          {galleries?.map((g) => (
            <button
              key={g.slug}
              onClick={() => navigate(`/g/${g.slug}`)}
              style={{
                display: 'block',
                textAlign: 'left',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,176,102,0.2)',
                borderRadius: 6,
                padding: 0,
                cursor: 'pointer',
                overflow: 'hidden',
                color: 'inherit',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '4 / 3',
                  background: g.thumbnail ? `#1a1310 url(${g.thumbnail}) center/cover` : '#1a1310',
                }}
              />
              <div style={{ padding: '12px 14px', fontSize: 16 }}>{g.displayName}'s Gallery</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const navButtonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 4,
  border: '1px solid rgba(255,176,102,0.3)',
  background: 'transparent',
  color: '#ffb066',
  fontFamily: 'inherit',
  fontSize: 13,
  cursor: 'pointer',
};
