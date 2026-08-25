import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { ChevronsLeftRight } from "lucide-react";
import { mediaSrc } from "@/lib/api";

export default function BeforeAfterSlider({ before, after, caption }) {
  const [pos, setPos] = useState(50);
  const ref = useRef(null);
  const interacted = useRef(false);
  const inView = useInView(ref, { once: true, margin: "-25% 0px" });

  useEffect(() => {
    if (!inView || interacted.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const ease = [0.16, 1, 0.3, 1];
    const controls = animate(50, 76, {
      duration: 1,
      ease,
      delay: 0.35,
      onUpdate: (v) => setPos(v),
      onComplete: () => {
        animate(76, 50, { duration: 0.8, ease, onUpdate: (v) => setPos(v) });
      },
    });
    return () => controls.stop();
  }, [inView]);

  const update = useCallback((clientX) => {
    interacted.current = true;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(96, Math.max(4, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <figure>
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label="Before and after comparison slider"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        aria-valuetext={`${Math.round(pos)}% before image visible`}
        onKeyDown={(e) => {
          interacted.current = true;
          if (e.key === "ArrowLeft") setPos((p) => Math.max(4, p - 5));
          if (e.key === "ArrowRight") setPos((p) => Math.min(96, p + 5));
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          update(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) update(e.clientX);
        }}
        className="relative aspect-[16/10] overflow-hidden select-none touch-none cursor-ew-resize bg-[#252A2D] focus-visible:ring-2 focus-visible:ring-[#B77A45]"
        data-testid="before-after-slider"
      >
        <img
          src={mediaSrc(after)}
          alt={after.alt || "After renovation"}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img
            src={mediaSrc(before)}
            alt={before.alt || "Before renovation"}
            loading="lazy"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <span className="absolute top-4 left-4 bg-[#171A1C]/85 backdrop-blur text-[#E9E4DA] text-[0.6rem] font-semibold tracking-[0.25em] uppercase px-3 py-1.5" data-testid="before-label">
          Before
        </span>
        <span className="absolute top-4 right-4 bg-[#B77A45] text-[#171A1C] text-[0.6rem] font-semibold tracking-[0.25em] uppercase px-3 py-1.5" data-testid="after-label">
          After
        </span>
        <div className="absolute top-0 bottom-0 w-px bg-[#F7F5F0]" style={{ left: `${pos}%` }} aria-hidden="true">
          <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-[#F7F5F0] text-[#171A1C] shadow-xl" data-testid="slider-handle">
            <ChevronsLeftRight size={18} />
          </span>
        </div>
      </div>
      {caption && (
        <figcaption className="mt-3 text-xs text-[#667078] italic font-editorial text-base" data-testid="before-after-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
