import { useSceneStore } from '../store/useSceneStore';
import { navigate } from '../routes/router';

// Deliberately the only persistent chrome (DESIGN.md: "Traditional UI
// should be extremely minimal").
export default function MinimalUI() {
  const showListFallback = useSceneStore((s) => s.showListFallback);
  const setShowListFallback = useSceneStore((s) => s.setShowListFallback);
  const cameraMode = useSceneStore((s) => s.cameraMode);

  if (
    showListFallback ||
    cameraMode === 'VIEWING_PAINTING' ||
    cameraMode === 'VIEWING_BOOK' ||
    cameraMode === 'VIEWING_ABOUT'
  )
    return null;

  return (
    <>
      <button
        onClick={() => navigate('/')}
        aria-label="Back to home"
        style={{
          position: 'fixed',
          top: 14,
          left: 16,
          zIndex: 15,
          background: 'transparent',
          border: 'none',
          padding: 2,
          cursor: 'pointer',
          color: 'rgba(247, 246, 245, 0.65)',
          filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.6))',
        }}
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5.5 10v9a1 1 0 0 0 1 1H9.5v-6h5v6H17.5a1 1 0 0 0 1-1v-9" />
        </svg>
      </button>

      <button
        onClick={() => setShowListFallback(true)}
        style={{
          position: 'fixed',
          top: 14,
          right: 16,
          zIndex: 15,
          background: 'transparent',
          border: 'none',
          color: 'rgba(247, 246, 245, 0.9)',
          fontFamily: 'Georgia, serif',
          fontSize: 16,
          letterSpacing: 0.4,
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          textShadow: '0 0 6px rgba(255,255,255,0.35)',
        }}
      >
        View as list
      </button>
    </>
  );
}
