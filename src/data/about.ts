import type { Pose } from '../store/useSceneStore';

export interface AboutPrompt {
  question: string;
  answer: string;
}

export interface AboutConfig {
  photoSrc?: string;
  prompts: AboutPrompt[];
}

// null = the artist opted out of an "About the Artist" section entirely.
// Populated at gallery-load time by galleryLayout.ts's applyGalleryConfig().
export let about: AboutConfig | null = null;
export let ABOUT_POSITION: [number, number, number] = [0, 1.5, -19];

export function setAbout(config: AboutConfig | null, position: [number, number, number]) {
  about = config;
  ABOUT_POSITION = position;
}

const EYE_HEIGHT = 1.6;
const VIEWING_OFFSET = 1.1;

export function getAboutViewingPose(): Pose {
  return {
    position: [ABOUT_POSITION[0], EYE_HEIGHT, ABOUT_POSITION[2] + VIEWING_OFFSET],
    lookAt: [ABOUT_POSITION[0], ABOUT_POSITION[1], ABOUT_POSITION[2]],
  };
}
