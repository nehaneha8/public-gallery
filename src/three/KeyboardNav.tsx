import { useEffect, useMemo, useState } from 'react';
import { Html } from '@react-three/drei';
import { artworks, getViewingPose } from '../data/artworks';
import { waypoints, waypointPose, getNearestWaypointId, getNearestWaypointBehind } from '../data/waypoints';
import { useSceneStore } from '../store/useSceneStore';
import { PODIUM_POSITION, getBookViewingPose } from '../data/sketchbook';
import { about, ABOUT_POSITION, getAboutViewingPose } from '../data/about';

interface Hotspot {
  id: string;
  position: [number, number, number];
  activate: () => void;
}

// Fixed, simple tab order (paintings, then floor markers, then the door)
// rather than a context-aware "what's currently reachable" list — a
// pragmatic simplification given the small size of this scene
// (ARCHITECTURE.md §17).
function useHotspots(): Hotspot[] {
  return useMemo(() => {
    const paintingSpots: Hotspot[] = artworks.map((a) => ({
      id: `artwork:${a.id}`,
      position: a.position,
      activate: () => {
        if (useSceneStore.getState().cameraMode !== 'IDLE') return;
        useSceneStore
          .getState()
          .viewArtwork(a.id, getViewingPose(a), getNearestWaypointBehind(a.position));
      },
    }));

    const waypointSpots: Hotspot[] = waypoints
      .filter((wp) => wp.showGlow)
      .map((wp) => ({
        id: `wp:${wp.id}`,
        position: [wp.position[0], 0.1, wp.position[2]],
        activate: () => {
          if (useSceneStore.getState().cameraMode !== 'IDLE') return;
          useSceneStore.getState().goToWaypoint(wp.id, waypointPose(wp));
        },
      }));

    const aboutSpot: Hotspot | null = about
      ? {
          id: 'about',
          position: ABOUT_POSITION,
          activate: () => {
            const state = useSceneStore.getState();
            if (state.cameraMode !== 'IDLE') return;
            state.viewAbout(getAboutViewingPose(), getNearestWaypointId(ABOUT_POSITION));
          },
        }
      : null;

    const bookSpot: Hotspot = {
      id: 'book',
      position: PODIUM_POSITION,
      activate: () => {
        const state = useSceneStore.getState();
        if (state.cameraMode === 'IDLE') {
          state.viewBook(getBookViewingPose(), getNearestWaypointId(PODIUM_POSITION));
        } else if (state.cameraMode === 'VIEWING_BOOK' && state.bookState === 'CLOSED') {
          state.openBook();
        }
      },
    };

    return [...paintingSpots, ...waypointSpots, bookSpot, ...(aboutSpot ? [aboutSpot] : [])];
  }, []);
}

export default function KeyboardNav() {
  const hotspots = useHotspots();
  const [focusedIndex, setFocusedIndex] = useState(-1);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const cameraMode = useSceneStore.getState().cameraMode;
      if (e.key === 'Tab') {
        if (cameraMode !== 'IDLE') return;
        e.preventDefault();
        setFocusedIndex((i) => {
          const n = hotspots.length;
          if (n === 0) return -1;
          const next = e.shiftKey ? (i - 1 + n) % n : (i + 1) % n;
          return next;
        });
      } else if ((e.key === 'Enter' || e.key === ' ') && focusedIndex >= 0) {
        e.preventDefault();
        hotspots[focusedIndex]?.activate();
      } else if (e.key === 'Escape') {
        setFocusedIndex(-1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hotspots, focusedIndex]);

  const focused = focusedIndex >= 0 ? hotspots[focusedIndex] : null;
  if (!focused) return null;

  return (
    <Html position={focused.position} center zIndexRange={[15, 0]}>
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: '50%',
          border: '2px solid #ffcf8a',
          boxShadow: '0 0 12px rgba(255,207,138,0.6)',
          pointerEvents: 'none',
        }}
      />
    </Html>
  );
}
