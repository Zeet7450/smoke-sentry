'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, AdaptiveDpr } from '@react-three/drei';
import { SmokeSentryModel } from './SmokeSentryModel';

export default function ProductScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      frameloop="demand"
    >
      <AdaptiveDpr pixelated />
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 3, 3]} color="#E8FF47" intensity={1.5} />
      <pointLight position={[-3, -2, 2]} color="#4DFFB8" intensity={0.8} />

      <Float
        speed={1.5}
        rotationIntensity={0.3}
        floatIntensity={0.5}
      >
        <SmokeSentryModel />
      </Float>

      {/* User bisa drag untuk rotate */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </Canvas>
  );
}
