import type { Pose } from '../store/useSceneStore';

export interface Artwork {
  id: string;
  title: string;
  blurb?: string;
  src: string;
  aspectRatio: number; // width / height, measured from the processed image
  width: number; // meters
  height: number; // meters
  wallSide: 'left' | 'right';
  position: [number, number, number];
  rotationY: number;
  viewingOffset: number;
}

// Populated at gallery-load time by galleryLayout.ts's applyGalleryConfig()
// — this module holds whichever gallery is currently on screen (one gallery
// per page load), not a fixed hardcoded list.
export let artworks: Artwork[] = [];
export let artworkById: Map<string, Artwork> = new Map();

export function setArtworks(list: Artwork[]) {
  artworks = list;
  artworkById = new Map(list.map((a) => [a.id, a]));
}

const EYE_HEIGHT = 1.6;

// Camera pose to stand directly in front of a painting (ARCHITECTURE.md §5).
export function getViewingPose(artwork: Artwork): Pose {
  const normalX = Math.sin(artwork.rotationY);
  const normalZ = Math.cos(artwork.rotationY);
  return {
    position: [
      artwork.position[0] + normalX * artwork.viewingOffset,
      EYE_HEIGHT,
      artwork.position[2] + normalZ * artwork.viewingOffset,
    ],
    lookAt: [artwork.position[0], artwork.position[1], artwork.position[2]],
  };
}
