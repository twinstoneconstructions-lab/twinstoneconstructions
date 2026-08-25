import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Maximize2, RotateCcw } from "lucide-react";

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function ModelViewer({ url }) {
  const controlsRef = useRef();
  const wrapRef = useRef();

  return (
    <div ref={wrapRef} className="relative aspect-[16/10] bg-[#171A1C] overflow-hidden" data-testid="model-viewer">
      <Canvas camera={{ position: [5.5, 3.6, 7.5], fov: 42 }} dpr={[1, 1.75]}>
        <ambientLight intensity={1.1} />
        <directionalLight position={[5, 8, 4]} intensity={1.6} color="#f4ead9" />
        <directionalLight position={[-5, 3, -4]} intensity={0.7} color="#8ea0ab" />
        <Suspense
          fallback={
            <Html center>
              <span className="text-[#E9E4DA]/70 text-xs tracking-[0.25em] uppercase">Loading 3D model</span>
            </Html>
          }
        >
          <Model url={url} />
        </Suspense>
        <OrbitControls ref={controlsRef} target={[0, 1.6, 0]} enableDamping makeDefault />
      </Canvas>
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => controlsRef.current?.reset()}
          data-testid="model-reset-button"
          aria-label="Reset camera"
          className="p-2.5 bg-[#F7F5F0]/10 backdrop-blur border border-[#E9E4DA]/20 text-[#E9E4DA] hover:bg-[#B77A45] hover:border-[#B77A45] transition-colors"
        >
          <RotateCcw size={15} />
        </button>
        <button
          onClick={() => wrapRef.current?.requestFullscreen?.()}
          data-testid="model-fullscreen-button"
          aria-label="Enter fullscreen"
          className="p-2.5 bg-[#F7F5F0]/10 backdrop-blur border border-[#E9E4DA]/20 text-[#E9E4DA] hover:bg-[#B77A45] hover:border-[#B77A45] transition-colors"
        >
          <Maximize2 size={15} />
        </button>
      </div>
    </div>
  );
}
