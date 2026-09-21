import { useEffect } from 'react';
import { useSceneStore } from '../store/useSceneStore';
import { artworkById } from '../data/artworks';
import { waypointById, waypointPose } from '../data/waypoints';

export default function PaintingFocusOverlay() {
  const viewedArtworkId = useSceneStore((s) => s.viewedArtworkId);
  const cameraMode = useSceneStore((s) => s.cameraMode);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const state = useSceneStore.getState();
      if (state.cameraMode !== 'VIEWING_PAINTING' || !state.viewedArtworkId) return;
      returnToHallway();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  function returnToHallway() {
    const state = useSceneStore.getState();
    const wp = waypointById.get(state.activeWaypointId);
    if (!wp) return;
    state.returnFromArtwork(waypointPose(wp));
  }

  const visible = cameraMode === 'VIEWING_PAINTING' && viewedArtworkId;
  if (!visible) return null;

  const artwork = artworkById.get(viewedArtworkId);

  return (
    <div
      onClick={returnToHallway}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        background:
          'radial-gradient(ellipse at center, rgba(10,6,3,0) 35%, rgba(8,5,3,0.72) 100%)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          cursor: 'default',
          margin: '0 0 40px',
          padding: '14px 22px',
          maxWidth: 420,
          background: 'rgba(20, 13, 9, 0.85)',
          border: '1px solid rgba(255,176,102,0.25)',
          borderRadius: 6,
          color: '#f0e6d8',
          textAlign: 'center',
        }}
      >
        {artwork?.title && <div style={{ fontSize: 18, letterSpacing: 0.5 }}>{artwork.title}</div>}
        {artwork?.blurb && (
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6 }}>{artwork.blurb}</div>
        )}
        <button
          onClick={returnToHallway}
          style={{
            marginTop: 12,
            padding: '6px 16px',
            borderRadius: 4,
            border: '1px solid rgba(255,176,102,0.4)',
            background: 'transparent',
            color: '#ffb066',
            fontFamily: 'inherit',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ← Return to the hallway
        </button>
      </div>
    </div>
  );
}
