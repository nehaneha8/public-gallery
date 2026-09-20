import { create } from 'zustand';

export type CameraMode = 'IDLE' | 'MOVING' | 'VIEWING_PAINTING' | 'VIEWING_BOOK' | 'VIEWING_ABOUT';
export type BookState = 'CLOSED' | 'OPENING' | 'OPEN';

export interface Pose {
  position: [number, number, number];
  lookAt: [number, number, number];
}

interface SceneState {
  cameraMode: CameraMode;
  activeWaypointId: string;
  previousWaypointId: string | null;
  viewedArtworkId: string | null;
  bookState: BookState;
  currentSpread: number;
  flipDirection: 'next' | 'prev' | null;
  moveTarget: Pose | null;
  afterMoveMode: CameraMode;
  reducedMotion: boolean;
  showListFallback: boolean;

  goToWaypoint: (id: string, pose: Pose) => void;
  viewArtwork: (id: string, pose: Pose, nearestWaypointId: string) => void;
  returnFromArtwork: (pose: Pose) => void;
  viewBook: (pose: Pose, nearestWaypointId: string) => void;
  returnFromBook: (pose: Pose) => void;
  openBook: () => void;
  setCurrentSpread: (n: number) => void;
  requestPageFlip: (direction: 'next' | 'prev') => void;
  completePageFlip: (newSpread: number) => void;
  arrivedAtTarget: () => void;
  viewAbout: (pose: Pose, nearestWaypointId: string) => void;
  returnFromAbout: (pose: Pose) => void;
  returnToHallwayStart: (pose: Pose) => void;
  setShowListFallback: (show: boolean) => void;
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

export const useSceneStore = create<SceneState>((set, get) => ({
  cameraMode: 'IDLE',
  activeWaypointId: 'entrance',
  previousWaypointId: null,
  viewedArtworkId: null,
  bookState: 'CLOSED',
  currentSpread: 0,
  flipDirection: null,
  moveTarget: null,
  afterMoveMode: 'IDLE',
  reducedMotion: prefersReducedMotion,
  showListFallback: false,

  goToWaypoint: (id, pose) => {
    const { activeWaypointId, cameraMode } = get();
    if (cameraMode !== 'IDLE' || id === activeWaypointId) return;
    set({
      cameraMode: 'MOVING',
      previousWaypointId: activeWaypointId,
      activeWaypointId: id,
      moveTarget: pose,
      afterMoveMode: 'IDLE',
    });
  },

  viewArtwork: (id, pose, nearestWaypointId) => {
    if (get().cameraMode !== 'IDLE') return;
    // Treat "viewing this painting" as also standing at its nearest
    // checkpoint, even if you jumped straight here (e.g. from the entrance
    // on first load) without ever clicking a floor-glow marker along the
    // way — otherwise "step back" would return you to wherever you
    // technically last stood, which could be much further away.
    set({
      cameraMode: 'MOVING',
      previousWaypointId: get().activeWaypointId,
      activeWaypointId: nearestWaypointId,
      viewedArtworkId: id,
      moveTarget: pose,
      afterMoveMode: 'VIEWING_PAINTING',
    });
  },

  returnFromArtwork: (pose) => {
    if (get().cameraMode !== 'VIEWING_PAINTING') return;
    set({
      cameraMode: 'MOVING',
      viewedArtworkId: null,
      moveTarget: pose,
      afterMoveMode: 'IDLE',
    });
  },

  viewBook: (pose, nearestWaypointId) => {
    if (get().cameraMode !== 'IDLE') return;
    set({
      cameraMode: 'MOVING',
      previousWaypointId: get().activeWaypointId,
      activeWaypointId: nearestWaypointId,
      moveTarget: pose,
      afterMoveMode: 'VIEWING_BOOK',
    });
  },

  returnFromBook: (pose) => {
    if (get().cameraMode !== 'VIEWING_BOOK') return;
    // Closing the book behind you (rather than leaving it open for next
    // time) so each visit starts the same way, per the user's request.
    set({
      cameraMode: 'MOVING',
      moveTarget: pose,
      afterMoveMode: 'IDLE',
      bookState: 'CLOSED',
      currentSpread: 0,
      flipDirection: null,
    });
  },

  openBook: () => {
    if (get().bookState !== 'CLOSED') return;
    set({ bookState: 'OPENING' });
  },

  setCurrentSpread: (n) => set({ currentSpread: n }),

  requestPageFlip: (direction) => {
    if (get().flipDirection || get().bookState !== 'OPEN') return;
    set({ flipDirection: direction });
  },

  completePageFlip: (newSpread) => {
    set({ currentSpread: newSpread, flipDirection: null });
  },

  arrivedAtTarget: () => {
    set({ cameraMode: get().afterMoveMode, moveTarget: null });
  },

  viewAbout: (pose, nearestWaypointId) => {
    if (get().cameraMode !== 'IDLE') return;
    set({
      cameraMode: 'MOVING',
      previousWaypointId: get().activeWaypointId,
      activeWaypointId: nearestWaypointId,
      moveTarget: pose,
      afterMoveMode: 'VIEWING_ABOUT',
    });
  },

  returnFromAbout: (pose) => {
    if (get().cameraMode !== 'VIEWING_ABOUT') return;
    set({
      cameraMode: 'MOVING',
      moveTarget: pose,
      afterMoveMode: 'IDLE',
    });
  },

  // Always-available "take me back to the start" (usable from the hallway,
  // mid-painting-view, or the bedroom) — the one navigation option that
  // works everywhere per the user's request.
  returnToHallwayStart: (pose) => {
    if (get().cameraMode === 'MOVING') return;
    set({
      previousWaypointId: get().activeWaypointId,
      activeWaypointId: 'entrance',
      viewedArtworkId: null,
      cameraMode: 'MOVING',
      moveTarget: pose,
      afterMoveMode: 'IDLE',
    });
  },

  setShowListFallback: (show) => set({ showListFallback: show }),
}));
