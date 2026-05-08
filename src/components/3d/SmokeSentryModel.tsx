'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function SmokeSentryModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Load the GLB model
  const { scene } = useGLTF('/smokesentry-3D.glb');

  useFrame((state) => {
    if (groupRef.current) {
      // Auto-rotate on Y axis
      groupRef.current.rotation.y += 0.003;

      // Float animation (up and down)
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

      // Hover tilt effect (lerp smooth)
      if (hovered) {
        groupRef.current.rotation.x = THREE.MathUtils.lerp(
          groupRef.current.rotation.x,
          mousePos.y * 0.3,
          0.05
        );
        groupRef.current.rotation.z = THREE.MathUtils.lerp(
          groupRef.current.rotation.z,
          -mousePos.x * 0.3,
          0.05
        );
      }
    }
  });

  const handlePointerMove = (e: any) => {
    setMousePos({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    });
  };

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerMove={handlePointerMove}
      scale={3.5}
    >
      <primitive object={scene} />
    </group>
  );
}
