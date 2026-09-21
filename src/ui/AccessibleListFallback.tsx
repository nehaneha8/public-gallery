import { useState, type CSSProperties } from 'react';
import { artworks } from '../data/artworks';
import { useSceneStore } from '../store/useSceneStore';

export function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

const buttonStyle: CSSProperties = {
  padding: '8px 16px',
  borderRadius: 4,
  border: '1px solid rgba(255,176,102,0.4)',
  background: 'transparent',
  color: '#ffb066',
  fontFamily: 'inherit',
  fontSize: 13,
  cursor: 'pointer',
};

export default function AccessibleListFallback({ forced }: { forced: boolean }) {
  const setShowListFallback = useSceneStore((s) => s.setShowListFallback);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? artworks.find((a) => a.id === selectedId) : null;

  if (selected) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          overflowY: 'auto',
          background: '#120c08',
          color: '#f0e6d8',
          fontFamily: 'Georgia, serif',
          padding: '32px 20px 60px',
          zIndex: 30,
        }}
      >
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedId(null)} style={buttonStyle}>
              ← Return to list
            </button>
            {!forced && (
              <button
                onClick={() => {
                  setSelectedId(null);
                  setShowListFallback(false);
                }}
                style={buttonStyle}
              >
                ← Return to the hallway
              </button>
            )}
          </div>
          <img
            src={selected.src}
            alt={selected.title || 'Untitled'}
            style={{
              display: 'block',
              width: '100%',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: 4,
              border: '1px solid rgba(255,176,102,0.2)',
            }}
          />
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 20 }}>{selected.title || 'Untitled'}</div>
            {selected.blurb && (
              <div style={{ fontSize: 14, opacity: 0.75, marginTop: 6 }}>{selected.blurb}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflowY: 'auto',
        background: '#120c08',
        color: '#f0e6d8',
        fontFamily: 'Georgia, serif',
        padding: '32px 20px 60px',
        zIndex: 30,
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 400, marginBottom: 4 }}>All of it</h1>
        <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 28 }}>
          {forced
            ? 'Your browser or device can’t run the 3D version, so here’s the collection as a plain list.'
            : 'List of all my art, click to expand.'}
        </p>
        {!forced && (
          <button
            onClick={() => setShowListFallback(false)}
            style={{ ...buttonStyle, marginBottom: 28 }}
          >
            ← Back to the gallery
          </button>
        )}
        <div style={{ display: 'grid', gap: 24 }}>
          {artworks.map((a) => (
            <figure
              key={a.id}
              onClick={() => setSelectedId(a.id)}
              style={{
                margin: 0,
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <img
                src={a.src}
                alt={a.title || 'Untitled'}
                style={{
                  width: 120,
                  height: 120,
                  objectFit: 'cover',
                  borderRadius: 4,
                  border: '1px solid rgba(255,176,102,0.2)',
                }}
              />
              <figcaption>
                <div style={{ fontSize: 16 }}>{a.title || 'Untitled'}</div>
                {a.blurb && <div style={{ fontSize: 13, opacity: 0.7 }}>{a.blurb}</div>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
