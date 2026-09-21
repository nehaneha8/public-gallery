import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import CameraRig from '../three/CameraRig';
import Lighting from '../three/Lighting';
import Hallway from '../three/Hallway';
import HallwayDecor from '../three/HallwayDecor';
import PaintingWall from '../three/PaintingWall';
import FloorGlowPoints from '../three/FloorGlowPoints';
import AboutFrame from '../three/AboutFrame';
import Podium from '../three/Podium';
import Atmosphere from '../three/Atmosphere';
import KeyboardNav from '../three/KeyboardNav';
import LoadingScreen from '../ui/LoadingScreen';
import TitleCard from '../ui/TitleCard';
import PaintingFocusOverlay from '../ui/PaintingFocusOverlay';
import BookFocusOverlay from '../ui/BookFocusOverlay';
import AboutFocusOverlay from '../ui/AboutFocusOverlay';
import MinimalUI from '../ui/MinimalUI';
import ReturnHomeButton from '../ui/ReturnHomeButton';
import GalleryAuthNav from '../ui/GalleryAuthNav';
import AccessibleListFallback, { hasWebGL2 } from '../ui/AccessibleListFallback';
import { useSceneStore } from '../store/useSceneStore';
import { applyGalleryConfig } from '../three/galleryLayout';
import { fixtureGallery } from '../data/fixtureGallery';
import type { GalleryConfig } from '../data/galleryConfig';

export default function GalleryApp({ config = fixtureGallery }: { config?: GalleryConfig }) {
  const webgl2 = useMemo(hasWebGL2, []);
  const showListFallback = useSceneStore((s) => s.showListFallback);

  // Compute the whole gallery's layout (artwork positions, waypoints,
  // hallway length, podium, about placement) once per config, before
  // anything below reads from src/data/{artworks,waypoints,sketchbook,about}.
  useMemo(() => applyGalleryConfig(config), [config]);

  if (!webgl2) {
    return (
      <>
        <AccessibleListFallback forced />
        <GalleryAuthNav />
      </>
    );
  }

  return (
    <>
      <Canvas
        gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.35 }}
        camera={{ fov: 60, near: 0.1, far: 50, position: [0, 1.6, 1] }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <CameraRig />
          <Lighting />
          <Hallway />
          <HallwayDecor />
          <PaintingWall />
          <FloorGlowPoints />
          <AboutFrame />
          <Podium />
          <Atmosphere />
          <KeyboardNav />
        </Suspense>
      </Canvas>
      <LoadingScreen />
      <TitleCard title={config.title} />
      <PaintingFocusOverlay />
      <BookFocusOverlay />
      <AboutFocusOverlay />
      <MinimalUI />
      <ReturnHomeButton />
      <GalleryAuthNav />
      {showListFallback && <AccessibleListFallback forced={false} />}
    </>
  );
}
