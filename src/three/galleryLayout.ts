import type { GalleryConfig, ArtworkSize } from '../data/galleryConfig';
import { setArtworks, type Artwork } from '../data/artworks';
import { setWaypoints, type Waypoint } from '../data/waypoints';
import { setSketchPages, setPodium } from '../data/sketchbook';
import { setAbout } from '../data/about';
import { setHallLength, HALL_FRONT_Z } from './hallwayLayout';

// Distance off the centerline paintings hang at — matches HALL_HALF_WIDTH
// (1.3) minus a hair so frames sit just proud of the wall, not through it.
const WALL_X = 1.29;
const HANG_Y = 1.5;
const LEFT_ROTATION_Y = Math.PI / 2;
const RIGHT_ROTATION_Y = -Math.PI / 2;

// Two paintings (one per wall) share each "slot" along -Z. Fixed spacing
// regardless of size — every size category's long edge is well under this,
// so there's never a collision risk between adjacent slots.
const SLOT_SPACING = 2.2;
const FIRST_SLOT_Z = -2;

// Longest edge in meters, by size category the uploader picked.
const SIZE_EDGE: Record<ArtworkSize, number> = { large: 0.9, medium: 0.7, small: 0.5 };
// How far back the camera stands to view each size comfortably.
const SIZE_VIEWING_OFFSET: Record<ArtworkSize, number> = { large: 1.2, medium: 1.0, small: 0.85 };

// Room left beyond the last painting slot for the sketchbook podium and the
// About the Artist frame.
const END_BUFFER = 3.4;
const PODIUM_OFFSET_X = -0.85;
const PODIUM_OFFSET_Z = 0.6;
const ABOUT_WALL_OFFSET = 0.05;

// One waypoint every two slot-rows (~4.4m), matching the density of the
// original hand-placed hallway.
const WAYPOINT_EVERY_N_SLOTS = 2;

function sized(aspectRatio: number, longEdgeMeters: number) {
  return aspectRatio <= 1
    ? { width: longEdgeMeters * aspectRatio, height: longEdgeMeters }
    : { width: longEdgeMeters, height: longEdgeMeters / aspectRatio };
}

export function applyGalleryConfig(config: GalleryConfig) {
  const artworks: Artwork[] = config.artworks.map((input, i) => {
    const slotIndex = Math.floor(i / 2);
    const wallSide: 'left' | 'right' = i % 2 === 0 ? 'left' : 'right';
    const z = FIRST_SLOT_Z - slotIndex * SLOT_SPACING;
    const { width, height } = sized(input.aspectRatio, SIZE_EDGE[input.size]);
    return {
      id: input.id,
      title: input.title,
      blurb: input.description,
      src: input.src,
      aspectRatio: input.aspectRatio,
      width,
      height,
      wallSide,
      position: [wallSide === 'left' ? -WALL_X : WALL_X, HANG_Y, z],
      rotationY: wallSide === 'left' ? LEFT_ROTATION_Y : RIGHT_ROTATION_Y,
      viewingOffset: SIZE_VIEWING_OFFSET[input.size],
    };
  });
  setArtworks(artworks);

  const slotCount = Math.max(1, Math.ceil(config.artworks.length / 2));
  const lastSlotZ = FIRST_SLOT_Z - (slotCount - 1) * SLOT_SPACING;
  const hallBackZ = lastSlotZ - END_BUFFER;
  setHallLength(hallBackZ);

  const waypoints: Waypoint[] = [];
  waypoints.push({
    id: 'entrance',
    position: [0, 1.6, HALL_FRONT_Z - 1],
    lookAt: [0, 1.6, HALL_FRONT_Z - 5],
    showGlow: false,
    connectsTo: [],
  });

  let prevId = 'entrance';
  let wpIndex = 1;
  for (let slot = WAYPOINT_EVERY_N_SLOTS - 1; slot < slotCount; slot += WAYPOINT_EVERY_N_SLOTS) {
    const z = FIRST_SLOT_Z - slot * SLOT_SPACING;
    const id = `wp${wpIndex}`;
    waypoints.push({
      id,
      position: [0, 1.6, z],
      lookAt: [0, 1.6, z - SLOT_SPACING * WAYPOINT_EVERY_N_SLOTS],
      showGlow: true,
      connectsTo: [prevId],
    });
    waypoints[waypoints.length - 2].connectsTo.push(id);
    prevId = id;
    wpIndex++;
  }

  // Final waypoint near the end of the hallway, past the last painting.
  const finalId = `wp${wpIndex}`;
  const finalZ = hallBackZ + 1.6;
  waypoints.push({
    id: finalId,
    position: [0, 1.6, finalZ],
    lookAt: [0, 1.6, hallBackZ],
    showGlow: true,
    connectsTo: [prevId],
  });
  waypoints[waypoints.length - 2].connectsTo.push(finalId);

  setWaypoints(waypoints);

  setSketchPages(config.sketches.map((s) => ({ src: s.src })));

  const podiumZ = lastSlotZ - PODIUM_OFFSET_Z;
  setPodium([PODIUM_OFFSET_X, 0, podiumZ], Math.PI / 2, 0.95);

  setAbout(
    config.about ? { photoSrc: config.about.photoSrc, prompts: config.about.prompts } : null,
    [0, 1.5, hallBackZ + ABOUT_WALL_OFFSET],
  );
}
