import { waypoints } from '../data/waypoints';
import { useSceneStore } from '../store/useSceneStore';
import FloorGlowPoint from './FloorGlowPoint';

export default function FloorGlowPoints() {
  const activeWaypointId = useSceneStore((s) => s.activeWaypointId);
  const cameraMode = useSceneStore((s) => s.cameraMode);

  if (
    cameraMode === 'VIEWING_PAINTING' ||
    cameraMode === 'VIEWING_BOOK' ||
    cameraMode === 'VIEWING_ABOUT'
  )
    return null;

  return (
    <>
      {waypoints
        .filter((wp) => wp.showGlow && wp.id !== activeWaypointId)
        .map((wp) => (
          <FloorGlowPoint key={wp.id} waypoint={wp} />
        ))}
    </>
  );
}
