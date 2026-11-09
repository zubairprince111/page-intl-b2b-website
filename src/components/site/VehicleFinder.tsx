import { useNavigate } from "@tanstack/react-router";
import { Car, Bike, Zap, CheckCircle2, RotateCcw, Search, Truck } from "lucide-react";
import { useState } from "react";
import { vehiclePlatformData, years, type MobilityType } from "@/lib/data";
import { useCart } from "@/lib/cart";

const MOBILITY_OPTIONS: { id: MobilityType; label: string; icon: any }[] = [
  { id: "4-Wheeler", label: "4-Wheeler (Cars/SUVs/LCVs)", icon: Car },
  { id: "2-Wheeler", label: "2-Wheeler (Bikes/Scooters)", icon: Bike },
  { id: "3-Wheeler", label: "3-Wheeler (CNG/Cargo)", icon: Truck },
  { id: "EV", label: "EV (Electric Mobility)", icon: Zap },
];

export function VehicleFinder({ dark = false }: { dark?: boolean }) {
  const { vehicle, setVehicle } = useCart();
  const [platform, setPlatform] = useState<MobilityType>(
    (vehicle?.platform as MobilityType) || "4-Wheeler",
  );
  const [make, setMake] = useState(vehicle?.make ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [year, setYear] = useState(vehicle?.year ?? "");
  const [engine, setEngine] = useState(vehicle?.engine ?? "");
  const navigate = useNavigate();

  const currentPlatformMakes = vehiclePlatformData[platform] ?? {};
  const makes = Object.keys(currentPlatformMakes);
  const models = make ? Object.keys(currentPlatformMakes[make] ?? {}) : [];
  const engines = make && model ? (currentPlatformMakes[make]?.[model] ?? []) : [];
  const ready = make && model;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setVehicle({ platform, make, model, year, engine });
    navigate({
      to: "/shop",
      search: {
        mobility: platform,
        vehicle: `${make} ${model}`,
      },
    });
  };

  const handleReset = () => {
    setMake("");
    setModel("");
    setYear("");
    setEngine("");
  };

  const handlePlatformChange = (p: MobilityType) => {
    setPlatform(p);
    setMake("");
    setModel("");
    setYear("");
    setEngine("");
  };

  const fClass = dark ? "field-dark" : "field";

  return (
    <div
      className={`rounded-[var(--radius)] border ${
        dark
          ? "border-ink-border bg-ink-2/95 text-ink-foreground shadow-2xl"
          : "border-border bg-card text-foreground shadow-sm"
      } p-4 sm:p-6`}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold block">
            Step 1 · Vehicle Compatibility Finder
          </span>
          <h3 className="font-heading text-xl tracking-wide uppercase">
            Find Products & Parts For Your Vehicle Platform
          </h3>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded">
          <CheckCircle2 className="h-4 w-4" /> B2B Fitment Verified
        </span>
      </div>

      {/* Platform Switcher Buttons */}
      <div className="mb-5">
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Select Vehicle Category:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MOBILITY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = platform === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handlePlatformChange(opt.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded text-xs font-bold uppercase tracking-wider border transition-all text-left ${
                  active
                    ? "bg-primary text-white border-primary shadow-sm"
                    : dark
                      ? "border-ink-border bg-ink-1 hover:border-muted-foreground/50 text-ink-foreground"
                      : "border-border bg-background hover:border-foreground/30 text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{opt.id}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
      >
        <div>
          <label
            className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            htmlFor="vf-make"
          >
            2. Manufacturer / Make
          </label>
          <select
            id="vf-make"
            className={fClass}
            value={make}
            onChange={(e) => {
              setMake(e.target.value);
              setModel("");
              setEngine("");
            }}
          >
            <option value="">Select Manufacturer</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            htmlFor="vf-model"
          >
            3. Model
          </label>
          <select
            id="vf-model"
            className={fClass}
            value={model}
            disabled={!make}
            onChange={(e) => {
              setModel(e.target.value);
              setEngine("");
            }}
          >
            <option value="">{make ? "Select Model" : "Choose Make first"}</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            htmlFor="vf-engine"
          >
            4. Powertrain / Variant
          </label>
          <select
            id="vf-engine"
            className={fClass}
            value={engine}
            disabled={!model}
            onChange={(e) => setEngine(e.target.value)}
          >
            <option value="">{model ? "Select Powertrain / Variant" : "Choose Model first"}</option>
            {engines.map((eg) => (
              <option key={eg} value={eg}>
                {eg}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
            htmlFor="vf-year"
          >
            5. Model Year
          </label>
          <select
            id="vf-year"
            className={fClass}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="">All Production Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
          <button
            type="submit"
            disabled={!ready}
            className="btn btn-primary h-[2.85rem] w-full text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow"
          >
            <Search className="h-4 w-4" />
            <span>Show Compatible Products</span>
          </button>
          {(make || model || year || engine) && (
            <button
              type="button"
              onClick={handleReset}
              title="Reset fields"
              className="grid h-[2.85rem] w-10 shrink-0 place-items-center rounded border border-border hover:border-foreground text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
