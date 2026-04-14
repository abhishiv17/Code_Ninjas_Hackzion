'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Generate random points for the background star/dust field
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 1000;
  
  // Use useMemo to safely generate positions once
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;
  }

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= delta / 15;
      pointsRef.current.rotation.x -= delta / 25;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#38bdf8" size={0.03} sizeAttenuation={true} depthWrite={false} />
    </Points>
  );
}

// Glowing warped sphere effect
function AnimatedSphere({ isDark }: { isDark: boolean }) {
  const sphereRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x += delta * 0.2;
      sphereRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1.5, 64, 64]} position={[0, 0, -2]}>
      <MeshDistortMaterial
        color={isDark ? "#1e40af" : "#93c5fd"}
        attach="material"
        distort={0.4}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
        wireframe={true}
      />
    </Sphere>
  );
}

export default function Login3DBackground({ isDark }: { isDark: boolean }) {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={isDark ? 0.3 : 0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#38bdf8" />
        <ParticleField />
        <AnimatedSphere isDark={isDark} />
      </Canvas>
    </div>
  );
}
