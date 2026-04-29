'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SmokeSentryModel } from './SmokeSentryModel';

export function HeroScene() {
  return (
    <div className="w-full h-full bg-transparent">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.5}
        />
        
        <ambientLight intensity={1.5} />
        <directionalLight position={[5, 5, 5]} intensity={2} />
        <pointLight position={[0, 3, 0]} color="#E8FF47" intensity={1.5} />
        <pointLight position={[0, -2, 0]} color="#4DFFB8" intensity={0.8} />
        
        <SmokeSentryModel />
      </Canvas>
    </div>
  );
}
