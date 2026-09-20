import Lantern from './Lantern';
import Candle from './Candle';
import { HALL_HALF_WIDTH, HALL_HEIGHT, HALL_FRONT_Z, HALL_BACK_Z } from './hallwayLayout';

function Plant({ position }: { position: [number, number, number] }) {
  const leafColors = ['#3c5a34', '#4d6e3f', '#33492c'];
  return (
    <group position={position}>
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.22, 14]} />
        <meshStandardMaterial color="#5a4632" roughness={0.9} />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = 0.06 + (i % 2) * 0.03;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, 0.3 + (i % 3) * 0.06, Math.sin(a) * r]}
            rotation={[a * 0.3, a, 0.3]}
          >
            <sphereGeometry args={[0.11, 8, 8]} />
            <meshStandardMaterial color={leafColors[i % leafColors.length]} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// Trailing ivy draped from a wall-mounted point — several drooping strands
// of small leaf blobs, thinning out toward the bottom.
function HangingVine({
  position,
  rotationY = 0,
  length = 0.9,
}: {
  position: [number, number, number];
  rotationY?: number;
  length?: number;
}) {
  const strands = 3;
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {Array.from({ length: strands }).map((_, s) => {
        const xOff = (s - (strands - 1) / 2) * 0.09;
        const strandLen = length * (0.75 + 0.25 * Math.sin(s * 2.1));
        const leafCount = Math.round(strandLen * 9);
        return (
          <group key={s} position={[xOff, 0, 0]}>
            {Array.from({ length: leafCount }).map((_, i) => {
              const t = i / leafCount;
              const sway = Math.sin(t * 5 + s) * 0.03 * t;
              return (
                <mesh key={i} position={[sway, -t * strandLen, 0.02 + t * 0.03]}>
                  <sphereGeometry args={[0.028 * (1 - t * 0.4), 6, 6]} />
                  <meshStandardMaterial color={i % 2 === 0 ? '#3c5a34' : '#4d6e3f'} roughness={1} />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}

function ConsoleVignette() {
  // Small entrance nook echoing references/hallway/hlway1.jpg — console,
  // mirror, candles, trailing ivy — reimagined simply rather than copied.
  return (
    <group position={[1.1, 0, 1.3]}>
      <mesh position={[0, 0.375, 0]}>
        <boxGeometry args={[0.55, 0.75, 0.32]} />
        <meshStandardMaterial color="#3a2b20" roughness={0.75} />
      </mesh>
      <Candle position={[-0.12, 0.75, 0.05]} height={0.14} />
      <Candle position={[0.12, 0.75, -0.03]} height={0.1} />
      {/* Mirror on the wall above */}
      <group position={[0.19, 1.55, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <circleGeometry args={[0.32, 28]} />
          <meshStandardMaterial color="#241a10" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.27, 28]} />
          <meshStandardMaterial color="#9fb0b8" roughness={0.2} metalness={0.5} />
        </mesh>
      </group>
      <HangingVine position={[-0.28, 1.9, 0.15]} rotationY={Math.PI * 0.15} length={0.7} />
    </group>
  );
}

// A smaller side table for a candle, tucked along the wall.
function SideTable({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.56, 8]} />
        <meshStandardMaterial color="#2c2016" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.57, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 20]} />
        <meshStandardMaterial color="#4a3626" roughness={0.6} />
      </mesh>
      <Candle position={[0, 0.585, 0]} height={0.13} />
    </group>
  );
}

function PendantLight({ z }: { z: number }) {
  return (
    <group position={[0, HALL_HEIGHT, z]}>
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4, 8]} />
        <meshStandardMaterial color="#1c140d" />
      </mesh>
      <mesh position={[0, -0.44, 0]}>
        <coneGeometry args={[0.16, 0.16, 16, 1, true]} />
        <meshStandardMaterial color="#3a2a1c" roughness={0.6} side={2} />
      </mesh>
      <pointLight position={[0, -0.46, 0]} color="#ffcf9a" intensity={2.4} distance={3} decay={2} />
    </group>
  );
}

// Repeating decor spaced along the hallway (rather than hand-placed) so it
// scales to whatever length galleryLayout.ts computes for a given gallery,
// instead of assuming the original fixed ~21m hallway.
const LANTERN_SPACING = 5;
const TABLE_SPACING = 6;
const PENDANT_SPACING = 7.6;
const VINE_SPACING = 5.5;

function evenlySpaced(usableStart: number, usableEnd: number, spacing: number, minCount: number): number[] {
  const span = usableStart - usableEnd;
  const count = Math.max(minCount, Math.round(span / spacing) + 1);
  if (count === 1) return [(usableStart + usableEnd) / 2];
  const step = span / (count - 1);
  return Array.from({ length: count }, (_, i) => usableStart - i * step);
}

export default function HallwayDecor() {
  // Read fresh every render — HALL_BACK_Z is recomputed per-gallery.
  const centerZ = (HALL_FRONT_Z + HALL_BACK_Z) / 2;
  const totalLength = HALL_FRONT_Z - HALL_BACK_Z;
  // Stay clear of the entrance nook and the end wall.
  const usableStart = HALL_FRONT_Z - 3;
  const usableEnd = HALL_BACK_Z + 1.5;

  const lanternZs = evenlySpaced(usableStart, usableEnd, LANTERN_SPACING, 2);
  const tableZs = evenlySpaced(usableStart - 1, usableEnd + 1, TABLE_SPACING, 1);
  const pendantZs = evenlySpaced(usableStart - 1.5, usableEnd + 1.5, PENDANT_SPACING, 1);
  const vineZs = evenlySpaced(usableStart - 2, usableEnd + 2, VINE_SPACING, 1);
  const plantZs = evenlySpaced(usableStart, usableEnd, LANTERN_SPACING * 0.85, 2);

  return (
    <group>
      {/* Baseboard trim */}
      <mesh position={[-HALL_HALF_WIDTH + 0.02, 0.05, centerZ]}>
        <boxGeometry args={[0.04, 0.1, totalLength]} />
        <meshStandardMaterial color="#231810" roughness={0.8} />
      </mesh>
      <mesh position={[HALL_HALF_WIDTH - 0.02, 0.05, centerZ]}>
        <boxGeometry args={[0.04, 0.1, totalLength]} />
        <meshStandardMaterial color="#231810" roughness={0.8} />
      </mesh>
      {/* Crown molding */}
      <mesh position={[-HALL_HALF_WIDTH + 0.03, HALL_HEIGHT - 0.06, centerZ]}>
        <boxGeometry args={[0.06, 0.09, totalLength]} />
        <meshStandardMaterial color="#1c1410" roughness={0.9} />
      </mesh>
      <mesh position={[HALL_HALF_WIDTH - 0.03, HALL_HEIGHT - 0.06, centerZ]}>
        <boxGeometry args={[0.06, 0.09, totalLength]} />
        <meshStandardMaterial color="#1c1410" roughness={0.9} />
      </mesh>

      {/* Wall sconces — real flickering light sources, alternating sides */}
      {lanternZs.map((z, i) => (
        <Lantern
          key={z}
          position={[i % 2 === 0 ? HALL_HALF_WIDTH : -HALL_HALF_WIDTH, 2.15, z]}
          rotationY={i % 2 === 0 ? -Math.PI / 2 : Math.PI / 2}
        />
      ))}

      <ConsoleVignette />
      {tableZs.map((z, i) => (
        <SideTable
          key={z}
          position={[i % 2 === 0 ? -1.13 : 1.13, 0, z]}
          rotationY={i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2}
        />
      ))}
      {pendantZs.map((z) => (
        <PendantLight key={z} z={z} />
      ))}

      {vineZs.map((z, i) => (
        <HangingVine
          key={z}
          position={[i % 2 === 0 ? -HALL_HALF_WIDTH + 0.02 : HALL_HALF_WIDTH - 0.02, 2.55, z]}
          rotationY={i % 2 === 0 ? Math.PI / 2 : -Math.PI / 2}
          length={0.75}
        />
      ))}

      {plantZs.map((z, i) => (
        <Plant key={z} position={[i % 2 === 0 ? -1.15 : 1.15, 0, z]} />
      ))}
    </group>
  );
}
