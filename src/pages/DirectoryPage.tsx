import { useEffect, useState, type CSSProperties } from 'react';
import { GLOW_TEXT_STYLE } from '../ui/glowText';
import { navigate } from '../routes/router';
import { fetchDirectory } from '../lib/api';
import AuthButtons from '../ui/AuthButtons';

interface GalleryListing {
  slug: string;
  title: string;
  thumbnail: string | null;
}

export default function DirectoryPage() {
  const [galleries, setGalleries] = useState<GalleryListing[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchDirectory()
      .then((data) => setGalleries(data.galleries))
      .catch((e) => setError(e.message));
  }, []);

  const filtered = galleries?.filter((g) => g.title.toLowerCase().includes(query.trim().toLowerCase()));

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
            <AuthButtons showLoggedOutLinks />
          </div>
        </div>

        {galleries !== null && galleries.length > 0 && (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search galleries…"
            style={searchInputStyle}
          />
        )}

        {error && <p style={{ opacity: 0.7 }}>Couldn't load galleries: {error}</p>}

        {!error && galleries === null && <p style={{ opacity: 0.6 }}>Loading…</p>}

        {galleries?.length === 0 && (
          <p style={{ opacity: 0.7 }}>No galleries yet — be the first to create one.</p>
        )}

        {galleries !== null && galleries.length > 0 && filtered?.length === 0 && (
          <p style={{ opacity: 0.7 }}>No galleries match "{query}".</p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
          {filtered?.map((g) => (
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
              <div style={{ padding: '12px 14px', fontSize: 16 }}>{g.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const searchInputStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  maxWidth: 360,
  padding: '10px 14px',
  marginBottom: 28,
  borderRadius: 6,
  border: '1px solid rgba(255,176,102,0.25)',
  background: 'rgba(255,255,255,0.03)',
  color: '#f0e6d8',
  fontFamily: 'inherit',
  fontSize: 14,
};
