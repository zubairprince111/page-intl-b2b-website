import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  FileSpreadsheet,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/site/PageHeader";
import { centers } from "@/lib/data";

export const Route = createFileRoute("/service-centers")({
  head: () => ({
    meta: [
      {
        title:
          "Equip Your Service Center — Automotive Machinery & Parts Supply | PAGE International",
      },
      {
        name: "description",
        content:
          "PAGE International equips automotive service centers with heavy-duty lifts, diagnostic bays, tyre changers, and scheduled spare parts supply.",
      },
      {
        property: "og:title",
        content: "Equip Your Service Center — PAGE International",
      },
      {
        property: "og:description",
        content:
          "Machinery, diagnostic tooling, and parts distribution for automotive service center hubs.",
      },
    ],
  }),
  component: ServiceCenterSolutions,
});

export function ServiceCenterSolutions() {
  const [activeHub, setActiveHub] = useState<string>("dhaka-tejgaon");

  return (
    <div className="bg-background text-foreground min-h-screen">
      <PageHeader
        eyebrow="B2B Solutions for Service Hubs"
        title="Equip Your Service Center"
        intro="PAGE International supplies high-volume automotive service centers, dealerships, and independent service hubs with heavy machinery, electronic diagnostics, bulk lubricants, and guaranteed spare parts replenishment."
      >
        <div className="flex flex-wrap gap-3">
          <Link
            to="/support"
            className="btn btn-primary h-11 text-xs font-bold uppercase tracking-wider"
          >
            <FileSpreadsheet className="h-4 w-4" /> Request Service Center Equipment Quote
          </Link>
          <Link
            to="/shop"
            search={{ cat: "Garage Equipment" }}
            className="btn btn-outline border-ink-border text-ink-foreground hover:bg-ink-2 h-11 text-xs font-bold uppercase tracking-wider"
          >
            <Wrench className="h-4 w-4 text-primary" /> View Equipment Catalogue
          </Link>
        </div>
      </PageHeader>

      {/* Core Solutions Grid for Service Centers */}
      <section className="container-page py-16">
        <div className="max-w-2xl mb-10">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary block">
            End-To-End Supply
          </span>
          <h2 className="display-md mt-1 text-foreground">WHAT WE PROVIDE FOR SERVICE CENTERS</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Engineered for high daily turnover, multi-bay synchronization, and compliance with
            Japanese, European, and EV manufacturer standards.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <div className="grid h-10 w-10 place-items-center rounded bg-primary/10 text-primary mb-4">
                <Wrench className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-2xl uppercase text-foreground">
                Multi-Bay Lifting Systems
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                4-tonne clear-floor electro-hydraulic 2-post lifts, in-ground scissor lifts for
                quick-service bays, and heavy 4-post inspection platforms.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Dual cylinder synchronization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Certified anchor bolts & foundation load check</span>
                </li>
              </ul>
            </div>
            <Link
              to="/shop"
              search={{ cat: "Garage Equipment" }}
              className="mt-6 text-xs font-bold uppercase text-primary hover:underline flex items-center gap-1"
            >
              Explore Lifts <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <div className="grid h-10 w-10 place-items-center rounded bg-primary/10 text-primary mb-4">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-2xl uppercase text-foreground">
                Tyre & Wheel Service Bays
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Pneumatic helper-arm tyre changers for alloy and run-flat wheels, microprocessor
                laser balancers, and computerized 3D wheel alignment.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Damage-free rim clamping heads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>High-speed balancing cycle under 8 seconds</span>
                </li>
              </ul>
            </div>
            <Link
              to="/shop"
              search={{ cat: "Garage Equipment" }}
              className="mt-6 text-xs font-bold uppercase text-primary hover:underline flex items-center gap-1"
            >
              Explore Tyre Equipment <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <div className="grid h-10 w-10 place-items-center rounded bg-primary/10 text-primary mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-2xl uppercase text-foreground">
                Diagnostic Computers & ADAS
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Multi-brand OE-level diagnostic tablets with active bidirectional actuation, ECU
                coding, oscilloscope modules, and radar/camera target frames.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>100+ Japanese & European brand coverage</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>2-year continuous cloud software updates</span>
                </li>
              </ul>
            </div>
            <Link
              to="/shop"
              search={{ cat: "Diagnostic Systems" }}
              className="mt-6 text-xs font-bold uppercase text-primary hover:underline flex items-center gap-1"
            >
              Explore Diagnostics <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <div className="grid h-10 w-10 place-items-center rounded bg-primary/10 text-primary mb-4">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-2xl uppercase text-foreground">
                Consolidated Spare Parts Supply
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Scheduled delivery of fast-moving maintenance items: ceramic brake pads, disc
                rotors, AGM/EFB batteries, synthetic oils, and filter packs.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>100% Genuine provenance guarantee</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Volume commercial trade discounts</span>
                </li>
              </ul>
            </div>
            <Link
              to="/shop"
              search={{ type: "parts" }}
              className="mt-6 text-xs font-bold uppercase text-primary hover:underline flex items-center gap-1"
            >
              Explore Parts Catalogue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <div className="grid h-10 w-10 place-items-center rounded bg-primary/10 text-primary mb-4">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-2xl uppercase text-foreground">
                Fluid Dispensing & Compressed Air
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Rotary screw compressors, refrigerated air dryers, overhead hose reels, and digital
                metering guns for high-throughput oil changes.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Quiet continuous screw operation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Clean dry air protects pneumatic tools</span>
                </li>
              </ul>
            </div>
            <Link
              to="/shop"
              search={{ cat: "Garage Equipment" }}
              className="mt-6 text-xs font-bold uppercase text-primary hover:underline flex items-center gap-1"
            >
              Explore Compressors <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <div className="grid h-10 w-10 place-items-center rounded bg-primary/10 text-primary mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-2xl uppercase text-foreground">
                EV Readiness Equipment
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Equip dedicated EV bays with 1000V VDE insulated tool trolleys, battery pack
                lifters, high-voltage PPE, and charging infrastructure.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-foreground/80">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>IEC 60900 safety compliance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Hybrid & full-electric testing rigs</span>
                </li>
              </ul>
            </div>
            <Link
              to="/shop"
              search={{ mobility: "EV" }}
              className="mt-6 text-xs font-bold uppercase text-primary hover:underline flex items-center gap-1"
            >
              Explore EV Equipment <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Regional Equipment Demonstration Hubs */}
      <section className="bg-secondary/40 py-16 border-t border-border">
        <div className="container-page">
          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary block">
              Machinery Demonstration & Stock Hubs
            </span>
            <h2 className="display-md mt-1 text-foreground">PAGE EQUIPMENT DEMONSTRATION HUBS</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Service center directors and workshop operators can visit our regional demonstration
              centers to see lifts, tyre changers, and diagnostic systems in action.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {centers.map((c) => (
              <div
                key={c.id}
                className="rounded border border-border bg-card p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                    {c.area} Equipment Hub
                  </span>
                  <h3 className="font-heading text-2xl uppercase text-foreground mt-3">{c.name}</h3>
                  <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{c.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{c.hours}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>B2B Desk: +880 9612-PAGE-INTL</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Demo Equipment Available:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {c.services.map((s) => (
                        <span
                          key={s}
                          className="text-[11px] bg-secondary text-foreground px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-border">
                  <Link
                    to="/services/book"
                    search={{ center: c.id }}
                    className="btn btn-outline h-9 w-full text-xs font-bold uppercase tracking-wider"
                  >
                    Book Machinery Demo at {c.area}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
