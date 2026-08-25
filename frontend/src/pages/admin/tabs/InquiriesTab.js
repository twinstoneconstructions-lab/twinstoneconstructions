import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";

const STATUSES = ["new", "contacted", "in-review", "closed"];

export default function InquiriesTab() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get("/admin/inquiries").then(({ data }) => setInquiries(data)).catch((e) => toast.error(apiError(e))).finally(() => setLoading(false));
  };
  useEffect(load, []);

  async function setStatus(id, status) {
    try {
      await api.patch(`/admin/inquiries/${id}`, { status });
      setInquiries((list) => list.map((i) => (i.id === id ? { ...i, status } : i)));
      toast.success("Status updated");
    } catch (e) {
      toast.error(apiError(e));
    }
  }

  return (
    <div data-testid="inquiries-tab">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#202427]">Inquiries</h1>
        <p className="text-sm text-[#667078] mt-1">{inquiries.length} consultation requests from the contact form</p>
      </div>
      {loading ? (
        <div className="h-40 bg-[#E9E4DA] animate-pulse" />
      ) : inquiries.length ? (
        <div className="flex flex-col gap-3" data-testid="inquiries-list">
          {inquiries.map((inq) => (
            <div key={inq.id} className="bg-white border border-[#202427]/10 p-5" data-testid={`inquiry-${inq.id}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-[#202427]">{inq.name} <span className="text-[#667078] font-normal">· {inq.email}</span></p>
                  <p className="text-xs text-[#667078] mt-1">
                    {[inq.phone, inq.project_type, inq.location, inq.budget].filter(Boolean).join(" · ") || "No extra details"}
                  </p>
                </div>
                <select
                  value={inq.status}
                  onChange={(e) => setStatus(inq.id, e.target.value)}
                  data-testid={`inquiry-status-${inq.id}`}
                  className="text-xs border border-[#202427]/15 px-3 py-2 bg-white focus:border-[#B77A45] focus:outline-none"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <p className="mt-3 text-sm text-[#667078] leading-relaxed border-t border-[#202427]/5 pt-3">{inq.message}</p>
              <p className="mt-2 text-[0.6rem] text-[#667078]/60 uppercase tracking-[0.15em]">{new Date(inq.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-8 bg-white border border-[#202427]/10 text-sm text-[#667078] italic" data-testid="inquiries-empty">
          No inquiries yet. Submissions from the contact form appear here.
        </p>
      )}
    </div>
  );
}
