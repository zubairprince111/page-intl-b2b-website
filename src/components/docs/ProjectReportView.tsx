import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  Layers,
  Lock,
  Printer,
  Search,
  Server,
  ShieldCheck,
  Terminal,
  Workflow,
  ZoomIn,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ProductImageZoomModal } from "@/components/site/ProductImageZoomModal";
import { type GalleryImageItem } from "@/lib/image-zoom";
import {
  ARCHITECTURE_DIAGRAMS,
  DATABASE_TABLES,
  NO_PRICE_INVARIANTS,
  OPERATIONS_COMMANDS,
  REPORT_METADATA,
  REPORT_TOC,
  REQUIREMENTS,
  ROADMAP_ITEMS,
  ROUTE_GROUPS,
  SECURITY_MATRIX,
  STAKEHOLDERS,
  SUBSYSTEM_ALGORITHMS,
  TECH_STACK,
  TEST_SUITES,
  type DatabaseTableSpec,
} from "./project-report-data";

function SectionHeading({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="border-b border-border pb-4 mb-6">
      <p className="eyebrow flex items-center gap-2">
        <span>SECTION {number}</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">ENGINEERING SPECIFICATION</span>
      </p>
      <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1.5">
        {number}. {title}
      </h2>
      {subtitle && <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
    </div>
  );
}

export function ProjectReportView() {
  const [reqFilter, setReqFilter] = useState<"ALL" | "FR" | "NFR">("ALL");
  const [tableDomainFilter, setTableDomainFilter] = useState<"ALL" | DatabaseTableSpec["domain"]>(
    "ALL",
  );
  const [tableQuery, setTableQuery] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [activeDiagramIndex, setActiveDiagramIndex] = useState(0);

  const diagramGallery: GalleryImageItem[] = useMemo(
    () =>
      ARCHITECTURE_DIAGRAMS.map((d) => ({
        id: d.id,
        img: d.src,
        label: d.code,
      })),
    [],
  );

  const filteredRequirements = useMemo(() => {
    if (reqFilter === "ALL") return REQUIREMENTS;
    return REQUIREMENTS.filter((r) => r.kind === reqFilter);
  }, [reqFilter]);

  const filteredTables = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    return DATABASE_TABLES.filter((t) => {
      const domainMatch = tableDomainFilter === "ALL" || t.domain === tableDomainFilter;
      if (!domainMatch) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.purpose.toLowerCase().includes(q) ||
        t.foreignKeys.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q)
      );
    });
  }, [tableDomainFilter, tableQuery]);

  const totalTests = useMemo(() => TEST_SUITES.reduce((sum, item) => sum + item.count, 0), []);

  const activeDiagram = ARCHITECTURE_DIAGRAMS[activeDiagramIndex] ?? ARCHITECTURE_DIAGRAMS[0];

  const openDiagramZoom = (index: number) => {
    setActiveDiagramIndex(index);
    setZoomOpen(true);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Dark Architectural Hero Band */}
      <section className="relative bg-ink text-ink-foreground border-b border-ink-border pt-24 pb-10 sm:pt-28 sm:pb-12 lg:pt-32 lg:pb-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-20 print:hidden" />
        <div className="container-page relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5 print:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Storefront</span>
            </Link>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400">
              <span>Report Version 2.0.0</span>
              <span className="text-zinc-600">·</span>
              <span>docs/PROJECT_REPORT.md</span>
            </div>
          </div>

          <p className="eyebrow flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5" />
            <span>PAGE INTERNATIONAL</span>
            <span className="text-ink-muted">/</span>
            <span className="text-zinc-300">SYSTEM ARCHITECTURE &amp; PROJECT REPORT</span>
          </p>

          <h1 className="display-lg mt-3 text-white max-w-4xl">
            Software Engineering Project Report
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-300 max-w-3xl leading-relaxed">
            Comprehensive architectural specification, IEEE/UML 2.5 behavioral &amp; structural
            models, Crow&apos;s Foot database dictionary, security hardening controls, and QA test
            verification matrix for the PAGE International B2B Workshop Equipment &amp; Procurement
            Platform.
          </p>

          {/* Key Metric Chips */}
          <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-white">
              <Layers className="h-3.5 w-3.5 text-primary" />
              React 19 + TanStack Start + Nitro 3
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-white">
              <Database className="h-3.5 w-3.5 text-primary" />
              16 Normalized PostgreSQL Tables
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-white">
              <Workflow className="h-3.5 w-3.5 text-primary" />
              10 UML 2.5 / ERD / DFD Diagrams
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              {TEST_SUITES.length} Suites · {totalTests} Automated Tests
            </span>
          </div>

          {/* Interactive Actions */}
          <div className="mt-7 flex flex-wrap items-center gap-3 print:hidden">
            <button
              type="button"
              onClick={() => openDiagramZoom(0)}
              className="btn btn-primary h-10 px-4 text-xs inline-flex items-center gap-2"
            >
              <ZoomIn className="h-4 w-4" />
              <span>Inspect All 10 Diagrams</span>
            </button>
            <a
              href="#sec-6"
              className="btn btn-ghost-light h-10 px-4 text-xs inline-flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span>Jump to UML Diagrams</span>
            </a>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-ghost-light h-10 px-4 text-xs inline-flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </section>

      {/* Mobile Quick Section Strip */}
      <div className="lg:hidden sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-md print:hidden">
        <div className="container-page py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {REPORT_TOC.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="shrink-0 rounded-full border border-border bg-muted/40 hover:bg-primary hover:text-white hover:border-primary px-3 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap"
            >
              {item.number}. {item.shortTitle}
            </a>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] items-start">
          {/* Sticky Desktop Table of Contents */}
          <aside className="hidden lg:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 print:hidden">
            <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Report Contents
                </span>
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-primary">
                  v2.0
                </span>
              </div>
              <nav aria-label="Report Table of Contents" className="space-y-1">
                {REPORT_TOC.map((item) => (
                  <div key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <span className="font-mono text-[11px] font-bold text-primary shrink-0 mt-0.5">
                        {item.number}
                      </span>
                      <span className="leading-snug">{item.shortTitle}</span>
                    </a>
                    {item.id === "sec-6" && (
                      <div className="ml-6 mt-1 mb-1.5 pl-2.5 border-l border-border space-y-0.5">
                        {ARCHITECTURE_DIAGRAMS.map((d) => (
                          <a
                            key={d.id}
                            href={`#${d.anchorId}`}
                            className="block py-0.5 text-[11px] text-muted-foreground/85 hover:text-primary transition-colors truncate"
                            title={d.title}
                          >
                            {d.code.replace("Figure ", "Fig ")} ·{" "}
                            {d.title.replace(/^Figure \d+\.\d+\s*—\s*/, "")}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Report Body */}
          <article className="min-w-0 space-y-14">
            {/* SECTION 1 */}
            <section id="sec-1" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="01"
                title="Document Control & Executive Summary"
                subtitle="System identity, runtime topology, PostgreSQL/PGlite dual-engine persistence, and consultative RFQ procurement overview."
              />

              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/60 border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3.5 w-56">Metadata Field</th>
                      <th className="p-3.5">Verified System Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {REPORT_METADATA.map((row) => (
                      <tr key={row.field} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-semibold text-foreground align-top">
                          {row.field}
                        </td>
                        <td className="p-3.5 text-muted-foreground leading-relaxed">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-border bg-muted/25 p-5 sm:p-6 space-y-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                <p className="font-bold text-foreground text-sm sm:text-base">Executive Summary</p>
                <p>
                  The PAGE International B2B Platform digitizes industrial workshop procurement
                  across Bangladesh—covering heavy automotive lifts (2-post, 4-post, scissor), wheel
                  aligners, diagnostic scanners, EV high-voltage insulated tooling, compressed-air
                  bay systems, consumables, and live demonstration bay bookings in Uttara, Dhaka.
                </p>
                <p>
                  Unlike consumer e-commerce storefronts that publish static retail prices, PAGE
                  operates an engineering-consultative{" "}
                  <strong className="text-foreground">
                    Request for Quotation (RFQ) &amp; Pro-Forma B2B Procurement Model
                  </strong>
                  . Public pages (<code className="text-xs font-mono">/</code>,{" "}
                  <code className="text-xs font-mono">/shop</code>,{" "}
                  <code className="text-xs font-mono">/shop/$slug</code>,{" "}
                  <code className="text-xs font-mono">/cart</code>, and structured Schema.org
                  JSON-LD telemetry) suppress numeric currency amounts while highlighting technical
                  specifications, configurable variants (e.g.,{" "}
                  <code className="font-mono">380V 3-Phase</code> vs{" "}
                  <code className="font-mono">220V Single-Phase</code>), fitment filters, and
                  interactive zoom inspection (<code className="font-mono">1.0x–4.0x</code>). Unit
                  pricing (<code className="font-mono">priceBdt</code>) remains strictly server-side
                  until administrators issue a Pro-Forma draft or zero-trust backend checkout
                  recalculates authoritative transaction totals.
                </p>
              </div>
            </section>

            {/* SECTION 2 */}
            <section id="sec-2" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="02"
                title="Business Domain, Problem Statement & No-Price Storefront Policy"
                subtitle="Why B2B capital machinery relies on consultative quoting instead of exposed retail prices."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <h3 className="text-sm font-bold text-foreground">
                    2.1 Industrial Procurement Cost Variables
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground list-disc pl-4">
                    <li>
                      Electrical configuration (
                      <strong className="text-foreground">220V 1-Phase</strong> vs{" "}
                      <strong className="text-foreground">380V 3-Phase</strong>), chemical anchoring
                      depth, and bay slab reinforcement specs.
                    </li>
                    <li>
                      Multi-bay turn-key bundle sizing, commissioning scope, operator calibration
                      training, and warranty schedule (
                      <strong className="text-foreground">18–36 months</strong>).
                    </li>
                    <li>
                      Customs classification, B2B PO credit terms (
                      <code className="font-mono text-xs">QUOTATION_PO</code>,{" "}
                      <code className="font-mono text-xs">BANK_TRANSFER</code>,{" "}
                      <code className="font-mono text-xs">CHEQUE</code>), and hub freight routing.
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <h3 className="text-sm font-bold text-foreground">
                    2.2 Core Bottlenecks Eliminated
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground list-disc pl-4">
                    <li>
                      Replaced static PDF catalogs with mobility filtering, fitment badges,
                      interactive high-res zoom, and prefix-first SKU search.
                    </li>
                    <li>
                      Removed public BDT pricing leakage across cards, hero stacks, detail routes,
                      and Schema.org SEO snippets.
                    </li>
                    <li>
                      Eliminated unverified RFQ bot spam via honeypot traps, rate limits, and
                      conditional 6-digit Email OTP challenges.
                    </li>
                    <li>
                      Unified quotes, workshop bookings, stock deductions, and forensic audit logs
                      inside a single relational source of truth.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <span>2.3 Storefront No-Price Architectural Invariant</span>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {NO_PRICE_INVARIANTS.map((inv) => (
                    <div
                      key={inv.area}
                      className="rounded-lg border border-border bg-background p-3.5 space-y-1.5"
                    >
                      <div className="text-xs font-bold text-foreground">{inv.area}</div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {inv.enforcement}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 3 */}
            <section id="sec-3" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="03"
                title="Stakeholders, User Personas & System Boundaries"
                subtitle="Four primary human and infrastructure actors interacting with the platform boundary."
              />

              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/60 border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3.5 min-w-[180px]">Persona / Actor</th>
                      <th className="p-3.5 min-w-[160px]">Access Scope</th>
                      <th className="p-3.5 min-w-[320px]">
                        Primary Responsibilities &amp; Interactions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {STAKEHOLDERS.map((s) => (
                      <tr key={s.actor} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-bold text-foreground align-top">{s.actor}</td>
                        <td className="p-3.5 align-top">
                          <span className="inline-block rounded bg-secondary px-2 py-0.5 text-[11px] font-mono font-semibold text-foreground">
                            {s.scope}
                          </span>
                        </td>
                        <td className="p-3.5 text-muted-foreground leading-relaxed">
                          {s.responsibilities}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 4 */}
            <section id="sec-4" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="04"
                title="Functional & Non-Functional Requirements Traceability"
                subtitle="Complete traceability matrix linking FR-01..FR-12 and NFR-01..NFR-06 directly to codebase implementations and tests."
              />

              <div className="flex flex-wrap items-center gap-2 print:hidden">
                {(
                  [
                    { key: "ALL", label: `All Requirements (${REQUIREMENTS.length})` },
                    {
                      key: "FR",
                      label: `Functional FR (${REQUIREMENTS.filter((r) => r.kind === "FR").length})`,
                    },
                    {
                      key: "NFR",
                      label: `Non-Functional NFR (${REQUIREMENTS.filter((r) => r.kind === "NFR").length})`,
                    },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setReqFilter(tab.key)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      reqFilter === tab.key
                        ? "bg-primary text-white shadow-xs"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/60 border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3.5 w-24">ID</th>
                      <th className="p-3.5 min-w-[300px]">Requirement Summary</th>
                      <th className="p-3.5 min-w-[240px]">Implementation &amp; Test Module</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredRequirements.map((req) => (
                      <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 align-top whitespace-nowrap">
                          <span
                            className={`inline-block whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-mono font-bold ${
                              req.kind === "FR"
                                ? "bg-primary/10 text-primary"
                                : "bg-emerald-500/10 text-emerald-700"
                            }`}
                          >
                            {req.id}
                          </span>
                        </td>
                        <td className="p-3.5 text-foreground/90 leading-relaxed">{req.summary}</td>
                        <td className="p-3.5 font-mono text-[11px] text-muted-foreground align-top">
                          {req.module}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 5 */}
            <section id="sec-5" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="05"
                title="System Architecture & Technology Stack"
                subtitle="Full-stack TypeScript SSR architecture powered by TanStack Start, Nitro 3, Drizzle ORM, and Caddy 2."
              />

              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/60 border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3.5 min-w-[160px]">Architectural Tier</th>
                      <th className="p-3.5 min-w-[240px]">Technology &amp; Version</th>
                      <th className="p-3.5 min-w-[280px]">Role in Runtime Architecture</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {TECH_STACK.map((row) => (
                      <tr key={row.tier} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-bold text-foreground align-top">{row.tier}</td>
                        <td className="p-3.5 font-mono text-xs text-primary/90 align-top">
                          {row.technology}
                        </td>
                        <td className="p-3.5 text-muted-foreground leading-relaxed">{row.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 6: ALL 10 ARCHITECTURE & UML DIAGRAMS */}
            <section id="sec-6" className="scroll-mt-24 space-y-8">
              <SectionHeading
                number="06"
                title="Comprehensive System Design & UML Diagrams"
                subtitle="All 10 vector diagrams authored strictly to IEEE/OMG UML 2.5, Crow's Foot ERD, and Gane-Sarson DFD standards. Click any figure to open cursor-anchored zoom & pan inspection."
              />

              {/* Quick Figure Jump Chips */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex flex-wrap gap-1.5">
                  {ARCHITECTURE_DIAGRAMS.map((d) => (
                    <a
                      key={d.id}
                      href={`#${d.anchorId}`}
                      className="rounded-md border border-border bg-background hover:border-primary hover:text-primary px-2.5 py-1 text-[11px] font-mono font-semibold transition-colors"
                    >
                      {d.code.replace("Figure ", "Fig ")}
                    </a>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => openDiagramZoom(0)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  <span>Open Fullscreen Slide Deck</span>
                </button>
              </div>

              <div className="space-y-10">
                {ARCHITECTURE_DIAGRAMS.map((diag, idx) => (
                  <figure
                    key={diag.id}
                    id={diag.anchorId}
                    className="scroll-mt-24 rounded-2xl border border-border bg-card shadow-xs overflow-hidden break-inside-avoid"
                  >
                    {/* Figure Header Bar */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-muted/35 px-5 py-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-primary px-2 py-0.5 text-[10.5px] font-mono font-bold uppercase text-white">
                            {diag.code}
                          </span>
                          <span className="rounded border border-border bg-background px-2 py-0.5 text-[10.5px] font-mono font-semibold text-muted-foreground">
                            {diag.standard}
                          </span>
                        </div>
                        <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                          {diag.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">{diag.summary}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 print:hidden">
                        <button
                          type="button"
                          onClick={() => openDiagramZoom(idx)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-ink text-white hover:bg-primary px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <ZoomIn className="h-3.5 w-3.5" />
                          <span>Zoom &amp; Pan</span>
                        </button>
                        <a
                          href={diag.src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-colors"
                          title="Open standalone SVG vector in a new tab"
                        >
                          <span>Raw SVG</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Interactive SVG Canvas Preview */}
                    <button
                      type="button"
                      onClick={() => openDiagramZoom(idx)}
                      aria-label={`Inspect ${diag.title} in interactive zoom view`}
                      className="group relative block w-full bg-white border-b border-border p-2 sm:p-4 text-left cursor-zoom-in focus-visible:outline-primary"
                    >
                      <img
                        src={diag.src}
                        alt={diag.title}
                        loading={idx < 2 ? "eager" : "lazy"}
                        className="w-full h-auto rounded-lg transition-transform duration-200 group-hover:scale-[1.004]"
                      />
                      <span className="print:hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute right-6 bottom-6 inline-flex items-center gap-1.5 rounded-full bg-zinc-950/85 text-white px-3 py-1.5 text-[11px] font-semibold shadow-md backdrop-blur-sm">
                        <ZoomIn className="h-3.5 w-3.5 text-primary" />
                        Click to Zoom &amp; Inspect
                      </span>
                    </button>

                    {/* Notation Walkthrough Notes */}
                    <figcaption className="p-5 grid gap-3 sm:grid-cols-3 bg-card">
                      {diag.bullets.map((bullet) => (
                        <div
                          key={bullet.label}
                          className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-1"
                        >
                          <div className="text-xs font-bold text-foreground">{bullet.label}</div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {bullet.detail}
                          </p>
                        </div>
                      ))}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>

            {/* SECTION 7: DATABASE DICTIONARY */}
            <section id="sec-7" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="07"
                title="Database Architecture & Complete 16-Table Data Dictionary"
                subtitle="Relational & JSONB design defined in src/db/schema.ts spanning PostgreSQL 16 (production) and embedded PGlite (zero-config dev/test)."
              />

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      "ALL",
                      "Identity & Security",
                      "Procurement & Orders",
                      "Catalog & Content",
                      "CMS & Operations",
                    ] as const
                  ).map((dom) => (
                    <button
                      key={dom}
                      type="button"
                      onClick={() => setTableDomainFilter(dom)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                        tableDomainFilter === dom
                          ? "bg-primary text-white shadow-xs"
                          : "border border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {dom === "ALL" ? `All Tables (${DATABASE_TABLES.length})` : dom}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={tableQuery}
                    onChange={(e) => setTableQuery(e.target.value)}
                    placeholder="Filter table name or column..."
                    aria-label="Filter database tables"
                    className="field h-9 pl-8 text-xs"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                <table
                  data-testid="database-dictionary-table"
                  className="w-full text-left text-xs sm:text-sm"
                >
                  <thead className="bg-muted/60 border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3 min-w-[165px]">Table Name</th>
                      <th className="p-3 w-28">PK</th>
                      <th className="p-3 min-w-[200px]">Foreign Keys (onDelete)</th>
                      <th className="p-3 min-w-[300px]">Key Columns, JSONB &amp; Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredTables.map((t) => (
                      <tr key={t.name} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3 text-center font-mono text-xs font-bold text-muted-foreground align-top">
                          {t.index}
                        </td>
                        <td className="p-3 align-top">
                          <div className="font-mono text-xs font-bold text-foreground">
                            {t.name}
                          </div>
                          <div className="text-[10.5px] text-primary font-medium mt-0.5">
                            {t.domain}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground align-top">
                          {t.primaryKey}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground align-top">
                          {t.foreignKeys}
                        </td>
                        <td className="p-3 text-xs text-muted-foreground leading-relaxed">
                          {t.purpose}
                        </td>
                      </tr>
                    ))}
                    {filteredTables.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-xs text-muted-foreground">
                          No tables match your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 8: ROUTING & ALGORITHMS */}
            <section id="sec-8" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="08"
                title="Application Routing & Engineered Subsystems"
                subtitle="Complete TanStack Router file hierarchy and four domain-specific frontend/backend engineering algorithms."
              />

              <div className="grid gap-4 md:grid-cols-3">
                {ROUTE_GROUPS.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-xl border border-border bg-card p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-foreground">{group.title}</h3>
                    </div>
                    <span className="inline-block rounded bg-secondary px-2 py-0.5 text-[10.5px] font-mono font-semibold text-primary">
                      {group.badge}
                    </span>
                    <ul className="space-y-1 text-xs font-mono text-muted-foreground">
                      {group.routes.map((r) => (
                        <li key={r} className="truncate" title={r}>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {SUBSYSTEM_ALGORITHMS.map((alg) => (
                  <div
                    key={alg.id}
                    className="rounded-xl border border-border bg-card p-5 space-y-3"
                  >
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-foreground">
                        {alg.title}
                      </h3>
                      <p className="text-[11px] font-mono text-primary mt-0.5">{alg.filePaths}</p>
                    </div>
                    <ul className="space-y-2 text-xs text-muted-foreground list-disc pl-4 leading-relaxed">
                      {alg.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 9: SECURITY MATRIX */}
            <section id="sec-9" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="09"
                title="Security Architecture & Defense-in-Depth Controls"
                subtitle="Mitigations covering credential hardening, session cookies, anti-automation rate limits, zero-trust checkout, and upload magic-byte verification."
              />

              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/60 border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3.5 min-w-[200px]">Threat Vector</th>
                      <th className="p-3.5 min-w-[300px]">Countermeasure Implemented</th>
                      <th className="p-3.5 min-w-[200px]">Source Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {SECURITY_MATRIX.map((row) => (
                      <tr key={row.vector} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-bold text-foreground align-top flex items-start gap-2">
                          <Lock className="h-3.5 w-3.5 text-primary shrink-0 mt-1" />
                          <span>{row.vector}</span>
                        </td>
                        <td className="p-3.5 text-muted-foreground leading-relaxed">
                          {row.countermeasure}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-muted-foreground align-top">
                          {row.verification}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECTION 10: QUALITY ASSURANCE */}
            <section id="sec-10" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="10"
                title="Quality Assurance, Testing & Verification Matrix"
                subtitle="Automated unit, integration, DOM behavior, API security, and Playwright Chromium browser verification coverage."
              />

              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/60 border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3.5 min-w-[240px]">Test Suite File</th>
                      <th className="p-3.5 w-24 text-center">Tests</th>
                      <th className="p-3.5 min-w-[300px]">Verified Guarantees</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {TEST_SUITES.map((suite) => (
                      <tr key={suite.file} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-mono text-xs font-semibold text-foreground align-top">
                          {suite.file}
                        </td>
                        <td className="p-3.5 text-center font-mono text-xs font-bold text-primary align-top">
                          {suite.count}
                        </td>
                        <td className="p-3.5 text-muted-foreground leading-relaxed">
                          {suite.guarantees}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/60 border-t border-border font-bold text-foreground">
                    <tr>
                      <td className="p-3.5 font-mono text-xs">
                        Total Baseline Verified Suite ({TEST_SUITES.length} Suites)
                      </td>
                      <td className="p-3.5 text-center font-mono text-xs text-emerald-700">
                        {totalTests}
                      </td>
                      <td className="p-3.5 text-xs text-emerald-700">
                        100% pass rate verified across Vitest + JSDOM + PGlite + Playwright E2E
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="rounded-xl border border-border bg-muted/25 p-5 space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p className="font-bold text-foreground">10.2 End-to-End Browser &amp; UI Audits</p>
                <p>
                  <strong className="text-foreground">Playwright E2E Suite</strong> (
                  <code className="font-mono text-xs">e2e/user-journeys.spec.ts</code>) automates
                  buyer catalog browsing, shop filtering, product detail checks, admin login, and
                  media upload persistence under Chromium. Recent live visual audits verified
                  instant upload serving across dev and Nitro production (
                  <code className="font-mono text-xs">uploads.server.ts</code>), strict removal of
                  public card prices, interactive pointer zoom without corner badge clutter, tighter
                  cart breadcrumb padding, and the single-active silent Shop Banner VideoSwitcher.
                </p>
              </div>
            </section>

            {/* SECTION 11: DEPLOYMENT & OPERATIONS RUNBOOK */}
            <section id="sec-11" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="11"
                title="Deployment, Backup, Health & Operations Runbook"
                subtitle="Three-container production orchestration (docker-compose.yml), healthchecks, and database migration/backup workflows."
              />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
                    <Database className="h-4 w-4" />
                    <span>page_postgres</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    PostgreSQL 16 Alpine (:5432)
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Persists database cluster inside the named{" "}
                    <code className="font-mono">postgres_data</code> volume and runs{" "}
                    <code className="font-mono">pg_isready</code> probes every 5s.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
                    <Server className="h-4 w-4" />
                    <span>page_app</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">Nitro Node 22 SSR (:8080)</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Synchronizes schema &amp; seed on startup before launching{" "}
                    <code className="font-mono">.output/server/index.mjs</code>. Polls{" "}
                    <code className="font-mono">/api/health</code> every 20s.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    <span>page_caddy</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Caddy 2 Edge Proxy (:80/:443)
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Automates ACME TLS certificates, caches immutable hashed/uploaded assets, adds
                    hardening headers, and reverse-proxies SSR traffic to{" "}
                    <code className="font-mono">app:8080</code>.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-muted/60 border-b border-border text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3.5 min-w-[170px]">Operation</th>
                      <th className="p-3.5 min-w-[230px]">Command / Endpoint</th>
                      <th className="p-3.5 min-w-[280px]">Operational Effect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {OPERATIONS_COMMANDS.map((cmd) => (
                      <tr key={cmd.operation} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-bold text-foreground align-top">
                          {cmd.operation}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-primary align-top">
                          <span className="inline-flex items-center gap-1.5">
                            <Terminal className="h-3.5 w-3.5 shrink-0" />
                            <span>{cmd.command}</span>
                          </span>
                        </td>
                        <td className="p-3.5 text-muted-foreground leading-relaxed">
                          {cmd.effect}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                <strong className="font-bold">Disaster Recovery Note:</strong> While{" "}
                <code className="font-mono text-xs">npm run db:backup</code> snapshots 12 core
                business/CMS tables portably as JSON across PGlite and PostgreSQL, production
                disaster recovery should complement JSON backups with scheduled{" "}
                <code className="font-mono text-xs">pg_dump</code> (preserving{" "}
                <code className="font-mono text-xs">email_log</code> and{" "}
                <code className="font-mono text-xs">audit_log</code>) plus snapshots of the{" "}
                <code className="font-mono text-xs">uploads_data</code> volume.
              </div>
            </section>

            {/* SECTION 12: ROADMAP */}
            <section id="sec-12" className="scroll-mt-24 space-y-6">
              <SectionHeading
                number="12"
                title="Known Boundaries & Future Engineering Roadmap"
                subtitle="Planned evolutionary steps for horizontal multi-instance scaling, object storage offloading, and VAT Pro-Forma PDF exports."
              />

              <div className="grid gap-4 md:grid-cols-3">
                {ROADMAP_ITEMS.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-5 space-y-2"
                  >
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </div>
      </div>

      {/* Interactive Reused Zoom Lightbox for All 10 Vector Diagrams */}
      <ProductImageZoomModal
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        productName={activeDiagram?.title ?? "Engineering Architecture Diagram"}
        brand={activeDiagram?.standard}
        images={diagramGallery}
        activeIndex={activeDiagramIndex}
        onActiveIndexChange={setActiveDiagramIndex}
      />
    </div>
  );
}
