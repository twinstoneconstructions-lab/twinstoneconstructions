import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { inputCls, labelCls, Thumb, UploadField, KIND_LABELS } from "./common";

const EMPTY = {
  name: "", slug: "", category: "Residential", status: "ongoing", published: false, featured: false,
  order: 0, location: "", year: "", area: "", client: "", scope: "", description: "", progress: 0,
  media: [], cover_index: 0, specs: [], seo: { title: "", description: "", og_image: "" }, brochure_path: null,
  comparisons: [],
};

function MediaPicker({ onPick, onClose, kindFilter = null }) {
  const [library, setLibrary] = useState([]);
  useEffect(() => {
    api.get("/admin/media").then(({ data }) => setLibrary(data)).catch(() => {});
  }, []);
  const visible = kindFilter ? library.filter((m) => m.kind === kindFilter) : library;
  const uploadKinds = kindFilter ? [kindFilter] : ["image", "video", "pano", "model", "pdf", "floorplan"];
  return (
    <div className="fixed inset-0 z-[80] bg-[#171A1C]/80 backdrop-blur-sm flex items-center justify-center p-6" data-testid="media-picker">
      <div className="bg-[#F7F5F0] w-full max-w-3xl max-h-[80vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-lg text-[#202427]">Add Media</h3>
          <button onClick={onClose} data-testid="media-picker-close" aria-label="Close" className="p-1 hover:text-[#B77A45]"><X size={20} /></button>
        </div>
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-[#202427]/10">
          {uploadKinds.map((kind) => (
            <UploadField
              key={kind}
              kind={kind === "floorplan" ? "image" : kind}
              label={KIND_LABELS[kind]}
              testid={`picker-upload-${kind}`}
              compact
              onUploaded={(rec) => onPick({ id: rec.id, kind, storage_path: rec.storage_path, webm_path: rec.webm_path || null, poster_path: rec.poster_path || null, external_url: null, caption: "", alt: "" })}
            />
          ))}
        </div>
        <p className={labelCls}>Or pick from library</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {visible.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick({ id: m.id, kind: m.kind, storage_path: m.storage_path, webm_path: m.webm_path || null, poster_path: m.poster_path || null, external_url: null, caption: m.caption || "", alt: m.alt || "" })}
              data-testid={`library-item-${m.id}`}
              className="group border border-[#202427]/10 hover:border-[#B77A45] transition-colors"
            >
              <Thumb item={m} className="w-full h-20" />
              <span className="block text-[0.55rem] uppercase tracking-[0.12em] text-[#667078] px-2 py-1.5 truncate">{m.original_filename}</span>
            </button>
          ))}
          {!visible.length && <p className="col-span-full text-sm text-[#667078] italic">Library empty — upload above.</p>}
        </div>
      </div>
    </div>
  );
}

function ProjectEditor({ project, onClose, onSaved }) {
  const [form, setForm] = useState(project ? { ...EMPTY, ...project } : EMPTY);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const setSeo = (key, value) => setForm((f) => ({ ...f, seo: { ...f.seo, [key]: value } }));
  const setMediaItem = (i, key, value) =>
    setForm((f) => ({ ...f, media: f.media.map((m, idx) => (idx === i ? { ...m, [key]: value } : m)) }));

  const moveMedia = (i, dir) =>
    setForm((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.media.length) return f;
      const media = [...f.media];
      [media[i], media[j]] = [media[j], media[i]];
      return { ...f, media };
    });

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (project?.id) {
        await api.put(`/admin/projects/${project.id}`, form);
        toast.success("Project updated");
      } else {
        await api.post("/admin/projects", form);
        toast.success("Project created");
      }
      onSaved();
    } catch (err) {
      toast.error(apiError(err, "Save failed."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-[#171A1C]/80 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8 overflow-y-auto" data-testid="project-editor">
      <form onSubmit={save} className="bg-[#F7F5F0] w-full max-w-4xl p-8 lg:p-10 my-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[#202427]">{project ? "Edit Project" : "New Project"}</h2>
          <button type="button" onClick={onClose} data-testid="editor-close" aria-label="Close editor" className="p-1 hover:text-[#B77A45]"><X size={22} /></button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div><label className={labelCls}>Project name *</label><input required minLength={2} value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} data-testid="project-name-input" /></div>
          <div><label className={labelCls}>Slug (auto if blank)</label><input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={inputCls} data-testid="project-slug-input" placeholder="the-meridian-residence" /></div>
          <div>
            <label className={labelCls}>Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls} data-testid="project-category-select">
              {["Residential", "Commercial", "Renovation", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls} data-testid="project-status-select">
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div><label className={labelCls}>Location</label><input value={form.location} onChange={(e) => set("location", e.target.value)} className={inputCls} data-testid="project-location-input" /></div>
          <div><label className={labelCls}>Year</label><input value={form.year} onChange={(e) => set("year", e.target.value)} className={inputCls} data-testid="project-year-input" /></div>
          <div><label className={labelCls}>Area</label><input value={form.area} onChange={(e) => set("area", e.target.value)} className={inputCls} placeholder="12,400 sq ft" /></div>
          <div><label className={labelCls}>Client (if authorized)</label><input value={form.client} onChange={(e) => set("client", e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Display order</label><input type="number" value={form.order} onChange={(e) => set("order", Number(e.target.value))} className={inputCls} data-testid="project-order-input" /></div>
          <div>
            <label className={labelCls}>Progress % (ongoing)</label>
            <input type="range" min={0} max={100} value={form.progress} onChange={(e) => set("progress", Number(e.target.value))} className="w-full accent-[#B77A45]" data-testid="project-progress-slider" />
            <span className="text-xs text-[#667078]">{form.progress}%</span>
          </div>
          <div className="sm:col-span-2"><label className={labelCls}>Scope</label><input value={form.scope} onChange={(e) => set("scope", e.target.value)} className={inputCls} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Description</label><textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} className={inputCls} data-testid="project-description-input" /></div>
        </div>

        <div className="flex flex-wrap gap-6 mt-6">
          <label className="flex items-center gap-2 text-sm text-[#202427]">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="accent-[#B77A45] w-4 h-4" data-testid="project-published-toggle" /> Published
          </label>
          <label className="flex items-center gap-2 text-sm text-[#202427]">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-[#B77A45] w-4 h-4" data-testid="project-featured-toggle" /> Featured on homepage
          </label>
        </div>

        <div className="mt-10 border-t border-[#202427]/10 pt-8">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold text-[#202427]">Media ({form.media.length})</h3>
            <button type="button" onClick={() => setPickerTarget("media")} data-testid="add-media-button" className="inline-flex items-center gap-2 bg-[#171A1C] text-[#F7F5F0] px-4 py-2.5 text-[0.65rem] font-semibold tracking-[0.18em] uppercase hover:bg-[#B77A45] hover:text-[#171A1C] transition-colors">
              <Plus size={13} /> Add Media
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {form.media.map((m, i) => (
              <div key={`${m.id}-${i}`} className="flex flex-wrap items-center gap-3 bg-white border border-[#202427]/10 p-3" data-testid={`media-row-${i}`}>
                <Thumb item={m} />
                <span className="text-[0.55rem] uppercase tracking-[0.15em] text-[#B77A45] w-14">{KIND_LABELS[m.kind] || m.kind}</span>
                <input value={m.caption} onChange={(e) => setMediaItem(i, "caption", e.target.value)} placeholder="Caption" className={`${inputCls} flex-1 min-w-[120px]`} data-testid={`media-caption-${i}`} />
                <input value={m.alt} onChange={(e) => setMediaItem(i, "alt", e.target.value)} placeholder="ALT text" className={`${inputCls} flex-1 min-w-[120px]`} data-testid={`media-alt-${i}`} />
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => set("cover_index", i)} data-testid={`media-cover-${i}`} aria-label="Set as cover"
                    className={`p-2 transition-colors ${form.cover_index === i ? "text-[#B77A45]" : "text-[#667078]/50 hover:text-[#B77A45]"}`}>
                    <Star size={15} fill={form.cover_index === i ? "#B77A45" : "none"} />
                  </button>
                  <button type="button" onClick={() => moveMedia(i, -1)} aria-label="Move up" className="p-2 text-[#667078] hover:text-[#202427]"><ArrowUp size={15} /></button>
                  <button type="button" onClick={() => moveMedia(i, 1)} aria-label="Move down" className="p-2 text-[#667078] hover:text-[#202427]"><ArrowDown size={15} /></button>
                  <button type="button" onClick={() => set("media", form.media.filter((_, idx) => idx !== i))} data-testid={`media-remove-${i}`} aria-label="Remove media" className="p-2 text-[#667078] hover:text-[#B63D3D]"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            {!form.media.length && <p className="text-sm text-[#667078] italic">No media yet — add images, video, 360° panoramas, 3D models or PDFs.</p>}
          </div>
        </div>

        <div className="mt-10 border-t border-[#202427]/10 pt-8">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-[#202427]">Before / After Comparisons ({(form.comparisons || []).length})</h3>
            <button
              type="button"
              onClick={() => set("comparisons", [...(form.comparisons || []), { before: null, after: null, caption: "" }])}
              data-testid="add-comparison-button"
              className="inline-flex items-center gap-2 bg-[#171A1C] text-[#F7F5F0] px-4 py-2.5 text-[0.65rem] font-semibold tracking-[0.18em] uppercase hover:bg-[#B77A45] hover:text-[#171A1C] transition-colors"
            >
              <Plus size={13} /> Add Comparison
            </button>
          </div>
          <p className="text-xs text-[#667078] mb-5">Each pair becomes an interactive slider on the project page — add several for room-by-room transformations.</p>
          {(form.comparisons || []).map((pair, i) => (
            <div key={i} className="bg-white border border-[#202427]/10 p-4 mb-4" data-testid={`comparison-${i}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[0.6rem] font-semibold tracking-[0.2em] uppercase text-[#B77A45]">Pair {i + 1}</span>
                <button
                  type="button"
                  onClick={() => set("comparisons", form.comparisons.filter((_, idx) => idx !== i))}
                  data-testid={`comparison-remove-${i}`}
                  aria-label={`Remove comparison ${i + 1}`}
                  className="p-1.5 text-[#667078] hover:text-[#B63D3D]"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[["before", "Before image"], ["after", "After image"]].map(([slot, label]) => {
                  const item = pair[slot];
                  return (
                    <div key={slot}>
                      <p className={labelCls}>{label}</p>
                      {item ? (
                        <div className="flex items-center gap-2">
                          <Thumb item={item} className="w-24 h-16" />
                          <button
                            type="button"
                            onClick={() => {
                              const list = [...form.comparisons];
                              list[i] = { ...list[i], [slot]: null };
                              set("comparisons", list);
                            }}
                            data-testid={`comparison-clear-${slot}-${i}`}
                            aria-label={`Remove ${label}`}
                            className="p-2 text-[#667078] hover:text-[#B63D3D]"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPickerTarget({ index: i, slot })}
                          data-testid={`comparison-pick-${slot}-${i}`}
                          className="w-full border border-dashed border-[#202427]/25 py-5 text-[0.6rem] font-semibold tracking-[0.18em] uppercase text-[#667078] hover:border-[#B77A45] hover:text-[#B77A45] transition-colors"
                        >
                          Choose Image
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <input
                value={pair.caption || ""}
                onChange={(e) => {
                  const list = [...form.comparisons];
                  list[i] = { ...list[i], caption: e.target.value };
                  set("comparisons", list);
                }}
                placeholder="Caption (e.g. Kitchen — wall removal and full refit)"
                className={`${inputCls} mt-3`}
                data-testid={`comparison-caption-${i}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[#202427]/10 pt-8">
          <h3 className="font-display font-bold text-[#202427] mb-2">Project Brochure</h3>
          <p className="text-xs text-[#667078] mb-5">Attach a PDF — the project page will automatically offer a Download Brochure button.</p>
          <div className="flex items-center gap-4">
            <UploadField
              kind="pdf"
              label={form.brochure_path ? "Replace brochure PDF" : "Upload brochure PDF"}
              testid="project-brochure-upload"
              onUploaded={(rec) => set("brochure_path", rec.storage_path)}
            />
            {form.brochure_path && (
              <>
                <span className="text-xs text-[#2F6B4F]" data-testid="project-brochure-status">Brochure attached</span>
                <button type="button" onClick={() => set("brochure_path", null)} data-testid="project-brochure-remove" className="text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-[#B63D3D]">
                  Remove
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-10 border-t border-[#202427]/10 pt-8">
          <h3 className="font-display font-bold text-[#202427] mb-5">Specifications</h3>
          <div className="flex flex-col gap-3">
            {form.specs.map((spec, i) => (
              <div key={i} className="flex gap-3">
                <input value={spec.label} onChange={(e) => set("specs", form.specs.map((s, idx) => (idx === i ? { ...s, label: e.target.value } : s)))} placeholder="Label" className={inputCls} />
                <input value={spec.value} onChange={(e) => set("specs", form.specs.map((s, idx) => (idx === i ? { ...s, value: e.target.value } : s)))} placeholder="Value" className={inputCls} />
                <button type="button" onClick={() => set("specs", form.specs.filter((_, idx) => idx !== i))} aria-label="Remove spec" className="p-2 text-[#667078] hover:text-[#B63D3D]"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => set("specs", [...form.specs, { label: "", value: "" }])} data-testid="add-spec-button" className="mt-3 inline-flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-[#B77A45]">
            <Plus size={13} /> Add Specification
          </button>
        </div>

        <div className="mt-10 border-t border-[#202427]/10 pt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <h3 className="sm:col-span-2 font-display font-bold text-[#202427]">SEO</h3>
          <div><label className={labelCls}>SEO title</label><input value={form.seo.title} onChange={(e) => setSeo("title", e.target.value)} className={inputCls} data-testid="project-seo-title" /></div>
          <div><label className={labelCls}>OG image URL</label><input value={form.seo.og_image} onChange={(e) => setSeo("og_image", e.target.value)} className={inputCls} /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Meta description</label><textarea rows={2} value={form.seo.description} onChange={(e) => setSeo("description", e.target.value)} className={inputCls} data-testid="project-seo-description" /></div>
        </div>

        <div className="mt-10 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-6 py-3 text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-[#667078] hover:text-[#202427]">Cancel</button>
          <button type="submit" disabled={saving} data-testid="project-save-button" className="bg-[#B77A45] text-[#171A1C] px-8 py-3 text-[0.65rem] font-bold tracking-[0.18em] uppercase hover:bg-[#171A1C] hover:text-[#F7F5F0] transition-colors disabled:opacity-60">
            {saving ? "Saving…" : "Save Project"}
          </button>
        </div>
      </form>
      {pickerTarget && (
        <MediaPicker
          kindFilter={pickerTarget === "media" ? null : "image"}
          onClose={() => setPickerTarget(null)}
          onPick={(item) => {
            if (pickerTarget === "media") {
              set("media", [...form.media, item]);
            } else {
              const list = [...(form.comparisons || [])];
              list[pickerTarget.index] = { ...list[pickerTarget.index], [pickerTarget.slot]: item };
              set("comparisons", list);
            }
            setPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}

export default function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api.get("/admin/projects").then(({ data }) => setProjects(data)).catch((e) => toast.error(apiError(e))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function remove(project) {
    if (!window.confirm(`Delete "${project.name}" permanently?`)) return;
    try {
      await api.delete(`/admin/projects/${project.id}`);
      toast.success("Project deleted");
      load();
    } catch (e) {
      toast.error(apiError(e));
    }
  }

  return (
    <div data-testid="projects-tab">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#202427]">Projects</h1>
          <p className="text-sm text-[#667078] mt-1">{projects.length} total · {projects.filter((p) => p.published).length} published</p>
        </div>
        <button onClick={() => { setEditing(null); setEditorOpen(true); }} data-testid="new-project-button" className="inline-flex items-center gap-2 bg-[#171A1C] text-[#F7F5F0] px-5 py-3 text-[0.65rem] font-semibold tracking-[0.18em] uppercase hover:bg-[#B77A45] hover:text-[#171A1C] transition-colors">
          <Plus size={14} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="h-40 bg-[#E9E4DA] animate-pulse" />
      ) : (
        <div className="bg-white border border-[#202427]/10 overflow-x-auto">
          <table className="w-full text-sm" data-testid="projects-table">
            <thead>
              <tr className="border-b border-[#202427]/10 text-left">
                {["", "Name", "Category", "Status", "Published", "Order", ""].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-[0.6rem] font-semibold tracking-[0.2em] uppercase text-[#667078]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-[#202427]/5 hover:bg-[#F7F5F0]" data-testid={`project-row-${p.slug}`}>
                  <td className="px-4 py-3"><Thumb item={p.media?.[p.cover_index] || p.media?.[0]} /></td>
                  <td className="px-4 py-3 font-medium text-[#202427]">{p.name}{p.featured && <Star size={12} className="inline ml-2 text-[#B77A45]" fill="#B77A45" />}</td>
                  <td className="px-4 py-3 text-[#667078]">{p.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 ${p.status === "ongoing" ? "bg-[#B77A45]/15 text-[#B77A45]" : "bg-[#2F6B4F]/10 text-[#2F6B4F]"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={async () => { await api.put(`/admin/projects/${p.id}`, { ...p, published: !p.published }); load(); }}
                      data-testid={`publish-toggle-${p.slug}`}
                      className={`text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2.5 py-1 ${p.published ? "bg-[#171A1C] text-[#F7F5F0]" : "bg-[#202427]/10 text-[#667078]"}`}
                    >
                      {p.published ? "Live" : "Draft"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[#667078]">{p.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => { setEditing(p); setEditorOpen(true); }} data-testid={`edit-project-${p.slug}`} aria-label={`Edit ${p.name}`} className="p-2 text-[#667078] hover:text-[#B77A45]"><Pencil size={15} /></button>
                      <button onClick={() => remove(p)} data-testid={`delete-project-${p.slug}`} aria-label={`Delete ${p.name}`} className="p-2 text-[#667078] hover:text-[#B63D3D]"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!projects.length && <p className="p-8 text-sm text-[#667078] italic">No projects yet. Create the first one.</p>}
        </div>
      )}

      {editorOpen && (
        <ProjectEditor
          project={editing}
          onClose={() => setEditorOpen(false)}
          onSaved={() => { setEditorOpen(false); load(); }}
        />
      )}
    </div>
  );
}
