// Stylized-but-textured hallway shell. Wallpaper is the actual reference
// photo (tiled at a fixed real-world scale, see wallpaperTexture.ts).
import { useWallpaperTexture } from './wallpaperTexture';
import { HALL_HALF_WIDTH, HALL_HEIGHT, HALL_FRONT_Z, HALL_BACK_Z } from './hallwayLayout';

export default function Hallway() {
  // Read fresh every render (not module-level consts) since HALL_BACK_Z is
  // recomputed per-gallery by galleryLayout.ts's applyGalleryConfig().
  const HALL_LENGTH = HALL_FRONT_Z - HALL_BACK_Z;
  const HALL_CENTER_Z = (HALL_FRONT_Z + HALL_BACK_Z) / 2;
  const HALL_WIDTH = HALL_HALF_WIDTH * 2;

  // Each call's (width, height) matches that mesh's own <planeGeometry
  // args={[w,h]}> so the tile scale stays correct regardless of segment size.
  const longWallTex = useWallpaperTexture(HALL_LENGTH, HALL_HEIGHT);
  const ceilingTex = useWallpaperTexture(HALL_WIDTH, HALL_LENGTH);
  const backWallTex = useWallpaperTexture(HALL_WIDTH, HALL_HEIGHT);

  return (
    <group>
      {/* Floor — plain deep red */}
      <mesh position={[0, 0, HALL_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[HALL_WIDTH, HALL_LENGTH]} />
        <meshStandardMaterial color="#5a1f1f" roughness={0.95} metalness={0} />
      </mesh>

      {/* Ceiling — same wallpaper texture, darkened so it reads as
          plaster-with-subtle-texture rather than a second wall */}
      <mesh
        position={[0, HALL_HEIGHT, HALL_CENTER_Z]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[HALL_WIDTH, HALL_LENGTH]} />
        <meshStandardMaterial map={ceilingTex} color="#2a2018" roughness={1} />
      </mesh>

      {/* Left wall (normal points +X, into the hallway) */}
      <mesh
        position={[-HALL_HALF_WIDTH, HALL_HEIGHT / 2, HALL_CENTER_Z]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[HALL_LENGTH, HALL_HEIGHT]} />
        <meshStandardMaterial map={longWallTex} color="#c9a578" roughness={0.95} />
      </mesh>

      {/* Right wall (normal points -X, into the hallway) */}
      <mesh
        position={[HALL_HALF_WIDTH, HALL_HEIGHT / 2, HALL_CENTER_Z]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[HALL_LENGTH, HALL_HEIGHT]} />
        <meshStandardMaterial map={longWallTex} color="#c9a578" roughness={0.95} />
      </mesh>

      {/* Back wall behind the entrance */}
      <mesh position={[0, HALL_HEIGHT / 2, HALL_FRONT_Z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[HALL_WIDTH, HALL_HEIGHT]} />
        <meshStandardMaterial map={backWallTex} color="#c9a578" roughness={0.95} />
      </mesh>

      {/* Solid end wall — the "About the Artist" frame mounts on this
          (see AboutFrame.tsx) in place of the old doorway. */}
      <mesh position={[0, HALL_HEIGHT / 2, HALL_BACK_Z]}>
        <planeGeometry args={[HALL_WIDTH, HALL_HEIGHT]} />
        <meshStandardMaterial map={backWallTex} color="#a8845c" roughness={0.95} />
      </mesh>
    </group>
  );
}
