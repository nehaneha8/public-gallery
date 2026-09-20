// Shared dimensions so Hallway/HallwayDecor/AboutFrame never drift apart.
export const HALL_HALF_WIDTH = 1.3;
export const HALL_HEIGHT = 2.6;
export const HALL_FRONT_Z = 2;

// How far back the hallway extends — computed per-gallery from the number
// of paintings by galleryLayout.ts's applyGalleryConfig() (more paintings,
// longer hallway), not a fixed constant.
export let HALL_BACK_Z = -19;

export function setHallLength(backZ: number) {
  HALL_BACK_Z = backZ;
}
