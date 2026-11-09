import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Building2,
  Phone,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { useCurrentUser, useLogin, useRegister, useRequestPasswordReset } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      {
        title: "Workshop Account Sign In — PAGE International",
      },
      {
        name: "description",
        content: "Sign in or register your automotive workshop account on PAGE International.",
      },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const resetMutation = useRequestPasswordReset();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Login Form State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginHoneypot, setLoginHoneypot] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regCompany, setRegCompany] = useState("");
  const [regBusinessType, setRegBusinessType] = useState("Workshop / Garage");
  const [regCity, setRegCity] = useState("Dhaka");
  const [regPassword, setRegPassword] = useState("");
  const [regHoneypot, setRegHoneypot] = useState("");
  const [regError, setRegError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && user) {
      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/account" });
      }
    }
  }, [user, userLoading, navigate]);

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);

    try {
      const res = await loginMutation.mutateAsync({
        email: loginEmail.trim(),
        password: loginPassword,
        honeypot: loginHoneypot,
      });

      if (res.success && res.user) {
        if (res.user.role === "admin") {
          navigate({ to: "/admin" });
        } else {
          navigate({ to: "/account" });
        }
      } else {
        setLoginError(res.error || "Invalid email or password.");
      }
    } catch (err: any) {
      setLoginError(err?.message || "Failed to sign in. Please try again.");
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setRegError(null);

    if (regPassword.length < 10) {
      setRegError("Password must be at least 10 characters long.");
      return;
    }

    try {
      const res = await registerMutation.mutateAsync({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        companyName: regCompany.trim(),
        businessType: regBusinessType,
        city: regCity,
        password: regPassword,
        honeypot: regHoneypot,
      });

      if (res.success && res.user) {
        navigate({ to: "/account" });
      } else {
        setRegError(res.error || "Registration failed. Please review your details.");
      }
    } catch (err: any) {
      setRegError(err?.message || "Registration failed. Please try again.");
    }
  }

  async function handleResetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    try {
      const res = await resetMutation.mutateAsync({ email: resetEmail.trim() });
      setResetMessage(res.message);
    } catch (err: any) {
      setResetMessage(err?.message || "Password reset request initiated.");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-16 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-red-600/10 text-red-600 mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black font-display uppercase tracking-tight text-zinc-900">
            PAGE Workshop Portal
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Access your B2B machinery quotations, bookings & official orders
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-zinc-200/80 p-1 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "login"
                ? "bg-white text-zinc-950 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "register"
                ? "bg-white text-zinc-950 shadow-xs"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Register Workshop
          </button>
        </div>

        {/* Card */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Honeypot field */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="bot_field"
                  tabIndex={-1}
                  value={loginHoneypot}
                  onChange={(e) => setLoginHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="engineer@autofixbd.com"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalOpen(true);
                      setResetEmail(loginEmail);
                    }}
                    className="text-[11px] text-red-600 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {loginMutation.isPending ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {regError && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Honeypot field */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="bot_field_reg"
                  tabIndex={-1}
                  value={regHoneypot}
                  onChange={(e) => setRegHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  Workshop / Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="AutoFix Multi-Brand Workshop"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                    Contact Person *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Engr. Tanvir Ahmed"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+880 1711-000000"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                    Business Type
                  </label>
                  <select
                    value={regBusinessType}
                    onChange={(e) => setRegBusinessType(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
                  >
                    <option value="Workshop / Garage">Workshop / Garage</option>
                    <option value="Tyre Service Center">Tyre Service Center</option>
                    <option value="Fleet Operator">Fleet Operator</option>
                    <option value="OEM Dealership">OEM Dealership</option>
                    <option value="EV Service Bay">EV Service Bay</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                    City / Division
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                      type="text"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      placeholder="Dhaka (Tejgaon)"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="tanvir@autofixbd.com"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 block mb-1">
                  Password (Min. 10 chars, letters & numbers) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 cursor-pointer mt-2"
              >
                {registerMutation.isPending ? (
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create B2B Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Admin Link */}
        <div className="text-center mt-5">
          <Link
            to="/admin/login"
            className="text-[11px] text-zinc-500 hover:text-zinc-800 transition-colors inline-flex items-center gap-1 font-mono uppercase"
          >
            <KeyRound className="h-3 w-3" />
            Administrative Staff Sign In →
          </Link>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="font-display font-black text-lg uppercase text-zinc-900">
              Reset Your Password
            </h3>
            <p className="text-xs text-zinc-500">
              Enter your account email. We will generate and queue a single-use secure reset link.
            </p>

            {resetMessage ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs">
                {resetMessage}
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@workshop.com"
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalOpen(false);
                      setResetMessage(null);
                    }}
                    className="flex-1 py-2 text-xs font-bold uppercase rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetMutation.isPending}
                    className="flex-1 py-2 text-xs font-bold uppercase rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}

            {resetMessage && (
              <button
                type="button"
                onClick={() => {
                  setResetModalOpen(false);
                  setResetMessage(null);
                }}
                className="w-full py-2 text-xs font-bold uppercase rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
