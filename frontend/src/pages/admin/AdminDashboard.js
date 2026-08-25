import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, FileText, FolderKanban, Images, Inbox, LogOut, ScrollText, Settings } from "lucide-react";
import SEO from "@/components/SEO";
import { api } from "@/lib/api";
import ProjectsTab from "./tabs/ProjectsTab";
import MediaTab from "./tabs/MediaTab";
import BrochuresTab from "./tabs/BrochuresTab";
import InquiriesTab from "./tabs/InquiriesTab";
import SettingsTab from "./tabs/SettingsTab";
import AuditTab from "./tabs/AuditTab";

const TABS = [
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "media", label: "Media Library", icon: Images },
  { id: "brochures", label: "Brochures", icon: BookOpen },
  { id: "inquiries", label: "Inquiries", icon: Inbox },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "audit", label: "Audit Log", icon: ScrollText },
];

export default function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("projects");
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("ts_admin_token")) {
      navigate("/admin");
      return;
    }
    api
      .get("/auth/me")
      .then(({ data }) => setAdmin(data))
      .catch(() => {
        localStorage.removeItem("ts_admin_token");
        navigate("/admin");
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      /* token may already be invalid */
    }
    localStorage.removeItem("ts_admin_token");
    navigate("/admin");
  }

  if (checking || !admin) {
    return (
      <div className="min-h-screen bg-[#171A1C] flex items-center justify-center">
        <span className="text-[0.65rem] tracking-[0.4em] uppercase text-[#E9E4DA]/50 animate-pulse">Verifying session</span>
      </div>
    );
  }

  const ActiveTab = { projects: ProjectsTab, media: MediaTab, brochures: BrochuresTab, inquiries: InquiriesTab, settings: SettingsTab, audit: AuditTab }[tab];

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex" data-testid="admin-dashboard">
      <SEO title="Admin Dashboard — TwinStone Constructions" noindex path="/admin/dashboard" />
      <aside className="w-60 shrink-0 bg-[#171A1C] text-[#E9E4DA] flex flex-col min-h-screen sticky top-0">
        <div className="p-6 border-b border-[#E9E4DA]/10">
          <p className="font-display font-extrabold tracking-[0.18em] text-sm text-[#F7F5F0]">TWINSTONE</p>
          <p className="text-[0.55rem] tracking-[0.35em] text-[#E9E4DA]/40 mt-1">ADMIN CONSOLE</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1" aria-label="Admin">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              data-testid={`admin-tab-${id}`}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-[0.12em] uppercase transition-colors text-left ${
                tab === id ? "bg-[#B77A45] text-[#171A1C]" : "text-[#E9E4DA]/60 hover:text-[#F7F5F0] hover:bg-[#252A2D]"
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-[#E9E4DA]/10">
          <p className="text-[0.6rem] text-[#E9E4DA]/40 px-2 mb-1 truncate">{admin.email}</p>
          <p className="text-[0.6rem] px-2 mb-3 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${admin.mfa_enabled ? "bg-[#2F6B4F]" : "bg-[#B63D3D]"}`} />
            <span className="text-[#E9E4DA]/50" data-testid="mfa-status-label">MFA {admin.mfa_enabled ? "enabled" : "not enabled"}</span>
          </p>
          <button
            onClick={logout}
            data-testid="admin-logout"
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-[#E9E4DA]/60 hover:text-[#B63D3D] transition-colors"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 lg:p-12 min-w-0">
        <ActiveTab admin={admin} />
      </main>
    </div>
  );
}
