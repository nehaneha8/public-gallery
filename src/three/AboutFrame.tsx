import { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { about, ABOUT_POSITION, getAboutViewingPose } from '../data/about';
import { getNearestWaypointId } from '../data/waypoints';
import { useSceneStore } from '../store/useSceneStore';
import { containSize } from './imageFit';

const FRAME_WIDTH = 0.7;
const FRAME_HEIGHT = 0.9;
const FRAME_MARGIN = 0.06;
const FRAME_DEPTH = 0.045;
const FRAME_FRONT_Z = 0.03;
const HIT_MARGIN = 0.12;

const isHoverCapable =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: hover) and (pointer: fine)').matches === true;

function FramedPhoto({ src }: { src: string }) {
  const texture = useTexture(src);
  texture.colorSpace = THREE.SRGBColorSpace;
  const { width, height } = containSize(texture.image.width, texture.image.height, FRAME_WIDTH, FRAME_HEIGHT);
  return (
    <>
      {/* Matte backing fills the full frame opening; the photo — sized to
          its own aspect ratio, not stretched to the frame's — sits on top. */}
      <mesh position={[0, 0, FRAME_FRONT_Z + 0.001]}>
        <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
        <meshStandardMaterial color="#e8dcc0" roughness={1} />
      </mesh>
      <mesh position={[0, 0, FRAME_FRONT_Z + 0.003]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
      </mesh>
    </>
  );
}

function FramedPlaque() {
  return (
    <mesh position={[0, 0, FRAME_FRONT_Z + 0.002]}>
      <planeGeometry args={[FRAME_WIDTH, FRAME_HEIGHT]} />
      <meshStandardMaterial color="#e8dcc0" roughness={1} />
    </mesh>
  );
}

// A wall plaque at the end of the hallway, in place of the old door — click
// it to open the About the Artist overlay. Only rendered when the artist
// opted in (see AboutFocusOverlay.tsx / galleryLayout.ts).
export default function AboutFrame() {
  const glowTex = useTexture('/textures/glow.webp');
  const [hovered, setHovered] = useState(false);
  const frameMat = useRef<THREE.MeshStandardMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const glowT = useRef(0);

  useFrame((state, delta) => {
    const idlePulse = 0.35 + Math.sin(state.clock.elapsedTime * 1.2) * 0.18;
    const target = idlePulse + (hovered ? 0.6 : 0);
    glowT.current += (target - glowT.current) * Math.min(1, delta * 8);
    if (frameMat.current) frameMat.current.emissiveIntensity = 0.02 + glowT.current * 0.05;
    if (haloMat.current) haloMat.current.opacity = glowT.current * 0.45;
  });

  if (!about) return null;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const state = useSceneStore.getState();
    if (state.cameraMode !== 'IDLE') return;
    state.viewAbout(getAboutViewingPose(), getNearestWaypointId(ABOUT_POSITION));
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isHoverCapable) return;
    if (useSceneStore.getState().cameraMode !== 'IDLE') return;
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group position={ABOUT_POSITION}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry
          args={[FRAME_WIDTH + FRAME_MARGIN * 2 + 0.4, FRAME_HEIGHT + FRAME_MARGIN * 2 + 0.4]}
        />
        <meshBasicMaterial
          ref={haloMat}
          map={glowTex}
          color="#ffb066"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0, FRAME_FRONT_Z - FRAME_DEPTH / 2]}>
        <boxGeometry args={[FRAME_WIDTH + FRAME_MARGIN * 2, FRAME_HEIGHT + FRAME_MARGIN * 2, FRAME_DEPTH]} />
        <meshStandardMaterial
          ref={frameMat}
          color="#150e09"
          emissive="#ffb066"
          emissiveIntensity={0.12}
          roughness={0.7}
        />
      </mesh>

      {about.photoSrc ? <FramedPhoto src={about.photoSrc} /> : <FramedPlaque />}

      <mesh
        position={[0, 0, FRAME_FRONT_Z + 0.02]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[FRAME_WIDTH + HIT_MARGIN * 2, FRAME_HEIGHT + HIT_MARGIN * 2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
