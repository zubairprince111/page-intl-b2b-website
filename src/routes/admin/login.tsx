import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCurrentUser, useLogin } from "@/lib/auth-client";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If already authenticated with admin role, redirect to admin console
    if (!userLoading && user && user.role === "admin") {
      navigate({ to: "/admin" });
    }
  }, [user, userLoading, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your administrator email and password.");
      return;
    }
    setError(null);

    try {
      const res = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
        honeypot,
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

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-200 flex flex-col justify-center items-center p-4 font-[Inter,system-ui,sans-serif]">
      {/* Background ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full" />
      </div>

      <div className="relative w-full max-w-[420px] z-10 space-y-6">
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

        {/* Login Card */}
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
                Staff Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pageintl.com"
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
                  className="w-full bg-[#161616] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2.5 text-[13px] text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                />
              </div>
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
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center">
            <span className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Protected by encrypted HTTP-Only session cookies & audit log
            </span>
          </div>
        </div>

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
