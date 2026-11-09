import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, Car, CheckCircle2, Truck, Zap } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { VehicleFinder } from "@/components/site/VehicleFinder";
import { vehiclePlatformData, type MobilityType } from "@/lib/data";

export const Route = createFileRoute("/vehicles")({
  head: () => ({
    meta: [
      {
        title: "Shop by Vehicle Platform (4W · 2W · 3W · EV) — PAGE International",
      },
      {
        name: "description",
        content:
          "Find compatible parts, consumables and workshop equipment across 4-Wheeler, 2-Wheeler, 3-Wheeler, and EV electric mobility platforms.",
      },
      {
        property: "og:title",
        content: "Shop by Vehicle Platform — PAGE International",
      },
      {
        property: "og:description",
        content: "Cross-platform automotive fitment directory for workshops and fleets.",
      },
    ],
  }),
  component: Vehicles,
});

const MOBILITY_TABS: { id: MobilityType; label: string; icon: any }[] = [
  { id: "4-Wheeler", label: "4-Wheeler (Passenger & LCV)", icon: Car },
  { id: "2-Wheeler", label: "2-Wheeler (Motorcycles & Scooters)", icon: Bike },
  { id: "3-Wheeler", label: "3-Wheeler (Auto Rickshaw & Cargo)", icon: Truck },
  { id: "EV", label: "EV (Electric Mobility)", icon: Zap },
];

export function Vehicles() {
  const [activeTab, setActiveTab] = useState<MobilityType>("4-Wheeler");
  const platformMakes = vehiclePlatformData[activeTab] ?? {};

  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        eyebrow="Multi-Mobility Directory"
        title="Shop Products by Vehicle Platform"
        intro="Select your vehicle category—4-Wheeler, 2-Wheeler, 3-Wheeler, or EV—to discover guaranteed compatible replacement parts, consumables, and workshop equipment."
      >
        <VehicleFinder dark={true} />
      </PageHeader>

      <section className="container-page py-16">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="eyebrow">Platform Directory</p>
            <h2 className="display-md mt-1 text-foreground">MANUFACTURER & MODEL DIRECTORY</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Choose your platform and brand to view compatible parts catalogued by powertrain and
              chassis code.
            </p>
          </div>

          {/* Platform Tab Buttons */}
          <div className="flex flex-wrap gap-2">
            {MOBILITY_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider border transition-all ${
                    active
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(platformMakes).map(([make, models]) => (
            <div
              key={make}
              className="rounded border border-border bg-card p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                  <h3 className="font-display text-2xl font-bold uppercase text-foreground">
                    {make}
                  </h3>
                  <span className="text-xs font-bold text-primary">
                    {Object.keys(models).length} Models
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs">
                  {Object.entries(models).map(([modelName, engines]) => (
                    <li key={modelName}>
                      <Link
                        to="/shop"
                        search={{
                          mobility: activeTab,
                          vehicle: `${make} ${modelName}`,
                        }}
                        className="group flex items-center justify-between rounded p-2 hover:bg-secondary transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                            {make} {modelName.replace(/_/g, " ")}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {engines.join(", ")}
                          </span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-border">
                <Link
                  to="/shop"
                  search={{ mobility: activeTab, vehicle: make }}
                  className="btn btn-outline h-8.5 w-full text-[11px] font-bold uppercase tracking-wider"
                >
                  View All {make} Products
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
