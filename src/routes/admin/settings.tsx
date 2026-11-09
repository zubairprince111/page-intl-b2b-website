import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useSettings, useUpdateSettings } from "@/lib/data-client";
import {
  Settings,
  Save,
  Globe,
  Palette,
  Mail,
  Phone,
  Type,
  Megaphone,
  Check,
  RotateCcw,
  Share2,
} from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
  head: () => ({
    meta: [{ title: "Settings — PAGE Admin" }],
  }),
});

function AdminSettings() {
  const { data: dbSettings = {}, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();

  const [settings, setSettings] = useState<any>({
    siteName: "PAGE International",
    tagline: "Think Next. Build Better.",
    primaryColor: "#dc2626",
    contactEmail: "info@pageinternational.com",
    contactPhone: "+880-1700-000000",
    heroHeadline: "THINK NEXT.",
    heroSubline: "Built to Perform. Certified to Last.",
    announcementBar: "🔥 Free installation on all 2-post lifts this month!",
    announcementActive: false,
    socialLinkedin: "https://www.linkedin.com/company/page-international-ltd/",
    socialFacebook: "https://www.facebook.com/pageinternationalltd/",
    socialInstagram: "https://www.instagram.com/pageintl",
  });

  useEffect(() => {
    if (dbSettings && Object.keys(dbSettings).length > 0) {
      setSettings((prev: any) => ({ ...prev, ...dbSettings }));
    }
  }, [dbSettings]);

  const [saved, setSaved] = useState(false);

  async function handleSave() {
    await updateSettingsMutation.mutateAsync(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleReset() {
    const defaults = {
      siteName: "PAGE International",
      tagline: "Think Next. Build Better.",
      primaryColor: "#dc2626",
      contactEmail: "info@pageinternational.com",
      contactPhone: "+880-1700-000000",
      heroHeadline: "THINK NEXT.",
      heroSubline: "Built to Perform. Certified to Last.",
      announcementBar: "🔥 Free installation on all 2-post lifts this month!",
      announcementActive: false,
      socialLinkedin: "https://www.linkedin.com/company/page-international-ltd/",
      socialFacebook: "https://www.facebook.com/pageinternationalltd/",
      socialInstagram: "https://www.instagram.com/pageintl",
    };
    setSettings(defaults);
    await updateSettingsMutation.mutateAsync(defaults);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function Field({
    label,
    icon: Icon,
    children,
    hint,
  }: {
    label: string;
    icon: any;
    children: React.ReactNode;
    hint?: string;
  }) {
    return (
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
          <Icon className="h-3 w-3" />
          {label}
        </label>
        {children}
        {hint && <p className="text-[10px] text-zinc-600">{hint}</p>}
      </div>
    );
  }

  return (
    <AdminLayout activeRoute="/admin/settings">
      <div className="p-6 lg:p-8 space-y-6 max-w-[900px]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-[13px] text-zinc-500 mt-1">Manage site configuration and content</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 text-[12px] px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 text-[13px] font-medium px-4 py-2 rounded-lg transition-all ${
                saved
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {/* General */}
        <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Globe className="h-4 w-4 text-emerald-400" />
            <h3 className="text-[14px] font-semibold text-white">General</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Site Name" icon={Type}>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </Field>

            <Field label="Tagline" icon={Type}>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </Field>

            <Field label="Contact Email" icon={Mail}>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </Field>

            <Field label="Contact Phone" icon={Phone}>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </Field>

            <Field label="Brand Color" icon={Palette} hint="Used for primary buttons and accents">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="h-9 w-12 rounded-lg border border-white/[0.06] bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Hero / Content */}
        <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Type className="h-4 w-4 text-blue-400" />
            <h3 className="text-[14px] font-semibold text-white">Hero Content</h3>
          </div>

          <div className="space-y-5">
            <Field
              label="Hero Headline"
              icon={Type}
              hint="The main headline displayed on the homepage hero"
            >
              <input
                type="text"
                value={settings.heroHeadline}
                onChange={(e) => setSettings({ ...settings, heroHeadline: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </Field>

            <Field label="Hero Subline" icon={Type} hint="Secondary text below the headline">
              <input
                type="text"
                value={settings.heroSubline}
                onChange={(e) => setSettings({ ...settings, heroSubline: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </Field>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-amber-400" />
              <h3 className="text-[14px] font-semibold text-white">Announcement Bar</h3>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, announcementActive: !settings.announcementActive })
              }
              className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
                settings.announcementActive ? "bg-emerald-600" : "bg-zinc-700"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  settings.announcementActive ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <Field
            label="Announcement Text"
            icon={Megaphone}
            hint="Displayed at the top of the website when active"
          >
            <textarea
              value={settings.announcementBar}
              onChange={(e) => setSettings({ ...settings, announcementBar: e.target.value })}
              rows={2}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none"
            />
          </Field>

          {settings.announcementActive && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              <p className="text-[11px] text-amber-400 font-medium">Preview</p>
              <p className="text-[13px] text-zinc-200 mt-1">{settings.announcementBar}</p>
            </div>
          )}
        </div>

        {/* Social Media Channels */}
        <div className="bg-[#232323] border border-white/[0.06] rounded-xl p-5 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Share2 className="h-4 w-4 text-pink-400" />
            <h3 className="text-[14px] font-semibold text-white">Social Media Channels</h3>
          </div>

          <div className="space-y-4">
            <Field
              label="LinkedIn Company Page"
              icon={Share2}
              hint="Public profile URL for PAGE International on LinkedIn"
            >
              <input
                type="url"
                value={settings.socialLinkedin || ""}
                onChange={(e) => setSettings({ ...settings, socialLinkedin: e.target.value })}
                placeholder="https://www.linkedin.com/company/page-international-ltd/"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono"
              />
            </Field>

            <Field
              label="Facebook Page"
              icon={Share2}
              hint="Official Facebook page for customer updates & community"
            >
              <input
                type="url"
                value={settings.socialFacebook || ""}
                onChange={(e) => setSettings({ ...settings, socialFacebook: e.target.value })}
                placeholder="https://www.facebook.com/pageinternationalltd/"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono"
              />
            </Field>

            <Field
              label="Instagram Profile"
              icon={Share2}
              hint="Instagram handle for machinery demos and gallery"
            >
              <input
                type="url"
                value={settings.socialInstagram || ""}
                onChange={(e) => setSettings({ ...settings, socialInstagram: e.target.value })}
                placeholder="https://www.instagram.com/pageintl"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 font-mono"
              />
            </Field>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#232323] border border-red-500/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <h3 className="text-[14px] font-semibold text-red-400">Danger Zone</h3>
          </div>
          <p className="text-[12px] text-zinc-500">
            These actions are irreversible. Reset all settings to default values and clear stored
            data.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (
                  confirm("Reset ALL admin data (users, quotes, bookings)? This cannot be undone.")
                ) {
                  localStorage.removeItem("admin_users");
                  localStorage.removeItem("admin_inventory");
                  localStorage.removeItem("admin_quotes");
                  localStorage.removeItem("admin_bookings");
                  localStorage.removeItem("admin_settings");
                  window.location.reload();
                }
              }}
              className="text-[12px] text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500/10 transition-colors font-medium"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
