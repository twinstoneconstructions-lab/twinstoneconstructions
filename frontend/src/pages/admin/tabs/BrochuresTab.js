import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Pencil, Plus, Trash2, X } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { inputCls, labelCls, Thumb, UploadField } from "./common";

const EMPTY = { title: "", description: "", category: "Company", file_path: null, file_name: "", file_size: 0, thumbnail: {}, published: true };

function BrochureEditor({ brochure, onClose, onSaved }) {
  const [form, setForm] = useState(brochure ? { ...EMPTY, ...brochure } : EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (brochure?.id) {
        await api.put(`/admin/brochures/${brochure.id}`, form);
        toast.success("Brochure updated");
      } else {
        await api.post("/admin/brochures", form);
        toast.success("Brochure created");
      }
      onSaved();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-[#171A1C]/80 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto" data-testid="brochure-editor">
      <form onSubmit={save} className="bg-[#F7F5F0] w-full max-w-2xl p-8 lg:p-10 my-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-xl font-bold tracking-tight text-[#202427]">{brochure ? "Edit Brochure" : "New Brochure"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 hover:text-[#B77A45]"><X size={20} /></button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2"><label className={labelCls}>Title *</label><input required minLength={2} value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} data-testid="brochure-title-input" /></div>
          <div><label className={labelCls}>Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls} data-testid="brochure-category-select">
              {["Company", "Project", "Specification", "Report"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 text-sm text-[#202427]">
              <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="accent-[#B77A45] w-4 h-4" data-testid="brochure-published-toggle" /> Visible on Download page
            </label>
          </div>
          <div className="sm:col-span-2"><label className={labelCls}>Description</label><textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls} /></div>
          <div>
            <label className={labelCls}>PDF File</label>
            <UploadField
              kind="pdf"
              label={form.file_path ? "Replace PDF" : "Upload PDF"}
              testid="brochure-pdf-upload"
              onUploaded={(rec) => setForm((f) => ({ ...f, file_path: rec.storage_path, file_name: rec.original_filename, file_size: rec.size }))}
            />
            {form.file_name && <p className="mt-2 text-xs text-[#2F6B4F]" data-testid="brochure-file-name">{form.file_name}</p>}
          </div>
          <div>
            <label className={labelCls}>Cover Thumbnail</label>
            <UploadField
              kind="image"
              label={form.thumbnail?.storage_path ? "Replace cover" : "Upload cover"}
              testid="brochure-thumb-upload"
              onUploaded={(rec) => setForm((f) => ({ ...f, thumbnail: { storage_path: rec.storage_path } }))}
            />
            {(form.thumbnail?.storage_path || form.thumbnail?.external_url) && (
              <div className="mt-2"><Thumb item={{ kind: "image", ...form.thumbnail }} className="w-24 h-16" /></div>
            )}
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-[#667078]">Cancel</button>
          <button type="submit" disabled={saving} data-testid="brochure-save-button" className="bg-[#B77A45] text-[#171A1C] px-8 py-3 text-[0.65rem] font-bold tracking-[0.18em] uppercase hover:bg-[#171A1C] hover:text-[#F7F5F0] transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Brochure"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BrochuresTab() {
  const [brochures, setBrochures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/admin/brochures").then(({ data }) => setBrochures(data)).catch((e) => toast.error(apiError(e))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function remove(b) {
    if (!window.confirm(`Delete brochure "${b.title}"?`)) return;
    try {
      await api.delete(`/admin/brochures/${b.id}`);
      toast.success("Brochure deleted");
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  }

  return (
    <div data-testid="brochures-tab">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#202427]">Brochures</h1>
          <p className="text-sm text-[#667078] mt-1">{brochures.length} documents · PDF downloads for visitors</p>
        </div>
        <button onClick={() => { setEditing(null); setEditorOpen(true); }} data-testid="new-brochure-button" className="inline-flex items-center gap-2 bg-[#171A1C] text-[#F7F5F0] px-5 py-3 text-[0.65rem] font-semibold tracking-[0.18em] uppercase hover:bg-[#B77A45] hover:text-[#171A1C] transition-colors">
          <Plus size={14} /> New Brochure
        </button>
      </div>

      {loading ? (
        <div className="h-40 bg-[#E9E4DA] animate-pulse" />
      ) : (
        <div className="flex flex-col gap-3" data-testid="brochures-list">
          {brochures.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-4 bg-white border border-[#202427]/10 p-4" data-testid={`brochure-row-${b.id}`}>
              {b.thumbnail?.storage_path || b.thumbnail?.external_url ? (
                <Thumb item={{ kind: "image", ...b.thumbnail }} />
              ) : (
                <span className="w-16 h-12 bg-[#252A2D] flex items-center justify-center"><BookOpen size={16} className="text-[#E9E4DA]/40" /></span>
              )}
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-[#202427]">{b.title}</p>
                <p className="text-xs text-[#667078] mt-0.5">{b.category} · {b.file_name || "no file"} {b.file_size ? `· ${(b.file_size / 1024).toFixed(0)}KB` : ""}</p>
              </div>
              <span className={`text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 ${b.published ? "bg-[#171A1C] text-[#F7F5F0]" : "bg-[#202427]/10 text-[#667078]"}`}>
                {b.published ? "Live" : "Hidden"}
              </span>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(b); setEditorOpen(true); }} data-testid={`edit-brochure-${b.id}`} aria-label="Edit brochure" className="p-2 text-[#667078] hover:text-[#B77A45]"><Pencil size={15} /></button>
                <button onClick={() => remove(b)} data-testid={`delete-brochure-${b.id}`} aria-label="Delete brochure" className="p-2 text-[#667078] hover:text-[#B63D3D]"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          {!brochures.length && <p className="p-8 text-sm text-[#667078] italic">No brochures yet.</p>}
        </div>
      )}

      {editorOpen && (
        <BrochureEditor brochure={editing} onClose={() => setEditorOpen(false)} onSaved={() => { setEditorOpen(false); load(); }} />
      )}
    </div>
  );
}
