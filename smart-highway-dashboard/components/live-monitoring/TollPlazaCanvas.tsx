'use client';

import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import {
  getCameraCountPerLane,
  getLaneCount,
  getRfidNodesPerLane,
} from '@/lib/liveMonitoringData';

type TollPlazaSceneProps = { tollId: number };

function TollPlazaScene({ tollId }: TollPlazaSceneProps) {
  const lanes = useMemo(() => getLaneCount(tollId), [tollId]);
  const camsPerLane = useMemo(() => getCameraCountPerLane(tollId), [tollId]);
  const rfidPerLane = useMemo(() => getRfidNodesPerLane(tollId), [tollId]);

  const laneSpacing = 1.35;
  const laneWidth = 1.05;
  const laneLength = 7.5;
  const startZ = (-((lanes - 1) * laneSpacing) / 2) as number;

  const laneCenters = useMemo(
    () => Array.from({ length: lanes }, (_, i) => startZ + i * laneSpacing),
    [lanes, startZ],
  );

  return (
    <group position={[0, -0.35, 0]}>
      {/* Plaza deck */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[laneLength + 3.2, 0.25, lanes * laneSpacing + 2.4]} />
        <meshStandardMaterial color="#0f172a" metalness={0.15} roughness={0.85} />
      </mesh>

      {/* Lane strips + markings */}
      {laneCenters.map((z, idx) => (
        <group key={`lane-${idx}`}>
          <mesh position={[0, 0.14, z]} receiveShadow>
            <boxGeometry args={[laneLength, 0.08, laneWidth]} />
            <meshStandardMaterial
              color={idx % 2 === 0 ? '#1e3a5f' : '#172554'}
              metalness={0.08}
              roughness={0.9}
            />
          </mesh>
          {Array.from({ length: 5 }).map((_, m) => (
            <mesh key={`dash-${m}`} position={[-laneLength / 2 + 1.2 + m * 1.35, 0.2, z]}>
              <boxGeometry args={[0.35, 0.02, 0.12]} />
              <meshStandardMaterial color="#64748b" emissive="#475569" emissiveIntensity={0.25} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Toll booth / canopy */}
      <group position={[-laneLength / 2 - 1.1, 0.5, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 1.35, lanes * laneSpacing + 1.2]} />
          <meshStandardMaterial color="#334155" metalness={0.35} roughness={0.45} />
        </mesh>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[1.45, 0.2, lanes * laneSpacing + 1.5]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.35} />
        </mesh>
      </group>

      {/* Cameras on poles */}
      {laneCenters.map((z, li) =>
        Array.from({ length: camsPerLane }).map((_, ci) => {
          const x = -1.2 + (ci / Math.max(1, camsPerLane - 1)) * (laneLength - 2.2);
          return (
            <group key={`cam-${li}-${ci}`} position={[x, 0.25, z + (ci % 2 === 0 ? 0.42 : -0.42)]}>
              <mesh castShadow position={[0, 0.65, 0]}>
                <cylinderGeometry args={[0.06, 0.08, 1.2, 8]} />
                <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.35} />
              </mesh>
              <mesh castShadow position={[0, 1.35, 0.15]} rotation={[0.35, 0, 0]}>
                <boxGeometry args={[0.28, 0.2, 0.22]} />
                <meshStandardMaterial
                  color="#0ea5e9"
                  emissive="#0284c7"
                  emissiveIntensity={0.45}
                  metalness={0.4}
                  roughness={0.3}
                />
              </mesh>
            </group>
          );
        }),
      )}

      {/* RFID sensor nodes */}
      {laneCenters.map((z, li) =>
        Array.from({ length: rfidPerLane }).map((_, ri) => {
          const t = (ri + 1) / (rfidPerLane + 1);
          const x = -laneLength / 2 + 1 + t * (laneLength - 2);
          return (
            <mesh key={`rfid-${li}-${ri}`} position={[x, 0.22, z]} castShadow>
              <octahedronGeometry args={[0.18, 0]} />
              <meshStandardMaterial
                color="#22c55e"
                emissive="#16a34a"
                emissiveIntensity={0.55}
                metalness={0.25}
                roughness={0.4}
              />
            </mesh>
          );
        }),
      )}

      {/* Connector “mind map” edges (flat tubes as lines) */}
      {laneCenters.slice(0, -1).map((z, i) => (
        <mesh
          key={`link-${i}`}
          position={[laneLength / 4, 0.32, (z + laneCenters[i + 1]) / 2]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[0.04, 0.04, laneSpacing - 0.2, 8]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#4f46e5"
            emissiveIntensity={0.35}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function TollPlazaCanvas({ tollId }: { tollId: number }) {
  return (
    <div className="h-[min(52vh,420px)] w-full min-h-[280px] overflow-hidden rounded-xl border border-slate-700/80 bg-gradient-to-b from-slate-950 to-[#050816] shadow-inner shadow-black/40">
      <Canvas
        orthographic
        shadows
        camera={{ position: [16, 14, 16], zoom: 28, near: 0.1, far: 500 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.45} />
        <directionalLight
          castShadow
          position={[12, 22, 10]}
          intensity={1.15}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-8, 6, -4]} intensity={0.35} color="#38bdf8" />
        <group rotation={[0, Math.PI / 4.2, 0]}>
          <TollPlazaScene tollId={tollId} />
        </group>
      </Canvas>
    </div>
  );
}
