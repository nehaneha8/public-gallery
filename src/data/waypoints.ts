import type { Pose } from '../store/useSceneStore';

export interface Waypoint {
  id: string;
  position: [number, number, number];
  lookAt: [number, number, number];
  showGlow: boolean;
  connectsTo: string[];
}

export function waypointPose(wp: Waypoint): Pose {
  return { position: wp.position, lookAt: wp.lookAt };
}

// Populated at gallery-load time by galleryLayout.ts's applyGalleryConfig()
// — generated from the current gallery's hallway length, not hand-authored.
export let waypoints: Waypoint[] = [];
export let waypointById: Map<string, Waypoint> = new Map();

export function setWaypoints(list: Waypoint[]) {
  waypoints = list;
  waypointById = new Map(list.map((w) => [w.id, w]));
}

// Which waypoint counts as "standing next to" a given point in the
// hallway — used so viewing a painting/book/about (even reached by
// clicking straight from the entrance on first load, with no prior
// floor-glow navigation) still returns you to the checkpoint nearest that
// point, not wherever you technically last clicked a glow point.
export function getNearestWaypointId(position: [number, number, number]): string {
  let bestId = waypoints[0]?.id ?? 'entrance';
  let bestDist = Infinity;
  for (const wp of waypoints) {
    const dz = wp.position[2] - position[2];
    const dx = wp.position[0] - position[0];
    const dist = dx * dx + dz * dz;
    if (dist < bestDist) {
      bestDist = dist;
      bestId = wp.id;
    }
  }
  return bestId;
}
