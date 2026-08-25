import { Suspense, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Float, Sparkles } from "@react-three/drei";

function Monolith({ position, size, tone = "#2B3134", vein = true, rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={tone} roughness={0.34} metalness={0.62} />
      </mesh>
      {vein && (
        <mesh position={[size[0] / 2 + 0.012, 0, 0]}>
          <boxGeometry args={[0.05, size[1] * 0.86, size[2] * 0.98]} />
          <meshStandardMaterial
            color="#B77A45"
            metalness={1}
            roughness={0.24}
            emissive="#3a2410"
            emissiveIntensity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}

function Rig({ children }) {
  const ref = useRef();
  useFrame((state, delta) => {
    const group = ref.current;
    if (!group) return;
    group.rotation.y += delta * 0.08;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, state.pointer.y * 0.12, 0.04);
    group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, -state.pointer.x * 0.06, 0.04);
  });
  return <group ref={ref}>{children}</group>;
}

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [5.2, 2.4, 7.4], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      data-testid="hero-3d-canvas"
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 8, 4]} intensity={2.2} color="#f4ead9" />
      <directionalLight position={[-6, 3, -4]} intensity={0.8} color="#8ea0ab" />
      <spotLight position={[0, 9, 2]} angle={0.5} penumbra={0.8} intensity={1.4} color="#B77A45" />
      <Suspense fallback={null}>
        <Rig>
          <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.55}>
            <Monolith position={[-1.15, 0.6, 0]} size={[1.5, 4.6, 1.5]} tone="#24292C" rotationY={0.12} />
            <Monolith position={[1.05, 0.1, 0.4]} size={[1.5, 3.6, 1.5]} tone="#2E3438" rotationY={-0.18} />
            <Monolith position={[0.1, -0.35, -1.2]} size={[1.1, 2.7, 1.1]} tone="#1E2225" vein={false} rotationY={0.4} />
          </Float>
        </Rig>
        <Sparkles count={70} scale={[10, 6, 6]} size={1.6} speed={0.25} color="#B77A45" opacity={0.4} />
        <ContactShadows position={[0, -2.15, 0]} opacity={0.55} scale={16} blur={2.6} far={6} color="#000000" />
      </Suspense>
    </Canvas>
  );
}
