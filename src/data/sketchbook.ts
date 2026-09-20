import type { Pose } from '../store/useSceneStore';

// Populated at gallery-load time by galleryLayout.ts's applyGalleryConfig().
export interface SketchPage {
  src: string;
}

export let sketchPages: SketchPage[] = [];

export function setSketchPages(pages: SketchPage[]) {
  sketchPages = pages;
}

export interface Spread {
  left: string | null;
  right: string | null;
}

// Always at least one (blank) spread so the book has something to show
// before any sketches are added.
export function getSpreads(): Spread[] {
  if (sketchPages.length === 0) return [{ left: null, right: null }];
  const spreads: Spread[] = [];
  for (let i = 0; i < sketchPages.length; i += 2) {
    spreads.push({ left: sketchPages[i]?.src ?? null, right: sketchPages[i + 1]?.src ?? null });
  }
  return spreads;
}

// Podium placement — off the walking centerline (x=0) so the camera tween
// between hallway waypoints never passes through it. Computed per-gallery
// from the hallway length by galleryLayout.ts (near the end of the
// hallway, rotated perpendicular to it, facing +X out toward the
// centerline).
export let PODIUM_POSITION: [number, number, number] = [-0.85, 0, -16.6];
export let PODIUM_ROTATION_Y = Math.PI / 2;
export let PODIUM_VIEWING_OFFSET = 0.95;

export function setPodium(position: [number, number, number], rotationY: number, viewingOffset: number) {
  PODIUM_POSITION = position;
  PODIUM_ROTATION_Y = rotationY;
  PODIUM_VIEWING_OFFSET = viewingOffset;
}

const EYE_HEIGHT = 1.6;
const BOOK_LOOK_HEIGHT = 1.05;

export function getBookViewingPose(): Pose {
  const normalX = Math.sin(PODIUM_ROTATION_Y);
  const normalZ = Math.cos(PODIUM_ROTATION_Y);
  return {
    position: [
      PODIUM_POSITION[0] + normalX * PODIUM_VIEWING_OFFSET,
      EYE_HEIGHT,
      PODIUM_POSITION[2] + normalZ * PODIUM_VIEWING_OFFSET,
    ],
    lookAt: [PODIUM_POSITION[0], BOOK_LOOK_HEIGHT, PODIUM_POSITION[2]],
  };
}

// Second-click pose: tips the view down toward the open pages — closer to a
// bird's-eye look-down than the more upright, stand-back framing of
// getBookViewingPose — so the sketches actually fill the frame once the
// book is open. Offset stays nonzero (never fully vertical) since
// camera.lookAt's basis gets numerically unstable as the view direction
// approaches straight down.
const READING_EYE_HEIGHT = 1.65;
const READING_OFFSET = 0.2;
const READING_SURFACE_Y = 0.98;

export function getBookReadingPose(): Pose {
  const normalX = Math.sin(PODIUM_ROTATION_Y);
  const normalZ = Math.cos(PODIUM_ROTATION_Y);
  return {
    position: [
      PODIUM_POSITION[0] + normalX * READING_OFFSET,
      READING_EYE_HEIGHT,
      PODIUM_POSITION[2] + normalZ * READING_OFFSET,
    ],
    lookAt: [PODIUM_POSITION[0], READING_SURFACE_Y, PODIUM_POSITION[2]],
  };
}
