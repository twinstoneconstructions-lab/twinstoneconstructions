import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";

export default function AuditTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/audit").then(({ data }) => setLogs(data)).catch((e) => toast.error(apiError(e))).finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="audit-tab">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-[#202427]">Audit Log</h1>
        <p className="text-sm text-[#667078] mt-1">Protected history of critical administrative and security events</p>
      </div>
      {loading ? (
        <div className="h-40 bg-[#E9E4DA] animate-pulse" />
      ) : (
        <div className="bg-white border border-[#202427]/10 overflow-x-auto">
          <table className="w-full text-sm" data-testid="audit-table">
            <thead>
              <tr className="border-b border-[#202427]/10 text-left">
                {["When", "Actor", "Action", "Object", "Result", "IP"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[0.6rem] font-semibold tracking-[0.2em] uppercase text-[#667078]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-[#202427]/5">
                  <td className="px-4 py-3 text-xs text-[#667078] whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-[#202427]">{log.actor}</td>
                  <td className="px-4 py-3 text-xs font-medium text-[#202427]">{log.action}</td>
                  <td className="px-4 py-3 text-xs text-[#667078] max-w-[200px] truncate">{log.object}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[0.6rem] font-semibold tracking-[0.15em] uppercase px-2 py-1 ${log.result === "success" ? "bg-[#2F6B4F]/10 text-[#2F6B4F]" : "bg-[#B63D3D]/10 text-[#B63D3D]"}`}>
                      {log.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#667078]">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!logs.length && <p className="p-8 text-sm text-[#667078] italic">No events recorded yet.</p>}
        </div>
      )}
    </div>
  );
}
