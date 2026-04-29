'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SmokeSentryModel() {
  const groupRef = useRef<THREE.Group>(null);
  const ledRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

    // LED pulse animation
    if (ledRef.current) {
      const pulse = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2;
      const material = ledRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.5 + pulse * 0.5;
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
    >
      {/* Main Body - rounded box with beveled edges */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 0.3, 2]} />
        <meshStandardMaterial
          color="#E8FF47"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Top cover plate */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.05, 32]} />
        <meshStandardMaterial
          color="#1A1A24"
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Sensor Ring - larger, more detailed */}
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.6, 0.08, 24, 48]} />
        <meshStandardMaterial
          color="#E8FF47"
          emissive="#E8FF47"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Inner sensor mesh */}
      <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshStandardMaterial
          color="#0A0A0F"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* 3 Sensor Dots - larger and more prominent */}
      <mesh position={[-0.6, 0.19, 0]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial
          color="#4DFFB8"
          emissive="#4DFFB8"
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.19, 0.6]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial
          color="#4DFFB8"
          emissive="#4DFFB8"
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0.6, 0.19, 0]}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshStandardMaterial
          color="#4DFFB8"
          emissive="#4DFFB8"
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* LED Indicators - multiple LEDs */}
      <mesh ref={ledRef} position={[0.7, 0.19, 0.7]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial
          color="#FF4D4D"
          emissive="#FF4D4D"
          emissiveIntensity={0.8}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0.7, 0.19, 0.6]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial
          color="#4DFFB8"
          emissive="#4DFFB8"
          emissiveIntensity={0.5}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* Mounting bracket */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 16]} />
        <meshStandardMaterial
          color="#1A1A24"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Edge trim/bezel */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.02, 16, 64]} />
        <meshStandardMaterial
          color="#2A2A3A"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}
