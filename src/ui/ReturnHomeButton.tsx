import { useSceneStore } from '../store/useSceneStore';
import { waypointById, waypointPose } from '../data/waypoints';

// Available everywhere in the experience (hallway, mid-painting-view, or
// the bedroom) per the user's request — the one navigation control that
// always works, regardless of where you are.
export default function ReturnHomeButton() {
  const showListFallback = useSceneStore((s) => s.showListFallback);
  const activeWaypointId = useSceneStore((s) => s.activeWaypointId);
  const cameraMode = useSceneStore((s) => s.cameraMode);

  if (showListFallback) return null;
  if (activeWaypointId === 'entrance' && cameraMode === 'IDLE') return null;

  const handleClick = () => {
    const state = useSceneStore.getState();
    if (
      state.cameraMode === 'VIEWING_PAINTING' ||
      state.cameraMode === 'VIEWING_BOOK' ||
      state.cameraMode === 'VIEWING_ABOUT'
    ) {
      // From a painting, the book, or the about frame, "back" means the
      // checkpoint you were just standing at, not a full reset to the
      // entrance.
      const current = waypointById.get(state.activeWaypointId);
      if (!current) return;
      if (state.cameraMode === 'VIEWING_PAINTING') state.returnFromArtwork(waypointPose(current));
      else if (state.cameraMode === 'VIEWING_BOOK') state.returnFromBook(waypointPose(current));
      else state.returnFromAbout(waypointPose(current));
      return;
    }
    const entrance = waypointById.get('entrance');
    if (!entrance) return;
    state.returnToHallwayStart(waypointPose(entrance));
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: 18,
        left: 18,
        zIndex: 25,
        padding: '7px 14px',
        borderRadius: 4,
        border: '1px solid rgba(255,176,102,0.35)',
        background: 'rgba(18, 12, 8, 0.6)',
        color: '#e8cfa8',
        fontFamily: 'Georgia, serif',
        fontSize: 12,
        letterSpacing: 0.3,
        cursor: 'pointer',
      }}
    >
      {cameraMode === 'VIEWING_PAINTING' || cameraMode === 'VIEWING_BOOK' || cameraMode === 'VIEWING_ABOUT'
        ? '← step back'
        : '← return to the hallway'}
    </button>
  );
}
