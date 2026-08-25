import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { inputCls, labelCls, UploadField } from "./common";

const DEFAULTS = {
  id: "site",
  company: { name: "TwinStone Constructions", phone: "", email: "", whatsapp: "", address: "", hours: "", socials: { instagram: "", linkedin: "", facebook: "" } },
  branding: { logo_dark: null, logo_light: null, favicon: null, og_image: "" },
  hero: { overline: "", line1: "", line2: "", subtitle: "", mode: "3d", video_path: null },
  seo: { default_title: "", default_description: "", og_image: "" },
  footer: { description: "" },
};

function ChangePasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (next !== confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/change-password", { current_password: current, new_password: next });
      toast.success("Password updated. Use the new password at your next sign-in.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      toast.error(apiError(err, "Could not change password."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="bg-white border border-[#202427]/10 p-6 lg:p-8" data-testid="change-password-card">
      <h2 className="font-display font-bold text-[#202427] mb-2">Change Password</h2>
      <p className="text-sm text-[#667078] mb-5">Minimum 12 characters. Rotation is rate-limited and recorded in the audit log.</p>
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>Current password</label>
          <input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" className={inputCls} data-testid="change-password-current" />
        </div>
        <div>
          <label className={labelCls}>New password</label>
          <input type="password" required minLength={12} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" className={inputCls} data-testid="change-password-new" />
        </div>
        <div>
          <label className={labelCls}>Confirm new password</label>
          <input type="password" required minLength={12} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" className={inputCls} data-testid="change-password-confirm" />
        </div>
        <div className="sm:col-span-3">
          <button type="submit" disabled={busy} data-testid="change-password-submit" className="bg-[#171A1C] text-[#F7F5F0] px-6 py-3 text-[0.65rem] font-semibold tracking-[0.18em] uppercase hover:bg-[#B77A45] hover:text-[#171A1C] transition-colors disabled:opacity-60">
            {busy ? "Updating…" : "Update Password"}
          </button>
        </div>
      </form>
    </section>
  );
}

function MfaCard({ admin }) {
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [enabled, setEnabled] = useState(admin?.mfa_enabled);

  async function startSetup() {
    try {
      const { data } = await api.post("/auth/mfa/setup");
      setSetup(data);
    } catch (e) {
      toast.error(apiError(e));
    }
  }

  async function enable() {
    try {
      await api.post("/auth/mfa/enable", { code });
      toast.success("MFA enabled. You'll need your authenticator at next login.");
      setEnabled(true);
      setSetup(null);
      setCode("");
    } catch (e) {
      toast.error(apiError(e));
    }
  }

  return (
    <section className="bg-white border border-[#202427]/10 p-6 lg:p-8" data-testid="mfa-card">
      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck size={18} className="text-[#B77A45]" />
        <h2 className="font-display font-bold text-[#202427]">Multi-Factor Authentication</h2>
      </div>
      <p className="text-sm text-[#667078] mb-5">
        Status:{" "}
        <span className={enabled ? "text-[#2F6B4F] font-semibold" : "text-[#B63D3D] font-semibold"} data-testid="mfa-settings-status">
          {enabled ? "Enabled" : "Not enabled"}
        </span>
      </p>
      {!enabled && !setup && (
        <button onClick={startSetup} data-testid="mfa-setup-button" className="bg-[#171A1C] text-[#F7F5F0] px-5 py-3 text-[0.65rem] font-semibold tracking-[0.18em] uppercase hover:bg-[#B77A45] hover:text-[#171A1C] transition-colors">
          Set Up Authenticator
        </button>
      )}
      {setup && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[#667078]">Scan with Google Authenticator, 1Password or any TOTP app:</p>
          <img src={setup.qr_code} alt="MFA QR code" className="w-44 h-44 border border-[#202427]/10" data-testid="mfa-qr-code" />
          <p className="text-xs font-mono bg-[#F7F5F0] border border-[#202427]/10 px-3 py-2 break-all select-all">{setup.secret}</p>
          <div className="flex gap-3">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="6-digit code" maxLength={8} className={`${inputCls} max-w-[160px]`} data-testid="mfa-enable-code" />
            <button onClick={enable} data-testid="mfa-enable-button" className="bg-[#B77A45] text-[#171A1C] px-6 py-2.5 text-[0.65rem] font-bold tracking-[0.18em] uppercase hover:bg-[#171A1C] hover:text-[#F7F5F0] transition-colors">
              Enable
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default function SettingsTab({ admin }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/settings")
      .then(({ data }) => setSettings({ ...DEFAULTS, ...data, company: { ...DEFAULTS.company, ...(data.company || {}) }, branding: { ...DEFAULTS.branding, ...(data.branding || {}) }, hero: { ...DEFAULTS.hero, ...(data.hero || {}) }, seo: { ...DEFAULTS.seo, ...(data.seo || {}) }, footer: { ...DEFAULTS.footer, ...(data.footer || {}) } }))
      .catch((e) => toast.error(apiError(e)))
      .finally(() => setLoading(false));
  }, []);

  const setCompany = (key, value) => setSettings((s) => ({ ...s, company: { ...s.company, [key]: value } }));
  const setHero = (key, value) => setSettings((s) => ({ ...s, hero: { ...s.hero, [key]: value } }));
  const setSeo = (key, value) => setSettings((s) => ({ ...s, seo: { ...s.seo, [key]: value } }));
  const setBranding = (key, value) => setSettings((s) => ({ ...s, branding: { ...s.branding, [key]: value } }));

  async function save() {
    setSaving(true);
    try {
      await api.put("/admin/settings", settings);
      toast.success("Settings saved");
    } catch (e) {
      toast.error(apiError(e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-40 bg-[#E9E4DA] animate-pulse" />;

  return (
    <div data-testid="settings-tab" className="flex flex-col gap-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#202427]">Website Settings</h1>
          <p className="text-sm text-[#667078] mt-1">Company details, homepage copy, branding and SEO defaults</p>
        </div>
        <button onClick={save} disabled={saving} data-testid="settings-save-button" className="bg-[#B77A45] text-[#171A1C] px-7 py-3 text-[0.65rem] font-bold tracking-[0.18em] uppercase hover:bg-[#171A1C] hover:text-[#F7F5F0] transition-colors disabled:opacity-60">
          {saving ? "Saving…" : "Save All"}
        </button>
      </div>

      <section className="bg-white border border-[#202427]/10 p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <h2 className="sm:col-span-2 font-display font-bold text-[#202427]">Company Details</h2>
        <div><label className={labelCls}>Phone</label><input value={settings.company.phone} onChange={(e) => setCompany("phone", e.target.value)} className={inputCls} data-testid="settings-phone" /></div>
        <div><label className={labelCls}>Alternate phone</label><input value={settings.company.phone_alt || ""} onChange={(e) => setCompany("phone_alt", e.target.value)} className={inputCls} data-testid="settings-phone-alt" /></div>
        <div><label className={labelCls}>Email</label><input value={settings.company.email} onChange={(e) => setCompany("email", e.target.value)} className={inputCls} data-testid="settings-email" /></div>
        <div><label className={labelCls}>WhatsApp (with country code, e.g. 919642185000)</label><input value={settings.company.whatsapp} onChange={(e) => setCompany("whatsapp", e.target.value)} className={inputCls} data-testid="settings-whatsapp" /></div>
        <div><label className={labelCls}>Working hours</label><input value={settings.company.hours} onChange={(e) => setCompany("hours", e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Address</label><input value={settings.company.address} onChange={(e) => setCompany("address", e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Instagram URL</label><input value={settings.company.socials?.instagram || ""} onChange={(e) => setSettings((s) => ({ ...s, company: { ...s.company, socials: { ...s.company.socials, instagram: e.target.value } } }))} className={inputCls} data-testid="settings-instagram" /></div>
        <div><label className={labelCls}>LinkedIn URL</label><input value={settings.company.socials?.linkedin || ""} onChange={(e) => setSettings((s) => ({ ...s, company: { ...s.company, socials: { ...s.company.socials, linkedin: e.target.value } } }))} className={inputCls} data-testid="settings-linkedin" /></div>
        <div><label className={labelCls}>Facebook URL</label><input value={settings.company.socials?.facebook || ""} onChange={(e) => setSettings((s) => ({ ...s, company: { ...s.company, socials: { ...s.company.socials, facebook: e.target.value } } }))} className={inputCls} data-testid="settings-facebook" /></div>
      </section>

      <section className="bg-white border border-[#202427]/10 p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <h2 className="sm:col-span-2 font-display font-bold text-[#202427]">Homepage Hero</h2>
        <div>
          <label className={labelCls}>Hero mode</label>
          <select value={settings.hero.mode || "3d"} onChange={(e) => setHero("mode", e.target.value)} className={inputCls} data-testid="settings-hero-mode">
            <option value="3d">3D Monolith Scene (WebGL)</option>
            <option value="video">Cinematic Video Background</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Hero video (auto-optimized to WebM)</label>
          <UploadField
            kind="video"
            label={settings.hero.video_path ? "Replace hero video" : "Upload hero video"}
            testid="settings-hero-video-upload"
            compact
            onUploaded={(rec) => setHero("video_path", rec.webm_path || rec.storage_path)}
          />
          {settings.hero.video_path && <p className="mt-1.5 text-[0.6rem] text-[#2F6B4F]" data-testid="hero-video-status">Video attached — plays behind the headline</p>}
        </div>
        <div><label className={labelCls}>Headline line 1</label><input value={settings.hero.line1} onChange={(e) => setHero("line1", e.target.value)} className={inputCls} data-testid="settings-hero-line1" /></div>
        <div><label className={labelCls}>Headline line 2</label><input value={settings.hero.line2} onChange={(e) => setHero("line2", e.target.value)} className={inputCls} data-testid="settings-hero-line2" /></div>
        <div className="sm:col-span-2"><label className={labelCls}>Subtitle</label><textarea rows={2} value={settings.hero.subtitle} onChange={(e) => setHero("subtitle", e.target.value)} className={inputCls} /></div>
        <div className="sm:col-span-2"><label className={labelCls}>Footer description</label><textarea rows={2} value={settings.footer.description} onChange={(e) => setSettings((s) => ({ ...s, footer: { description: e.target.value } }))} className={inputCls} /></div>
      </section>

      <section className="bg-white border border-[#202427]/10 p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <h2 className="sm:col-span-2 font-display font-bold text-[#202427]">SEO Defaults</h2>
        <div className="sm:col-span-2"><label className={labelCls}>Default title</label><input value={settings.seo.default_title} onChange={(e) => setSeo("default_title", e.target.value)} className={inputCls} data-testid="settings-seo-title" /></div>
        <div className="sm:col-span-2"><label className={labelCls}>Default description</label><textarea rows={2} value={settings.seo.default_description} onChange={(e) => setSeo("default_description", e.target.value)} className={inputCls} /></div>
      </section>

      <section className="bg-white border border-[#202427]/10 p-6 lg:p-8">
        <h2 className="font-display font-bold text-[#202427] mb-5">Branding</h2>
        <div className="flex flex-wrap gap-6">
          {[["logo_dark", "Logo (on light)"], ["logo_light", "Logo (on dark)"], ["favicon", "Favicon"]].map(([key, label]) => (
            <div key={key}>
              <p className={labelCls}>{label}</p>
              <UploadField kind="image" label={settings.branding[key] ? "Replace" : "Upload"} testid={`branding-upload-${key}`} compact onUploaded={(rec) => setBranding(key, rec.storage_path)} />
              {settings.branding[key] && <p className="mt-1.5 text-[0.6rem] text-[#2F6B4F]">Uploaded</p>}
            </div>
          ))}
        </div>
      </section>

      <MfaCard admin={admin} />
      <ChangePasswordCard />
    </div>
  );
}
