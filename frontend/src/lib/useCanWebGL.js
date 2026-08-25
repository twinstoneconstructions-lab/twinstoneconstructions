import { useEffect, useState } from "react";

export default function useCanWebGL() {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const wide = window.innerWidth >= 1024;
    let gl = false;
    try {
      const canvas = document.createElement("canvas");
      gl = Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      gl = false;
    }
    setSupported(!reduced && finePointer && wide && gl);
  }, []);
  return supported;
}
