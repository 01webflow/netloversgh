import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function DataCube() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.5}>
        <boxGeometry args={[1, 1, 1]} />
        <MeshDistortMaterial
          color="#7c3aed"
          attach="material"
          distort={0.2}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      
      {/* Inner glowing cube */}
      <mesh scale={1.2}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.3} wireframe />
      </mesh>
    </Float>
  );
}

function NetworkNodes() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  const nodePositions = [
    [2, 1, 0],
    [-2, 0.5, 1],
    [1, -1.5, 1.5],
    [-1.5, 1, -1],
    [0, -1, -2],
    [2.5, -0.5, -1],
  ] as const;

  return (
    <group ref={groupRef}>
      {nodePositions.map((pos, i) => (
        <Float key={i} speed={1.5 + i * 0.2} floatIntensity={0.5}>
          <mesh position={pos as unknown as THREE.Vector3}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#ef4444' : '#3b82f6'}
              emissive={i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#ef4444' : '#3b82f6'}
              emissiveIntensity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function SimCard() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      <group ref={groupRef}>
        {/* SIM card base */}
        <mesh>
          <boxGeometry args={[1.2, 1.6, 0.08]} />
          <meshStandardMaterial color="#1e1b4b" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Gold chip */}
        <mesh position={[0, 0.2, 0.05]}>
          <boxGeometry args={[0.5, 0.6, 0.02]} />
          <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} />
        </mesh>
        
        {/* Chip lines */}
        {[-0.15, 0, 0.15].map((x, i) => (
          <mesh key={i} position={[x, 0.2, 0.07]}>
            <boxGeometry args={[0.08, 0.5, 0.01]} />
            <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        
        {/* Network logo area */}
        <mesh position={[0, -0.5, 0.05]}>
          <circleGeometry args={[0.2, 32]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.3} />
        </mesh>
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#a78bfa" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={1} color="#ffffff" />
      
      <SimCard />
      <DataCube />
      <NetworkNodes />
      
      <Sparkles
        count={50}
        scale={6}
        size={2}
        speed={0.4}
        color="#a78bfa"
      />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0, 6], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
}
