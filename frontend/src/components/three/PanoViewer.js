import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useTexture } from "@react-three/drei";

function PanoSphere({ url }) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[50, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

export default function PanoViewer({ url }) {
  return (
    <div className="relative aspect-[16/9] bg-[#171A1C] overflow-hidden" data-testid="pano-viewer">
      <Canvas camera={{ position: [0, 0, 0.1], fov: 75 }} dpr={[1, 1.5]}>
        <Suspense
          fallback={
            <Html center>
              <span className="text-[#E9E4DA]/70 text-xs tracking-[0.25em] uppercase">Loading panorama</span>
            </Html>
          }
        >
          <PanoSphere url={url} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={-0.35} enableDamping dampingFactor={0.08} />
      </Canvas>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[0.6rem] tracking-[0.3em] uppercase text-[#E9E4DA]/60 bg-[#171A1C]/60 backdrop-blur px-4 py-2 pointer-events-none">
        Drag to explore 360°
      </p>
    </div>
  );
}
