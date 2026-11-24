import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useCurrentUser, useLogin, useLogout } from "@/lib/auth-client";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({
    meta: [{ title: "Admin Sign In — PAGE International" }],
  }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reasonNotice, setReasonNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const reason = params.get("reason");
      if (reason === "idle_timeout") {
        setReasonNotice(
          "Your administrative session expired due to 15 minutes of inactivity. Please re-enter your credentials to resume.",
        );
      } else if (reason === "logged_out") {
        setReasonNotice("You have been securely signed out of the administrative console.");
      } else if (reason === "expired") {
        setReasonNotice("Your administrator session has expired. Please sign in again.");
      }
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your administrator email and password.");
      return;
    }
    setError(null);
    setReasonNotice(null);

    try {
      const res = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
        honeypot,
        rememberMe,
      });

      if (res.success && res.user) {
        if (res.user.role !== "admin") {
          setError("Access restricted. This console is exclusively for authorized administrators.");
        } else {
          navigate({ to: "/admin" });
        }
      } else {
        setError(res.error || "Authentication failed. Please verify your credentials.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    }
  }

  async function handleSwitchAccount() {
    setError(null);
    setReasonNotice(null);
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // non-blocking
    }
  }

  const hasActiveAdminSession = !userLoading && user && user.role === "admin";

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-200 flex flex-col justify-center items-center p-4 font-[Inter,system-ui,sans-serif]">
      {/* Background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative w-full max-w-[440px] z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-2 shadow-lg shadow-emerald-500/10">
            <Shield className="h-6 w-6" strokeWidth={2.25} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-display">
            PAGE Admin Console
          </h1>
          <p className="text-[13px] text-zinc-500">
            Authorized administrative access for machinery catalog, RFQs & operations
          </p>
        </div>

        {/* Reason notice banner (e.g. idle timeout, logout) */}
        {reasonNotice && (
          <div className="flex items-start gap-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl p-3.5 text-[12px] animate-in fade-in duration-200 shadow-lg">
            <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div className="space-y-0.5">
              <span className="font-semibold block text-amber-200">Security Notification</span>
              <span className="text-amber-300/90 leading-relaxed block">{reasonNotice}</span>
            </div>
          </div>
        )}

        {/* Case 1: Already Authenticated as Admin -> Show Clear Choice Card (Never silently bypass login!) */}
        {hasActiveAdminSession ? (
          <div className="bg-[#1c1c1c] border border-emerald-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-white">Active Administrator Session</h3>
                <p className="text-[12px] text-zinc-400">
                  Signed in as <span className="text-emerald-400 font-medium">{user.name}</span>
                </p>
                <p className="text-[11px] font-mono text-zinc-500">{user.email}</p>
              </div>
            </div>

            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 text-[12px] text-zinc-400 leading-relaxed">
              Your administrator session is currently active. You may return to the dashboard or sign
              out to log in with a different account.
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={() => navigate({ to: "/admin" })}
                className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[13px] flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
              >
                <span>Continue to Admin Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleSwitchAccount}
                disabled={logoutMutation.isPending}
                className="w-full h-9 rounded-lg border border-white/[0.08] hover:bg-white/[0.04] text-zinc-400 hover:text-white text-[12px] font-medium flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {logoutMutation.isPending ? (
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out & Enter Different Credentials</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Case 2: Clean Administrator Login Form */
          <div className="bg-[#1c1c1c] border border-white/[0.08] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-[12px] animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Honeypot for bot filtering */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@pageintl.com"
                    autoComplete="username"
                    className="w-full bg-[#161616] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full bg-[#161616] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Session Persistence Mode Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-white/20 bg-zinc-800 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-[11px] text-zinc-400 leading-tight cursor-pointer select-none"
                >
                  <span className="text-zinc-300 font-medium block">
                    Remember session on this device (1 hour max)
                  </span>
                  <span className="text-zinc-500 text-[10px] block mt-0.5">
                    Unchecked: Session terminates immediately when the browser is closed (Recommended).
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[13px] flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/30 disabled:opacity-50 cursor-pointer"
              >
                {loginMutation.isPending ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify Credentials & Enter Console</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center space-y-1.5">
              <span className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Protected by HTTP-Only session cookies & audit log
              </span>
              <p className="text-[10px] text-zinc-600">
                Administrative sessions automatically lock after 15 minutes of inactivity.
              </p>
            </div>
          </div>
        )}

        {/* Back to public site */}
        <div className="text-center">
          <Link
            to="/"
            className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1"
          >
            ← Return to PAGE International Website
          </Link>
        </div>
      </div>
    </div>
  );
}
