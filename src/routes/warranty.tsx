import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/warranty")({
  head: () => ({
    meta: [
      { title: "Equipment Warranty Policy — PAGE International" },
      {
        name: "description",
        content:
          "Official Equipment Warranty Policy by PAGE International Ltd. Coverage schedules (18–36 months), on-site engineer SLA, and Tejgaon spares buffer.",
      },
      { property: "og:title", content: "Equipment Warranty Policy — PAGE International" },
      {
        property: "og:description",
        content:
          "Official 18 to 36 months commercial warranty on vehicle lifts, tyre changers, wheel balancers, screw compressors, and EV diagnostic tools.",
      },
    ],
  }),
  component: WarrantyPage,
});

export function WarrantyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen py-10 sm:py-16">
      <div className="container-page max-w-3xl">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Minimal Header */}
        <div className="border-b border-border pb-6">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-primary mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>After-Sales Service Standard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-foreground">
            Equipment Warranty Policy
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            PAGE International Ltd. • Commercial Machinery Service Standard • Dhaka, Bangladesh
          </p>
        </div>

        {/* Minimal Highlight Box */}
        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-xs sm:text-sm text-foreground/90">
          <p className="font-semibold text-foreground mb-1">Commercial Warranty Summary</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All commercial garage machinery distributed by PAGE carries 18 to 36 months of official
            manufacturer-backed warranty. Supported by an active BDT 50M+ spare parts buffer at our
            Tejgaon Central Warehouse and guaranteed 4–8 hour on-site engineer response in Dhaka.
          </p>
        </div>

        {/* Minimal Body Content */}
        <div className="mt-8 space-y-6 text-xs sm:text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              1. Warranty Coverage Schedules
            </h2>
            <p className="text-muted-foreground">
              PAGE International Ltd. warrants that equipment is free from defects in material,
              structural engineering, and workmanship under normal commercial workshop conditions:
            </p>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 text-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">Equipment Category</th>
                    <th className="p-3">Covered Components</th>
                    <th className="p-3">Tenure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted-foreground">
                  <tr>
                    <td className="p-3 font-medium text-foreground">
                      Vehicle Lifts (2-Post, 4-Post, Scissor)
                    </td>
                    <td className="p-3">
                      Structural steel columns & carriages
                      <br />
                      Hydraulic cylinders, pump & motor
                      <br />
                      Cables, pulleys & safety locks
                    </td>
                    <td className="p-3 font-mono">
                      36 Months (Steel)
                      <br />
                      24 Months (Hydraulics)
                      <br />
                      12 Months (Cables)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">
                      Tyre Changers & Digital Balancers
                    </td>
                    <td className="p-3">
                      Turntable motor, gearbox & motherboards
                      <br />
                      Pneumatic bead-breaker & clamping valves
                    </td>
                    <td className="p-3 font-mono">
                      24 Months (Motors)
                      <br />
                      12 Months (Pneumatics)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">
                      Rotary Screw Air Compressors
                    </td>
                    <td className="p-3">
                      Airend rotor core assembly
                      <br />
                      Electric motor, inverter & PLC controller
                    </td>
                    <td className="p-3 font-mono">
                      36 Months (Airend)
                      <br />
                      24 Months (Motor)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">EV Diagnostic Bays & Tools</td>
                    <td className="p-3">
                      SmartSafe battery balancers & analyzers
                      <br />
                      Cloud vehicle software update license
                      <br />
                      1,000V VDE insulated hand tool forging steel
                    </td>
                    <td className="p-3 font-mono">
                      24 Months (Hardware)
                      <br />
                      24 Months (Cloud updates)
                      <br />
                      Lifetime (Tool Steel)
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Commercial Spare Parts</td>
                    <td className="p-3">Brake pads, suspension bushings, pumps</td>
                    <td className="p-3 font-mono">12 Months / 20,000 km</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              2. Mandatory Validity Conditions
            </h2>
            <p className="text-muted-foreground">
              Warranty validity requires adherence to standard operating parameters:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                <strong>PAGE Certified Installation:</strong> Equipment must be assembled, anchored,
                and commissioned by authorized PAGE engineers.
              </li>
              <li>
                <strong>Approved Operating Fluids:</strong> Hydraulic systems must use ISO VG-46 or
                VG-32 anti-wear hydraulic oil only.
              </li>
              <li>
                <strong>Electrical Protection:</strong> Three-phase equipment must be connected via
                functional motor circuit breakers and voltage/phase relays.
              </li>
              <li>
                <strong>Maintenance Documentation:</strong> Workshop staff must maintain basic daily
                lubrication and periodic cable tension records.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              3. Exclusions & Limitations
            </h2>
            <p className="text-muted-foreground">The warranty does not cover:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>
                Normal wear consumables (rubber arm pads, plastic demount heads, fuses, filters).
              </li>
              <li>Damage caused by lifting loads exceeding certified Safe Working Load (SWL).</li>
              <li>
                Electrical damage from lightning or utility power grid surges without surge
                arrestors.
              </li>
              <li>
                Unauthorized field modifications, hydraulic pressure tweaking, or non-OEM spares.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              4. Service Level Agreements (SLA)
            </h2>
            <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
              <div className="rounded-lg border border-border p-3 bg-secondary/30">
                <span className="font-semibold text-foreground block">Dhaka Division</span>
                <span className="text-muted-foreground">On-site within 4–8 business hours</span>
              </div>
              <div className="rounded-lg border border-border p-3 bg-secondary/30">
                <span className="font-semibold text-foreground block">Chittagong & Sylhet</span>
                <span className="text-muted-foreground">On-site within 12–24 business hours</span>
              </div>
              <div className="rounded-lg border border-border p-3 bg-secondary/30">
                <span className="font-semibold text-foreground block">Other Divisions</span>
                <span className="text-muted-foreground">On-site within 24–48 business hours</span>
              </div>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              5. Emergency Service & Warranty Desk
            </h2>
            <p className="text-muted-foreground">
              To log a service ticket or submit a warranty inquiry, provide your Machine Serial
              Number and invoice reference to our engineering desk:
            </p>
            <div className="rounded-lg border border-border bg-secondary/30 p-3.5 text-xs space-y-1">
              <p className="font-semibold text-foreground">
                PAGE International Ltd. — Service Engineering Desk
              </p>
              <p className="text-muted-foreground">
                Tejgaon Industrial Area, Dhaka-1208 • Saturday–Thursday: 8:00 AM – 8:00 PM
              </p>
              <p className="text-muted-foreground">
                Hotline:{" "}
                <a href="tel:+8809612724346" className="text-primary font-semibold hover:underline">
                  +880 9612-PAGE-INTL (+880 9612-724346)
                </a>
              </p>
              <p className="text-muted-foreground">
                WhatsApp Emergency Service:{" "}
                <a
                  href="https://wa.me/8801700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold hover:underline"
                >
                  +880 1700-000000
                </a>
              </p>
              <p className="text-muted-foreground">
                Email:{" "}
                <a
                  href="mailto:service@page-intl.com"
                  className="text-primary font-semibold hover:underline"
                >
                  service@page-intl.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
