import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { api, apiError, fileUrl } from "@/lib/api";

export const inputCls =
  "w-full bg-white border border-[#202427]/15 px-3.5 py-2.5 text-sm text-[#202427] placeholder:text-[#667078]/60 focus:border-[#B77A45] focus:outline-none transition-colors";
export const labelCls = "block text-[0.65rem] font-semibold tracking-[0.2em] uppercase text-[#667078] mb-1.5";

export const KIND_LABELS = {
  image: "Image",
  video: "Video",
  pano: "360° Panorama",
  model: "3D Model (GLB/glTF)",
  pdf: "PDF Document",
  floorplan: "Floor Plan",
};

export function UploadField({ kind = "image", label = "Upload file", onUploaded, testid, compact = false }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post(`/admin/upload?kind=${kind}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 360000,
      });
      toast.success(`Uploaded ${file.name}`);
      if (data?.optimization_hint) {
        toast.info("Large 3D model", { description: data.optimization_hint, duration: 12000 });
      }
      onUploaded?.(data);
    } catch (err) {
      toast.error(apiError(err, "Upload failed."));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" className="hidden" onChange={handleFile} data-testid={testid ? `${testid}-file` : undefined} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        data-testid={testid}
        className={`inline-flex items-center gap-2 border border-[#202427]/20 text-[#202427] text-[0.65rem] font-semibold tracking-[0.18em] uppercase transition-colors hover:border-[#B77A45] hover:text-[#B77A45] disabled:opacity-50 ${
          compact ? "px-3 py-2" : "px-5 py-3"
        }`}
      >
        <Upload size={13} /> {busy ? (kind === "video" ? "Uploading & optimizing…" : "Uploading…") : label}
      </button>
    </div>
  );
}

export function Thumb({ item, className = "w-16 h-12" }) {
  const src = item?.external_url || (item?.storage_path ? `${fileUrl(item.storage_path)}?w=480&fmt=webp` : "");
  if (!src || !["image", "pano", "floorplan"].includes(item?.kind)) {
    return (
      <span className={`${className} bg-[#252A2D] flex items-center justify-center text-[0.5rem] tracking-[0.15em] uppercase text-[#E9E4DA]/50`}>
        {item?.kind || "file"}
      </span>
    );
  }
  return <img src={src} alt={item?.alt || ""} className={`${className} object-cover bg-[#252A2D]`} />;
}
