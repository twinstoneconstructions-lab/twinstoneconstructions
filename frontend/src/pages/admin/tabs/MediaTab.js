import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { Thumb, UploadField, KIND_LABELS } from "./common";

export default function MediaTab() {
  const [media, setMedia] = useState([]);
  const [kind, setKind] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/admin/media", { params: kind ? { kind } : {} })
      .then(({ data }) => setMedia(data))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, [kind]);

  async function remove(item) {
    if (!window.confirm(`Remove "${item.original_filename}" from the library?`)) return;
    try {
      await api.delete(`/admin/media/${item.id}`);
      toast.success("Media removed");
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  }

  return (
    <div data-testid="media-tab">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#202427]">Media Library</h1>
          <p className="text-sm text-[#667078] mt-1">{media.length} files · images, video, 360°, 3D models, PDFs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["image", "video", "pano", "model", "pdf"].map((k) => (
            <UploadField key={k} kind={k} label={KIND_LABELS[k]} testid={`media-upload-${k}`} compact onUploaded={load} />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["", "image", "video", "pano", "model", "pdf"].map((k) => (
          <button
            key={k || "all"}
            onClick={() => setKind(k)}
            data-testid={`media-filter-${k || "all"}`}
            className={`px-4 py-2 text-[0.6rem] font-semibold tracking-[0.18em] uppercase border transition-colors ${
              kind === k ? "bg-[#171A1C] text-[#F7F5F0] border-[#171A1C]" : "border-[#202427]/15 text-[#667078] hover:border-[#B77A45] hover:text-[#B77A45]"
            }`}
          >
            {k ? KIND_LABELS[k] : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-40 bg-[#E9E4DA] animate-pulse" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" data-testid="media-grid">
          {media.map((item) => (
            <figure key={item.id} className="group bg-white border border-[#202427]/10" data-testid={`media-card-${item.id}`}>
              <Thumb item={item} className="w-full h-32" />
              <figcaption className="p-3">
                <p className="text-[0.6rem] text-[#202427] truncate font-medium">{item.original_filename}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[0.55rem] uppercase tracking-[0.15em] text-[#B77A45]">{item.kind}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[0.55rem] text-[#667078]">{(item.size / 1024 / 1024).toFixed(1)}MB</span>
                    <button onClick={() => remove(item)} data-testid={`media-delete-${item.id}`} aria-label="Delete media" className="text-[#667078] hover:text-[#B63D3D]">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
          {!media.length && <p className="col-span-full py-16 text-center text-sm text-[#667078] italic">No files yet — upload using the buttons above.</p>}
        </div>
      )}
    </div>
  );
}
