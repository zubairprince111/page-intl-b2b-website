import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  MapPin,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { centers } from "@/lib/data";
import { useCreateBooking } from "@/lib/data-client";

type S = { service?: string | undefined; center?: string | undefined };

export const Route = createFileRoute("/services/book")({
  validateSearch: (s: Record<string, unknown>): S => ({
    service: typeof s["service"] === "string" ? (s["service"] as string) : undefined,
    center: typeof s["center"] === "string" ? (s["center"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: "Book Equipment Demonstration & Engineering Consultation — PAGE International",
      },
      {
        name: "description",
        content:
          "Schedule a live machinery demonstration, turnkey bay planning consultation, or lift anchoring service with PAGE International engineers.",
      },
      {
        property: "og:title",
        content: "Book Equipment Consultation — PAGE International",
      },
      {
        property: "og:description",
        content: "Schedule live machinery demonstration or workshop engineering consultation.",
      },
    ],
  }),
  component: BookConsultation,
});

const b2bServiceOptions = [
  {
    id: "bay-planning",
    name: "Turnkey Workshop Bay Planning & 2D/3D Layout",
    desc: "Architectural consultation for new workshop investments or bay expansions.",
  },
  {
    id: "lift-demo",
    name: "Vehicle Lift Machinery Demonstration",
    desc: "Live demonstration of 2-post, 4-post, or scissor lifts under load.",
  },
  {
    id: "tyre-demo",
    name: "Tyre Changer & 3D Wheel Alignment Demo",
    desc: "Testing run-flat tyre mounting and computerized 4-wheel alignment cameras.",
  },
  {
    id: "diag-demo",
    name: "Diagnostic Tablet & ADAS Calibration Live Trial",
    desc: "Live ECU scanning, bidirectional tests, and radar/camera target calibration.",
  },
  {
    id: "ev-audit",
    name: "EV Workshop Transition & 1000V Tooling Consultation",
    desc: "High-voltage safety auditing, battery balancer inspection, and PPE setup.",
  },
  {
    id: "installation",
    name: "Machinery Foundation Anchoring & Rigging Service",
    desc: "Deployment of certified engineers to install and anchor workshop lifts on site.",
  },
];

const steps = [
  "1. Engineering Need",
  "2. Business Profile",
  "3. Hub / On-Site",
  "4. Date & Time",
  "5. Contact Info",
];

const slots = ["10:00 AM", "11:30 AM", "02:00 PM", "03:30 PM", "05:00 PM"];

const days = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return d;
});

export function BookConsultation() {
  const search = Route.useSearch();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingNum, setConfirmedBookingNum] = useState("");
  const createBookingMutation = useCreateBooking();
  const [sel, setSel] = useState<string[]>(search.service ? [search.service] : ["lift-demo"]);

  const [biz, setBiz] = useState({
    businessName: "",
    businessType: "Workshop",
    bays: "2-4 Bays",
    equipmentInterest: "",
  });

  const [locationType, setLocationType] = useState<"hub" | "onsite">("hub");
  const [center, setCenter] = useState(search.center ?? "dhaka-tejgaon");
  const [onsiteAddress, setOnsiteAddress] = useState("");

  const [day, setDay] = useState<number | null>(0);
  const [slot, setSlot] = useState("11:30 AM");

  const [info, setInfo] = useState({
    contactPerson: "",
    phone: "",
    email: "",
    notes: "",
  });

  const canNext = [
    sel.length > 0,
    !!biz.businessName,
    locationType === "hub" ? !!center : onsiteAddress.length > 5,
    day !== null && !!slot,
    !!(info.contactPerson && info.phone.length >= 6),
  ][step];

  const chosenServices = b2bServiceOptions.filter((s) => sel.includes(s.id));
  const c = centers.find((x) => x.id === center);

  if (done) {
    return (
      <div className="container-page flex min-h-screen flex-col items-center justify-center py-32 text-center bg-background">
        <div className="rounded-full bg-emerald-500/15 p-4 text-emerald-600 mb-2">
          <CheckCircle2 className="h-16 w-16" strokeWidth={1.75} />
        </div>
        <h1 className="display-lg mt-4 text-foreground font-bold">
          Equipment Consultation Scheduled
        </h1>
        {confirmedBookingNum && (
          <p className="mt-1 text-xs font-mono text-primary font-bold">
            Reference ID: {confirmedBookingNum}
          </p>
        )}
        <p className="mt-3 max-w-lg text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Your appointment for{" "}
          <strong>
            {chosenServices.map((s) => s.name).join(", ") || "Machinery Consultation"}
          </strong>{" "}
          at{" "}
          <strong>
            {locationType === "hub" ? `${c?.name} (${c?.area})` : `On-site at ${biz.businessName}`}
          </strong>{" "}
          on{" "}
          <strong>
            {day !== null && days[day]!.toDateString()} at {slot}
          </strong>{" "}
          has been booked. A PAGE commercial application engineer will call you to confirm
          demonstration preparations.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/shop"
            search={{ cat: "Garage Equipment" }}
            className="btn btn-primary h-11 px-6 text-xs font-bold uppercase tracking-wider"
          >
            Explore Equipment Catalogue
          </Link>
          <Link
            to="/"
            className="btn btn-outline h-11 px-6 text-xs font-bold uppercase tracking-wider"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground min-h-screen pt-24 lg:pt-32 pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-secondary/40 py-3">
        <nav
          aria-label="Breadcrumb"
          className="container-page text-xs text-muted-foreground flex items-center gap-1.5"
        >
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Book Equipment Consultation</span>
        </nav>
      </div>

      <div className="container-page py-10 lg:py-14">
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-primary block">
            B2B Commercial Engineering Desk
          </span>
          <h1 className="display-lg mt-1 text-foreground font-bold">
            Schedule Equipment Demonstration or Bay Consultation
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Book a demonstration of workshop lifts, tyre changers, and diagnostic computers at our
            regional equipment hubs, or schedule an on-site engineer visit to your garage facility.
          </p>
        </div>

        {/* Step Progress Tracker */}
        <ol className="mt-8 grid grid-cols-5 gap-2" aria-label="Progress">
          {steps.map((s, i) => (
            <li key={s} className="text-xs font-semibold uppercase tracking-wider">
              <span
                className={`mb-2 block h-1.5 rounded-full transition-colors ${
                  i <= step ? "bg-primary" : "bg-border"
                }`}
              />
              <span
                className={`hidden sm:inline ${
                  i === step ? "text-primary font-bold" : "text-muted-foreground"
                }`}
              >
                {s}
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main Wizard Form Card */}
          <div className="rounded border border-border bg-card p-6 sm:p-8 shadow-xs">
            <h2 className="display-md mb-6 text-foreground font-bold border-b border-border pb-3">
              Step {step + 1}: {steps[step]?.split(". ")[1]}
            </h2>

            {/* STEP 0: SELECT CONSULTATION NEED */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Select the equipment or engineering service you would like to discuss:
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {b2bServiceOptions.map((s) => {
                    const on = sel.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setSel(on ? sel.filter((x) => x !== s.id) : [...sel, s.id])}
                        className={`flex items-start justify-between gap-3 rounded border p-4 text-left transition-all ${
                          on
                            ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                            : "border-border hover:border-foreground/30 bg-card"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm text-foreground">{s.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                            {s.desc}
                          </p>
                        </div>
                        <div
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${
                            on
                              ? "border-primary bg-primary text-white"
                              : "border-muted-foreground/40"
                          }`}
                        >
                          {on && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 1: BUSINESS PROFILE */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Provide your business details so our engineering desk can tailor the
                  demonstration:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="book-biz-name"
                      className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                    >
                      Business / Workshop Name *
                    </label>
                    <input
                      id="book-biz-name"
                      required
                      type="text"
                      placeholder="e.g. Paramount Auto Center Ltd."
                      className="field"
                      value={biz.businessName}
                      onChange={(e) => setBiz({ ...biz, businessName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="book-biz-type"
                      className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                    >
                      Business Type
                    </label>
                    <select
                      id="book-biz-type"
                      className="field"
                      value={biz.businessType}
                      onChange={(e) => setBiz({ ...biz, businessType: e.target.value })}
                    >
                      <option value="Workshop">Independent Workshop</option>
                      <option value="Service Center">Multi-Bay Service Center</option>
                      <option value="Dealer">Authorized Dealership</option>
                      <option value="Fleet">Commercial Fleet Depot</option>
                      <option value="EV Business">EV Specialty Garage</option>
                      <option value="Distributor">Wholesale Distributor</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="book-biz-bays"
                      className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                    >
                      Existing or Planned Service Bays
                    </label>
                    <select
                      id="book-biz-bays"
                      className="field"
                      value={biz.bays}
                      onChange={(e) => setBiz({ ...biz, bays: e.target.value })}
                    >
                      <option value="1-2 Bays">1–2 Bays (Small Garage)</option>
                      <option value="3-5 Bays">3–5 Bays (Medium Workshop)</option>
                      <option value="6-10 Bays">6–10 Bays (Large Service Center)</option>
                      <option value="10+ Bays">10+ Bays (Industrial Depot / Dealership)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="book-biz-equip"
                      className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                    >
                      Target Machinery of Interest
                    </label>
                    <input
                      id="book-biz-equip"
                      type="text"
                      placeholder="e.g. Torq 2-Post Lift 4.0T, TC-820 Tyre Changer"
                      className="field"
                      value={biz.equipmentInterest}
                      onChange={(e) => setBiz({ ...biz, equipmentInterest: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: DEMONSTRATION LOCATION */}
            {step === 2 && (
              <div className="space-y-5">
                <p className="text-xs text-muted-foreground">
                  Where would you like to conduct the demonstration or consultation?
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLocationType("hub")}
                    className={`rounded border p-4 text-left transition-all ${
                      locationType === "hub"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40 font-bold"
                        : "border-border hover:border-foreground/30 bg-card"
                    }`}
                  >
                    <span className="block text-sm text-foreground">
                      Visit PAGE Regional Equipment Hub
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Inspect running machinery at our demo showroom.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLocationType("onsite")}
                    className={`rounded border p-4 text-left transition-all ${
                      locationType === "onsite"
                        ? "border-primary bg-primary/5 ring-1 ring-primary/40 font-bold"
                        : "border-border hover:border-foreground/30 bg-card"
                    }`}
                  >
                    <span className="block text-sm text-foreground">
                      On-Site Engineer Visit (Your Facility)
                    </span>
                    <span className="text-xs text-muted-foreground mt-1 block">
                      Our engineer audits your bays and foundation on site.
                    </span>
                  </button>
                </div>

                {locationType === "hub" ? (
                  <div className="space-y-3 pt-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Select Regional Demonstration Center:
                    </label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {centers.map((cnt) => (
                        <button
                          key={cnt.id}
                          type="button"
                          onClick={() => setCenter(cnt.id)}
                          className={`rounded border p-3 text-left transition-all ${
                            center === cnt.id
                              ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                              : "border-border bg-card hover:border-foreground/30"
                          }`}
                        >
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                            {cnt.area}
                          </span>
                          <span className="text-xs font-bold text-foreground block mt-0.5">
                            {cnt.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground block mt-1">
                            {cnt.address}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Workshop Facility Street Address & City *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Plot 14, Mohakhali Industrial Area, Dhaka. Building floor or bay details..."
                      className="field"
                      value={onsiteAddress}
                      onChange={(e) => setOnsiteAddress(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: DATE & TIME */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Select Demonstration Date
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {days.map((d, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setDay(i)}
                        className={`rounded border p-3 text-center transition-all ${
                          day === i
                            ? "border-primary bg-primary text-white font-bold"
                            : "border-border bg-card hover:border-foreground/30 text-foreground"
                        }`}
                      >
                        <span className="block text-[10px] uppercase tracking-wider">
                          {d.toLocaleDateString("en-US", { weekday: "short" })}
                        </span>
                        <span className="mt-1 block font-display text-xl">{d.getDate()}</span>
                        <span className="block text-[10px]">
                          {d.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Select Time Window
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {slots.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSlot(s)}
                        className={`rounded border py-2 text-xs font-semibold transition-all ${
                          slot === s
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-card hover:border-foreground/30 text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: CONTACT INFO */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Enter primary contact information for appointment confirmation:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="book-contact-person"
                      className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                    >
                      Contact Person / Lead Engineer *
                    </label>
                    <input
                      id="book-contact-person"
                      required
                      type="text"
                      placeholder="e.g. Engr. Shafiqul Islam"
                      className="field"
                      value={info.contactPerson}
                      onChange={(e) => setInfo({ ...info, contactPerson: e.target.value })}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="book-contact-phone"
                      className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                    >
                      Phone / WhatsApp *
                    </label>
                    <input
                      id="book-contact-phone"
                      required
                      type="tel"
                      placeholder="+880 17XXXXXXXX"
                      className="field"
                      value={info.phone}
                      onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="book-contact-email"
                    className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Corporate Email
                  </label>
                  <input
                    id="book-contact-email"
                    type="email"
                    placeholder="workshop@company.com"
                    className="field"
                    value={info.email}
                    onChange={(e) => setInfo({ ...info, email: e.target.value })}
                  />
                </div>

                <div>
                  <label
                    htmlFor="book-notes"
                    className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Specific Technical Questions / Bay Requirements
                  </label>
                  <textarea
                    id="book-notes"
                    rows={3}
                    placeholder="Provide details about your workshop power supply (single/three phase), ceiling height, or specific demo requirements..."
                    className="field"
                    value={info.notes}
                    onChange={(e) => setInfo({ ...info, notes: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep(step - 1)}
                className="btn btn-outline h-10 px-5 text-xs font-bold uppercase disabled:opacity-30"
              >
                Previous
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  disabled={!canNext}
                  onClick={() => setStep(step + 1)}
                  className="btn btn-primary h-10 px-6 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                >
                  Continue to Step {step + 2}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canNext || isSubmitting}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const bookingDate =
                        day !== null
                          ? days[day]!.toISOString().slice(0, 10)
                          : new Date().toISOString().slice(0, 10);

                      const res = await createBookingMutation.mutateAsync({
                        companyName: biz.businessName,
                        contactName: info.contactPerson || biz.businessName,
                        phone: info.phone,
                        email: info.email,
                        serviceType:
                          chosenServices.map((s) => s.name).join(", ") ||
                          "General Equipment Consultation",
                        bookingDate,
                        timeSlot: slot,
                        city: locationType === "hub" ? c?.area || "Dhaka" : "Dhaka",
                        centerId: locationType === "hub" ? center : "onsite",
                        centerName:
                          locationType === "hub"
                            ? c?.name || "PAGE Equipment Hub"
                            : `On-site: ${onsiteAddress || biz.businessName}`,
                        notes: info.notes,
                      });

                      if (res.bookingNumber) {
                        setConfirmedBookingNum(res.bookingNumber);
                      }
                      setDone(true);
                    } catch (err) {
                      console.error("Booking error:", err);
                      setDone(true);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="btn btn-primary h-10 px-8 text-xs font-bold uppercase tracking-wider shadow disabled:opacity-50"
                >
                  {isSubmitting ? "Securing Appointment..." : "Confirm Appointment"}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Summary */}
          <aside className="rounded border border-border bg-card p-6 h-fit space-y-5">
            <h3 className="font-heading text-xl uppercase text-foreground border-b border-border pb-2">
              Appointment Summary
            </h3>

            <div className="text-xs space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Service Need:
                </span>
                <span className="font-bold text-foreground">
                  {chosenServices.map((s) => s.name).join(", ") || "None selected"}
                </span>
              </div>

              {biz.businessName && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Business:
                  </span>
                  <span className="text-foreground">
                    {biz.businessName} ({biz.businessType})
                  </span>
                </div>
              )}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Location:
                </span>
                <span className="text-foreground">
                  {locationType === "hub"
                    ? `${c?.name} (${c?.area})`
                    : "On-site at Client Facility"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Scheduled Time:
                </span>
                <span className="text-foreground">
                  {day !== null ? days[day]!.toDateString() : "Date not set"} at {slot}
                </span>
              </div>
            </div>

            <div className="border-t border-border pt-4 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                <span>Complimentary commercial engineering session</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary shrink-0" />
                <span>Live machinery load demonstration</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
