import { useEffect, useState } from 'react';
import type { GalleryConfig } from '../data/galleryConfig';
import { fetchGallery } from '../lib/api';
import GalleryApp from './GalleryApp';
import { navigate } from '../routes/router';

export default function GalleryRoute({ slug }: { slug: string }) {
  const [config, setConfig] = useState<GalleryConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfig(null);
    setError(null);
    fetchGallery(slug)
      .then(setConfig)
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#000',
          color: '#f0e6d8',
          fontFamily: 'Georgia, serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <p>Couldn't find that gallery.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: '1px solid rgba(255,176,102,0.4)',
            background: 'transparent',
            color: '#ffb066',
            fontFamily: 'inherit',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ← Back to galleries
        </button>
      </div>
    );
  }

  if (!config) return null;

  return <GalleryApp config={config} />;
}
