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

// Like getNearestWaypointId, but only considers waypoints no further into
// the hallway than `position` (i.e. at the same depth or closer to the
// entrance). Every waypoint's lookAt faces deeper into the hallway (more
// negative Z), so a checkpoint picked this way still faces toward — and
// keeps in view — whatever's at `position`, rather than one past it that
// would face away, leaving it behind the camera. Used when returning from
// a painting so it stays visible after stepping back.
export function getNearestWaypointBehind(position: [number, number, number]): string {
  const candidates = waypoints.filter((wp) => wp.position[2] >= position[2]);
  const pool = candidates.length > 0 ? candidates : waypoints;
  let bestId = pool[0]?.id ?? 'entrance';
  let bestDist = Infinity;
  for (const wp of pool) {
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
