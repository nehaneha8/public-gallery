import { useEffect } from 'react';
import { useSceneStore } from '../store/useSceneStore';
import { waypointById, waypointPose } from '../data/waypoints';
import { about } from '../data/about';

export default function AboutFocusOverlay() {
  const cameraMode = useSceneStore((s) => s.cameraMode);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (useSceneStore.getState().cameraMode !== 'VIEWING_ABOUT') return;
      returnToHallway();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function returnToHallway() {
    const state = useSceneStore.getState();
    const wp = waypointById.get(state.activeWaypointId);
    if (!wp) return;
    state.returnFromAbout(waypointPose(wp));
  }

  if (cameraMode !== 'VIEWING_ABOUT' || !about) return null;

  return (
    <div
      onClick={returnToHallway}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        overflowY: 'auto',
        background:
          'radial-gradient(ellipse at center, rgba(10,6,3,0) 35%, rgba(8,5,3,0.85) 100%)',
        cursor: 'pointer',
        fontFamily: 'Georgia, serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          cursor: 'default',
          padding: '28px 30px',
          maxWidth: 480,
          width: '100%',
          background: 'rgba(20, 13, 9, 0.9)',
          border: '1px solid rgba(255,176,102,0.25)',
          borderRadius: 6,
          color: '#f0e6d8',
        }}
      >
        <div style={{ fontSize: 20, letterSpacing: 0.5, textAlign: 'center', marginBottom: 20 }}>
          About the Artist
        </div>

        {about.photoSrc && (
          <img
            src={about.photoSrc}
            alt="The artist"
            style={{
              display: 'block',
              width: '100%',
              maxHeight: 320,
              objectFit: 'cover',
              borderRadius: 4,
              border: '1px solid rgba(255,176,102,0.2)',
              marginBottom: 20,
            }}
          />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {about.prompts.map((p, i) => (
            <div key={i}>
              <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 4 }}>{p.question}</div>
              <div style={{ fontSize: 15, lineHeight: 1.5 }}>{p.answer}</div>
            </div>
          ))}
        </div>

        <button
          onClick={returnToHallway}
          style={{
            marginTop: 24,
            padding: '6px 16px',
            borderRadius: 4,
            border: '1px solid rgba(255,176,102,0.4)',
            background: 'transparent',
            color: '#ffb066',
            fontFamily: 'inherit',
            fontSize: 13,
            cursor: 'pointer',
            display: 'block',
          }}
        >
          ← Return to the hallway
        </button>
      </div>
    </div>
  );
}
