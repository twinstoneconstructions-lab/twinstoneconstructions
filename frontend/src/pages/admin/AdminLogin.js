import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import SEO from "@/components/SEO";
import { api, apiError } from "@/lib/api";

const inputCls =
  "w-full bg-[#252A2D] border border-[#E9E4DA]/15 px-4 py-3.5 text-sm text-[#F7F5F0] placeholder:text-[#E9E4DA]/35 focus:border-[#B77A45] focus:outline-none transition-colors";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaToken, setMfaToken] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submitCredentials(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.mfa_required) {
        setMfaToken(data.mfa_token);
      } else {
        localStorage.setItem("ts_admin_token", data.access_token);
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(apiError(err, "Sign in failed."));
    } finally {
      setLoading(false);
    }
  }

  async function submitMfa(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/mfa/verify", { mfa_token: mfaToken, code });
      localStorage.setItem("ts_admin_token", data.access_token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(apiError(err, "Verification failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#171A1C] flex items-center justify-center px-6 relative overflow-hidden">
      <SEO title="Administrator — TwinStone Constructions" noindex path="/admin" />
      <div className="absolute inset-0 blueprint-grid opacity-40" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <span className="relative flex h-10 w-10 overflow-hidden bg-[#252A2D]" aria-hidden="true">
            <span className="absolute left-1.5 top-1.5 bottom-1.5 w-2.5 bg-[#E9E4DA]" />
            <span className="absolute right-1.5 top-3.5 bottom-1.5 w-2.5 bg-[#B77A45]" />
          </span>
          <span className="font-display font-extrabold tracking-[0.18em] text-[#F7F5F0]">TWINSTONE</span>
        </div>

        <div className="bg-[#1E2225] border border-[#E9E4DA]/10 p-8 sm:p-10" data-testid="admin-login-card">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck size={18} className="text-[#B77A45]" />
            <h1 className="font-display text-xl font-bold text-[#F7F5F0] tracking-tight">Administrator Login</h1>
          </div>
          <p className="text-xs text-[#E9E4DA]/45 mb-8">Protected by rate limiting, lockout and multi-factor authentication.</p>

          {error && (
            <p className="mb-6 text-sm text-[#e8a0a0] bg-[#B63D3D]/15 border border-[#B63D3D]/40 px-4 py-3" data-testid="login-error">
              {error}
            </p>
          )}

          {!mfaToken ? (
            <form onSubmit={submitCredentials} className="flex flex-col gap-4" data-testid="admin-login-form">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                aria-label="Admin email"
                autoComplete="username"
                data-testid="admin-email-input"
                className={inputCls}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                aria-label="Password"
                autoComplete="current-password"
                data-testid="admin-password-input"
                className={inputCls}
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="admin-login-submit"
                className="mt-2 bg-[#B77A45] text-[#171A1C] py-3.5 text-[0.7rem] font-bold tracking-[0.25em] uppercase transition-colors hover:bg-[#F7F5F0] disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitMfa} className="flex flex-col gap-4" data-testid="admin-mfa-form">
              <p className="text-sm text-[#E9E4DA]/70">Enter the 6-digit code from your authenticator app.</p>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                aria-label="Authentication code"
                data-testid="mfa-code-input"
                className={`${inputCls} text-center text-2xl tracking-[0.5em] font-mono`}
              />
              <button
                type="submit"
                disabled={loading}
                data-testid="mfa-verify-submit"
                className="mt-2 bg-[#B77A45] text-[#171A1C] py-3.5 text-[0.7rem] font-bold tracking-[0.25em] uppercase transition-colors hover:bg-[#F7F5F0] disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify & Sign In"}
              </button>
              <button
                type="button"
                onClick={() => { setMfaToken(null); setCode(""); setError(""); }}
                className="text-xs text-[#E9E4DA]/50 hover:text-[#B77A45] transition-colors"
              >
                Back to credentials
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-[0.6rem] tracking-[0.3em] uppercase text-[#E9E4DA]/25">
          Authorised personnel only · All attempts are logged
        </p>
      </div>
    </div>
  );
}
