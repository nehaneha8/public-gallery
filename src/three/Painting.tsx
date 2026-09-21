import { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Artwork } from '../data/artworks';
import { getViewingPose } from '../data/artworks';
import { getNearestWaypointBehind } from '../data/waypoints';
import { useSceneStore } from '../store/useSceneStore';

const FRAME_MARGIN = 0.06;
const FRAME_DEPTH = 0.045;
// Frame sits proud of the wall rather than flush/flat against it (kept
// subtle per feedback — the first pass stuck out too far).
const FRAME_FRONT_Z = 0.03;
const FRAME_BACK_Z = FRAME_FRONT_Z - FRAME_DEPTH;
const HIT_MARGIN = 0.12;

const isHoverCapable =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: hover) and (pointer: fine)').matches === true;

export default function Painting({ artwork }: { artwork: Artwork }) {
  const texture = useTexture(artwork.src);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const glowTex = useTexture('/textures/glow.webp');

  const [hovered, setHovered] = useState(false);
  const frameMat = useRef<THREE.MeshStandardMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const glowT = useRef(0);

  useFrame((state, delta) => {
    const idlePulse = 0.35 + Math.sin(state.clock.elapsedTime * 1.2 + artwork.position[2]) * 0.18;
    const target = idlePulse + (hovered ? 0.6 : 0);
    glowT.current += (target - glowT.current) * Math.min(1, delta * 8);
    // Keep the frame itself dark — the pulsing glow lives in the halo
    // plane behind it, not as a tint on the frame's own surface.
    if (frameMat.current) frameMat.current.emissiveIntensity = 0.02 + glowT.current * 0.05;
    if (haloMat.current) haloMat.current.opacity = glowT.current * 0.45;
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const mode = useSceneStore.getState().cameraMode;
    if (mode !== 'IDLE') return;
    useSceneStore
      .getState()
      .viewArtwork(artwork.id, getViewingPose(artwork), getNearestWaypointBehind(artwork.position));
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
    <group position={artwork.position} rotation={[0, artwork.rotationY, 0]}>
      {/* Soft pulsing halo on the wall behind the frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry
          args={[artwork.width + FRAME_MARGIN * 2 + 0.4, artwork.height + FRAME_MARGIN * 2 + 0.4]}
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

      {/* Frame — a real box with depth, proud of the wall */}
      <mesh position={[0, 0, (FRAME_FRONT_Z + FRAME_BACK_Z) / 2]}>
        <boxGeometry
          args={[
            artwork.width + FRAME_MARGIN * 2,
            artwork.height + FRAME_MARGIN * 2,
            FRAME_DEPTH,
          ]}
        />
        <meshStandardMaterial
          ref={frameMat}
          color="#150e09"
          emissive="#ffb066"
          emissiveIntensity={0.12}
          roughness={0.7}
        />
      </mesh>
      {/* Canvas, mounted on the frame's raised front face */}
      <mesh position={[0, 0, FRAME_FRONT_Z + 0.002]}>
        <planeGeometry args={[artwork.width, artwork.height]} />
        <meshStandardMaterial map={texture} roughness={0.95} metalness={0} />
      </mesh>
      {/* Oversized invisible hit target, easier to click/tap */}
      <mesh
        position={[0, 0, FRAME_FRONT_Z + 0.02]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <planeGeometry args={[artwork.width + HIT_MARGIN * 2, artwork.height + HIT_MARGIN * 2]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
