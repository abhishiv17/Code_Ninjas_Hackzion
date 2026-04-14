import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/context/ThemeContext';

interface TollLocation {
  id: number;
  x: number;
  z: number;
  name: string;
  status: 'online' | 'warning' | 'offline';
  openTickets: number;
}

function TollNode({
  toll,
  isSelected,
  onSelect,
  isDark
}: {
  toll: TollLocation;
  isSelected: boolean;
  onSelect: (id: number) => void;
  isDark: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      if (isSelected || hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const baseColor =
    toll.status === 'online'
      ? '#10b981'
      : toll.status === 'warning'
      ? '#f59e0b'
      : '#ef4444';

  return (
    <group position={[toll.x, 0, toll.z]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(toll.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHover(false);
        }}
        position={[0, 0.5, 0]}
      >
        <cylinderGeometry args={[0.3, 0.3, 1, 16]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isSelected || hovered ? 2 : (isDark ? 0.5 : 0.2)}
        />
        {(isSelected || hovered) && (
          <Html position={[0, 1, 0]} center zIndexRange={[100, 0]}>
            <div className="flex min-w-[120px] flex-col items-center rounded-lg border border-slate-200 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 p-2 text-center text-xs text-slate-800 dark:text-white shadow-xl backdrop-blur-md">
              <span className="font-bold">{toll.name}</span>
              <span
                className={`mt-1 rounded px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${
                  toll.status === 'online'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : toll.status === 'warning'
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    : 'bg-red-500/20 text-red-600 dark:text-red-400'
                }`}
              >
                {toll.status}
              </span>
              {toll.openTickets > 0 && (
                <span className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <strong className="text-red-500 dark:text-red-400">{toll.openTickets}</strong> pending tickets
                </span>
              )}
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

function GridNetwork({ tolls }: { tolls: TollLocation[] }) {
  // Create some simple random connections
  const lines = useMemo(() => {
    const list = [];
    for (let i = 0; i < tolls.length; i++) {
      for (let j = i + 1; j < tolls.length; j++) {
        const dist = Math.hypot(tolls[i].x - tolls[j].x, tolls[i].z - tolls[j].z);
        if (dist < 4) {
          list.push([
            new THREE.Vector3(tolls[i].x, 0, tolls[i].z),
            new THREE.Vector3(tolls[j].x, 0, tolls[j].z),
          ]);
        }
      }
    }
    return list;
  }, [tolls]);

  return (
    <group>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#38bdf8" lineWidth={1} opacity={0.2} transparent />
      ))}
    </group>
  );
}

export default function KarnatakaMap({
  selectedTollId,
  onTollSelect,
}: {
  selectedTollId: number;
  onTollSelect: (id: number) => void;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const tolls: TollLocation[] = useMemo(() => {
    const list: TollLocation[] = [];
    for (let i = 1; i <= 20; i++) {
      // Create interesting grid layout 3D coordinates based on index
      const xOffset = (Math.sin(i * 12.9898) * 0.5 + 0.5) * 16 - 8;
      const zOffset = (Math.cos(i * 78.233) * 0.5 + 0.5) * 10 - 5;

      let status: 'online' | 'warning' | 'offline' = 'online';
      if (i % 7 === 0) status = 'warning';
      if (i % 13 === 0) status = 'offline';

      list.push({
        id: i,
        x: xOffset,
        z: zOffset,
        name: `Toll Plaza ${i}`,
        status,
        openTickets: (i * 3) % 8,
      });
    }
    return list;
  }, []);

  return (
    <div className="relative isolate z-0 h-[400px] w-full overflow-hidden rounded-xl shadow-inner cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 8, 10], fov: 45 }}>
        <color attach="background" args={[isDark ? '#0f172a' : '#f8fafc']} />
        <ambientLight intensity={isDark ? 0.5 : 0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#38bdf8" />
        <GridNetwork tolls={tolls} />
        {tolls.map((toll) => (
          <TollNode
            key={toll.id}
            toll={toll}
            isSelected={toll.id === selectedTollId}
            onSelect={onTollSelect}
            isDark={isDark}
          />
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color={isDark ? "#020617" : "#e2e8f0"} opacity={0.8} transparent />
        </mesh>
        <gridHelper args={[40, 40, isDark ? '#1e293b' : '#cbd5e1', isDark ? '#0f172a' : '#f1f5f9']} position={[0, 0, 0]} />
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={5}
          maxDistance={25}
        />
      </Canvas>

      <div className="pointer-events-none absolute right-4 top-4 z-[40] rounded border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 shadow-lg backdrop-blur">
        <div className="mb-1 font-bold">Node Status</div>
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
          <span>Online</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
          <span>Warning</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
          <span>Offline</span>
        </div>
      </div>
    </div>
  );
}
