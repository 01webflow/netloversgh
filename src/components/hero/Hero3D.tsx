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
  const linesRef = useRef<THREE.Group>(null);
  
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
    [-2.5, -1, 0.5],
    [0.5, 2, -1],
  ] as const;

  // Generate connections between nodes
  const connections: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
    [0, 3], [1, 4], [2, 5], [6, 7], [7, 0], [6, 3],
  ];

  return (
    <group ref={groupRef}>
      {/* Network connection lines */}
      <group ref={linesRef}>
        {connections.map(([from, to], i) => {
          const start = new THREE.Vector3(...nodePositions[from]);
          const end = new THREE.Vector3(...nodePositions[to]);
          const mid = new THREE.Vector3().lerpVectors(start, end, 0.5);
          
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
          const points = curve.getPoints(20);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          
          return (
            <line key={i} geometry={geometry}>
              <lineBasicMaterial
                color={i % 2 === 0 ? "#7c3aed" : "#06b6d4"}
                transparent
                opacity={0.4}
              />
            </line>
          );
        })}
      </group>
      
      {/* Network nodes */}
      {nodePositions.map((pos, i) => (
        <Float key={i} speed={1.5 + i * 0.2} floatIntensity={0.5}>
          <mesh position={pos as unknown as THREE.Vector3}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#ef4444' : '#3b82f6'}
              emissive={i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#ef4444' : '#3b82f6'}
              emissiveIntensity={0.5}
            />
          </mesh>
          {/* Pulse ring around node */}
          <mesh position={pos as unknown as THREE.Vector3} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.2, 0.25, 32]} />
            <meshBasicMaterial color="#7c3aed" transparent opacity={0.3} />
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

function FloatingSimCards() {
  const group1Ref = useRef<THREE.Group>(null);
  const group2Ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group1Ref.current) {
      group1Ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      group1Ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (group2Ref.current) {
      group2Ref.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
      group2Ref.current.position.y = Math.cos(state.clock.elapsedTime * 0.5) * 0.2 - 0.5;
    }
  });

  return (
    <>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <group ref={group1Ref} position={[-2.5, 0.5, -1]}>
          <mesh>
            <boxGeometry args={[0.8, 1.1, 0.05]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.15, 0.03]}>
            <boxGeometry args={[0.35, 0.42, 0.02]} />
            <meshStandardMaterial color="#1e1b4b" metalness={1} roughness={0.2} />
          </mesh>
        </group>
      </Float>
      
      <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
        <group ref={group2Ref} position={[2.8, -0.3, -0.5]}>
          <mesh>
            <boxGeometry args={[0.7, 0.95, 0.05]} />
            <meshStandardMaterial color="#ef4444" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.12, 0.03]}>
            <boxGeometry args={[0.3, 0.38, 0.02]} />
            <meshStandardMaterial color="#1e1b4b" metalness={1} roughness={0.2} />
          </mesh>
        </group>
      </Float>
    </>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#a78bfa" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#fbbf24" />
      <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={1} color="#ffffff" />
      
      <SimCard />
      <DataCube />
      <NetworkNodes />
      <FloatingSimCards />
      
      <Sparkles
        count={80}
        scale={8}
        size={2}
        speed={0.4}
        color="#a78bfa"
      />
      
      <Sparkles
        count={40}
        scale={6}
        size={1.5}
        speed={0.6}
        color="#06b6d4"
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
