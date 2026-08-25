import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { mediaSrc } from "@/lib/api";

export default function Lightbox({ items, index, onClose, onNav }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNav((index - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") onNav((index + 1) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onClose, onNav]);

  const item = items[index];
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-[#171A1C]/95 backdrop-blur-md flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      data-testid="lightbox"
    >
      <div className="flex items-center justify-between px-6 sm:px-10 h-16 shrink-0">
        <span className="text-xs tracking-[0.3em] uppercase text-[#E9E4DA]/60" data-testid="lightbox-counter">
          {index + 1} / {items.length}
        </span>
        <button onClick={onClose} data-testid="lightbox-close" aria-label="Close viewer" className="p-2 text-[#E9E4DA] hover:text-[#B77A45] transition-colors">
          <X size={22} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 sm:px-16 min-h-0">
        <img
          src={mediaSrc(item)}
          alt={item.alt || item.caption || "Project media"}
          className="max-w-full max-h-[78vh] object-contain"
          data-testid="lightbox-image"
        />
      </div>
      <div className="flex items-center justify-between px-6 sm:px-10 h-20 shrink-0">
        <button
          onClick={() => onNav((index - 1 + items.length) % items.length)}
          data-testid="lightbox-prev"
          aria-label="Previous image"
          className="p-3 border border-[#E9E4DA]/20 text-[#E9E4DA] hover:border-[#B77A45] hover:text-[#B77A45] transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <p className="text-xs text-[#E9E4DA]/60 text-center px-4">{item.caption}</p>
        <button
          onClick={() => onNav((index + 1) % items.length)}
          data-testid="lightbox-next"
          aria-label="Next image"
          className="p-3 border border-[#E9E4DA]/20 text-[#E9E4DA] hover:border-[#B77A45] hover:text-[#B77A45] transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
