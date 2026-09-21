export type ArtworkSize = 'small' | 'medium' | 'large';

export interface ArtworkInput {
  id: string;
  title: string;
  description?: string;
  src: string;
  aspectRatio: number;
  size: ArtworkSize;
}

export interface SketchInput {
  id: string;
  src: string;
}

export interface AboutPromptInput {
  question: string;
  answer: string;
}

export interface AboutInput {
  photoSrc?: string;
  prompts: AboutPromptInput[];
}

// The full description of one artist's gallery — this is what an upload
// dashboard produces and what a `/api/gallery/:slug` response should shape
// itself into. `applyGalleryConfig()` in galleryLayout.ts turns this into
// the actual 3D positions/waypoints/hallway length.
export interface GalleryConfig {
  slug: string;
  displayName: string;
  // The gallery's display title — defaults to "{displayName}'s Gallery"
  // but the artist can fully customize it from the dashboard; always a
  // ready-to-display string, resolved server-side.
  title: string;
  artworks: ArtworkInput[];
  sketches: SketchInput[];
  about: AboutInput | null;
}
