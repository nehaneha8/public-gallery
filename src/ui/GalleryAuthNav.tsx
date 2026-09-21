import { useSceneStore } from '../store/useSceneStore';
import AuthButtons from './AuthButtons';

// Persistent "Edit my gallery" / "Log out" while walking any gallery
// (yours or someone else's) — logged-out visitors see nothing here (per
// the design, the login/signup links only live on the home directory).
// Sits below MinimalUI's "View as list" link to avoid overlapping it.
export default function GalleryAuthNav() {
  const showListFallback = useSceneStore((s) => s.showListFallback);
  const cameraMode = useSceneStore((s) => s.cameraMode);

  if (
    showListFallback ||
    cameraMode === 'VIEWING_PAINTING' ||
    cameraMode === 'VIEWING_BOOK' ||
    cameraMode === 'VIEWING_ABOUT'
  )
    return null;

  return (
    <div style={{ position: 'fixed', top: 46, right: 16, zIndex: 15, display: 'flex', gap: 8 }}>
      <AuthButtons
        buttonStyle={{
          padding: '5px 12px',
          fontSize: 11,
          background: 'rgba(18, 12, 8, 0.6)',
        }}
      />
    </div>
  );
}
