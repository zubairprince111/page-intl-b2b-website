import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  FileText,
  Scale,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Clock,
  Wrench,
  Truck,
  Building2,
  Mail,
  Phone,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export type PolicyTab = "privacy" | "terms" | "warranty";

interface LegalPoliciesProps {
  initialTab?: PolicyTab;
}

export function LegalPolicies({ initialTab = "privacy" }: LegalPoliciesProps) {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);
  const [copied, setCopied] = useState(false);

  // Synchronize with URL hash changes (#privacy-policy, #commercial-terms, #warranty-policy)
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("privacy")) {
        setActiveTab("privacy");
      } else if (hash.includes("term") || hash.includes("commercial")) {
        setActiveTab("terms");
      } else if (hash.includes("warrant") || hash.includes("service")) {
        setActiveTab("warranty");
      }
    };

    parseHash();
    window.addEventListener("hashchange", parseHash);
    return () => window.removeEventListener("hashchange", parseHash);
  }, []);

  const handleTabChange = (val: string) => {
    const tab = val as PolicyTab;
    setActiveTab(tab);
    const hashMap: Record<PolicyTab, string> = {
      privacy: "#privacy-policy",
      terms: "#commercial-terms",
      warranty: "#warranty-policy",
    };
    if (window.history.pushState) {
      window.history.pushState(null, "", hashMap[tab]);
    } else {
      window.location.hash = hashMap[tab];
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="legal-policies" className="scroll-mt-24">
      {/* Header and Quick Switcher Bar */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
            <Scale className="h-3.5 w-3.5" />
            Commercial Governance & Compliance
          </div>
          <h2 className="display-sm mt-2 text-foreground font-display uppercase tracking-tight">
            Official Policies & Commercial Terms
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Legally binding B2B framework governing equipment supply, zero-password RFQ data
            protection, and official manufacturer warranty servicing across Bangladesh.
          </p>
        </div>

        {/* Quick Utility Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm"
            title="Copy direct link to this policy"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Policy Link</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shadow-sm"
            title="Print or Save as PDF"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Tabs Container */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-8">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto p-1.5 bg-muted/70 rounded-xl gap-1.5 border border-border">
          <TabsTrigger
            value="privacy"
            id="privacy-policy"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all"
          >
            <Lock className="h-4 w-4 text-primary" />
            <span>Privacy Policy</span>
          </TabsTrigger>
          <TabsTrigger
            value="terms"
            id="commercial-terms"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all"
          >
            <FileText className="h-4 w-4 text-primary" />
            <span>Commercial Terms of Supply</span>
          </TabsTrigger>
          <TabsTrigger
            value="warranty"
            id="warranty-policy"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Equipment Warranty Policy</span>
          </TabsTrigger>
        </TabsList>

        {/* ========================================================= */}
        {/* TAB 1: PRIVACY POLICY */}
        {/* ========================================================= */}
        <TabsContent value="privacy" className="mt-6 focus-visible:outline-none">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-8">
            {/* Document Header */}
            <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">
                  Corporate Governance Document — REF: PAGE-LEG-PRIV-2026
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-foreground mt-1">
                  Privacy Policy & B2B Data Protection
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Effective Date: January 1, 2026 • Applicable Jurisdiction: People's Republic of
                  Bangladesh
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                >
                  Zero-Password Quotations
                </Badge>
                <Badge variant="outline" className="border-sky-500/30 text-sky-600 bg-sky-500/10">
                  Email OTP Verification
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-500/30 text-zinc-600 dark:text-zinc-300"
                >
                  ICT Act 2006 Compliant
                </Badge>
              </div>
            </div>

            {/* Core Principle Callout */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
                  Zero-Password & Account-Free Quotation Policy
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  PAGE International Ltd. operates under a strict principle of procurement
                  efficiency. Workshops, engineers, and fleet managers are{" "}
                  <strong>
                    never required to create a persistent account or remember a password
                  </strong>{" "}
                  to request commercial price quotations or receive pro-forma tax invoices. We
                  verify procurement requests exclusively through ephemeral 6-digit Email One-Time
                  Passwords (OTPs) valid for 10 minutes.
                </p>
              </div>
            </div>

            {/* Document Body Sections */}
            <div className="space-y-6 text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {/* Section 1 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">1.0</span> Scope & Operator
                  Identity
                </h4>
                <p className="text-muted-foreground">
                  This Privacy Policy applies to all digital interactions, quotation desks,
                  consultation scheduling systems, and customer portal services operated by{" "}
                  <strong>PAGE International Ltd.</strong> ("PAGE", "we", "us", or "our"),
                  incorporated and registered under the trade licensing laws of Dhaka, Bangladesh,
                  with corporate offices in Tejgaon Industrial Area, Dhaka-1208. This policy governs
                  how we collect, process, safeguard, and disclose corporate procurement information
                  across Bangladesh.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">2.0</span> Information We
                  Collect
                </h4>
                <p className="text-muted-foreground">
                  We collect strictly the minimum business data necessary to fulfill commercial
                  equipment inquiries, generate compliant tax invoices, and dispatch field service
                  engineers:
                </p>
                <div className="grid gap-3 sm:grid-cols-2 pt-1">
                  <div className="rounded-lg border border-border p-3.5 bg-secondary/30">
                    <h5 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-primary" /> Commercial Procurement Data
                    </h5>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                      <li>Registered Workshop or Enterprise Company Name</li>
                      <li>Procurement Officer / Workshop Manager Name</li>
                      <li>Official Corporate Email Address (for quotation dispatch & OTP)</li>
                      <li>Bangladeshi Telephone Number (+880 mobile or landline)</li>
                      <li>Delivery Administrative Division and Workshop Address</li>
                      <li>Technical specifications (ceiling clearance, power phase, bay layout)</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-border p-3.5 bg-secondary/30">
                    <h5 className="font-bold text-foreground text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Wrench className="h-3.5 w-3.5 text-primary" /> Engineering & Booking Data
                    </h5>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                      <li>Requested consultation date and demonstration location</li>
                      <li>
                        Vehicle mobility category (4-Wheeler, 2-Wheeler, 3-Wheeler, or EV/Hybrid)
                      </li>
                      <li>Equipment maintenance history and machine serial numbers</li>
                      <li>Workshop site audit notes and concrete slab specifications</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">3.0</span> Purpose & Legal
                  Basis of Processing
                </h4>
                <p className="text-muted-foreground">
                  Your business contact and equipment requirements are utilized exclusively for
                  legitimate B2B commercial purposes:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-xs sm:text-sm">
                  <li>
                    <strong>Commercial Price Quotations:</strong> Generating formal itemized
                    pro-forma invoices, volume discount structures, and delivery lead times.
                  </li>
                  <li>
                    <strong>Pre-Installation Assessments:</strong> Reviewing workshop electrical
                    capacity (380V 3-phase / 220V single-phase) and floor chemical anchor
                    specifications.
                  </li>
                  <li>
                    <strong>Warranty & Commissioning Records:</strong> Registering serial numbers
                    for lifting machinery, compressors, and EV diagnostic tools for warranty
                    tracking.
                  </li>
                  <li>
                    <strong>Direct Technical Support:</strong> Responding to emergency breakdown
                    calls via WhatsApp, phone, or on-site engineer dispatch.
                  </li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">4.0</span> Non-Disclosure &
                  Zero-Resale Guarantee
                </h4>
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-muted-foreground">
                  <p className="font-semibold text-foreground mb-1">
                    We never monetize, broker, or sell your commercial data.
                  </p>
                  <p className="text-xs">
                    PAGE International Ltd. does not sell, license, or rent workshop contact lists,
                    quotation archives, or customer procurement histories to advertising networks or
                    third-party marketing agencies. Your procurement requirements remain strictly
                    confidential between your enterprise and PAGE.
                  </p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">5.0</span> Authorized
                  Third-Party Disclosures
                </h4>
                <p className="text-muted-foreground">
                  Data disclosure is restricted strictly to authorized operational partners
                  necessary to fulfill your order:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-xs sm:text-sm">
                  <li>
                    <strong>Logistics & Freight Carriers:</strong> Licensed transport companies
                    delivering heavy equipment from Chittagong port / Tejgaon warehouse to your
                    workshop location.
                  </li>
                  <li>
                    <strong>Certified Field Engineers:</strong> Authorized technical staff
                    dispatched to perform foundation anchoring, hydraulic calibration, and operator
                    handover.
                  </li>
                  <li>
                    <strong>Statutory Regulatory Bodies:</strong> National Board of Revenue (NBR)
                    for statutory VAT (Mushak 6.3) audit trails or where required by Bangladesh
                    court summons.
                  </li>
                </ul>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">6.0</span> Data Security,
                  Encryption & Retention
                </h4>
                <p className="text-muted-foreground">
                  All digital communication is protected using TLS 1.3 encryption in transit.
                  Databases are hosted in secured, firewall-protected environments with role-based
                  access control (RBAC). Administrative access is restricted to verified personnel
                  with multi-factor authentication. Inactive quotation requests are archived in
                  compliance with Bangladesh statutory commercial record retention guidelines
                  (minimum 5 years for tax audit purposes).
                </p>
              </div>

              {/* Section 7 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">7.0</span> Your Rights &
                  Compliance Contact
                </h4>
                <p className="text-muted-foreground">
                  Under the Bangladesh Information and Communication Technology (ICT) Act 2006 and
                  applicable corporate data protection standards, your workshop retains the right to
                  inspect, correct, or request deletion of outdated commercial contact details.
                </p>
                <div className="mt-3 rounded-lg border border-border p-4 bg-secondary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-foreground block">
                      Compliance & Data Protection Desk
                    </span>
                    <span className="text-muted-foreground">
                      PAGE International Ltd., Tejgaon Industrial Area, Dhaka-1208, Bangladesh
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href="mailto:privacy@page-intl.com"
                      className="text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <Mail className="h-3.5 w-3.5" /> privacy@page-intl.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 2: COMMERCIAL TERMS OF SUPPLY */}
        {/* ========================================================= */}
        <TabsContent value="terms" className="mt-6 focus-visible:outline-none">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-8">
            {/* Document Header */}
            <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">
                  Commercial Procurement Framework — REF: PAGE-LEG-SUPPLY-2026
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-foreground mt-1">
                  Commercial Terms of Supply
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Standard B2B Terms Governing Wholesale Equipment Sales, Indent Supply & Turnkey
                  Workshop Projects
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                  Mushak 6.3 VAT
                </Badge>
                <Badge
                  variant="outline"
                  className="border-amber-500/30 text-amber-600 bg-amber-500/10"
                >
                  Pro-Forma Validity 14–30 Days
                </Badge>
                <Badge
                  variant="outline"
                  className="border-zinc-500/30 text-zinc-600 dark:text-zinc-300"
                >
                  NBR Certified Invoicing
                </Badge>
              </div>
            </div>

            {/* Terms Summary Cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border p-4 bg-secondary/30">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2 font-mono font-bold text-xs">
                  01
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Pro-Forma Validity
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Firm for 14 to 30 calendar days from issue date. Subject to international freight
                  and exchange rates.
                </p>
              </div>

              <div className="rounded-xl border border-border p-4 bg-secondary/30">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2 font-mono font-bold text-xs">
                  02
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Statutory Taxes & VAT
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Mushak 6.3 VAT (15%) and applicable AIT clearly itemized on every official tax
                  invoice.
                </p>
              </div>

              <div className="rounded-xl border border-border p-4 bg-secondary/30">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2 font-mono font-bold text-xs">
                  03
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Certified Installation
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Chemical foundation anchoring and 4-hour operator training delivered by PAGE
                  engineers.
                </p>
              </div>
            </div>

            {/* Document Body Sections */}
            <div className="space-y-6 text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {/* Section 1 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">1.0</span> Contract Formation &
                  Quotation Binding
                </h4>
                <p className="text-muted-foreground">
                  All price estimates, digital cart summaries, and catalog listings published by
                  PAGE International Ltd. represent commercial invitations to negotiate. An official
                  commercial contract becomes effective only upon:
                </p>
                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground text-xs sm:text-sm">
                  <li>
                    Issuance of an official PAGE Pro-Forma Invoice signed by an authorized
                    commercial officer.
                  </li>
                  <li>
                    Receipt of the customer's formal Purchase Order (PO) or signed pro-forma
                    acceptance.
                  </li>
                  <li>
                    Confirmation of the designated advance commitment deposit in PAGE's commercial
                    bank account.
                  </li>
                </ol>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">2.0</span> Quotation Validity &
                  Currency
                </h4>
                <p className="text-muted-foreground">
                  Unless expressly stipulated otherwise on the face of the pro-forma invoice, all
                  commercial prices remain valid for{" "}
                  <strong>fourteen (14) to thirty (30) calendar days</strong> from the date of
                  dispatch. PAGE reserves the right to revise unaccepted quotations in the event of
                  severe foreign exchange fluctuations (USD/BDT), international shipping fuel
                  surcharges, or statutory customs tariff adjustments implemented by the National
                  Board of Revenue (NBR). Domestic sales are billed and settled in Bangladeshi Taka
                  (BDT).
                </p>
              </div>

              {/* Section 3: Payment Milestones Table */}
              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">3.0</span> Payment Schedules &
                  Milestones
                </h4>
                <p className="text-muted-foreground">
                  Standard commercial equipment procurement follows the milestone structures
                  outlined below:
                </p>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/80 text-foreground font-bold uppercase tracking-wider border-b border-border">
                      <tr>
                        <th className="p-3">Procurement Category</th>
                        <th className="p-3">Advance Deposit</th>
                        <th className="p-3">Interim Milestone</th>
                        <th className="p-3">Commissioning Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-muted-foreground">
                      <tr className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          Ready Stock Machinery (Dhaka/Chittagong)
                        </td>
                        <td className="p-3">50% on Order Confirmation</td>
                        <td className="p-3">50% prior to warehouse vehicle loading</td>
                        <td className="p-3 font-mono text-emerald-600">
                          0% (Cleared prior to transit)
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          Factory Indent / Special Imports
                        </td>
                        <td className="p-3">30% on PO Confirmation</td>
                        <td className="p-3">50% on Chittagong Port vessel arrival</td>
                        <td className="p-3 font-mono text-emerald-600">
                          20% post-commissioning handover
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          Fleet Spare Parts Replenishment
                        </td>
                        <td className="p-3">100% or 30-Day Credit (Approved Accounts)</td>
                        <td className="p-3">—</td>
                        <td className="p-3 font-mono">Net 30 Days from delivery challan</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  * Payments must be made via Account Payee Cheque, BEFTN, or RTGS corporate bank
                  transfer to PAGE International Ltd. Field engineers are strictly prohibited from
                  accepting cash payments without an official holographic cash receipt.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">4.0</span> Delivery, Unloading
                  & Workshop Site Readiness
                </h4>
                <div className="space-y-2 text-muted-foreground">
                  <p>
                    <strong>Delivery Location:</strong> Deliveries are executed curbside to the
                    workshop facility address agreed upon in the purchase agreement across all 8
                    administrative divisions of Bangladesh.
                  </p>
                  <p>
                    <strong>Unloading & Heavy Rigging:</strong> Due to heavy machine weights (650kg
                    to 2,500kg for vehicle lifts and screw compressors), customer workshops are
                    responsible for providing forklift unloading, gantry cranes, or labor rigging at
                    their facility unless turnkey offloading services were explicitly contracted
                    with PAGE.
                  </p>
                  <p>
                    <strong>Foundation & Power Requirements:</strong> Prior to engineer dispatch for
                    installation, the buyer warrants that the facility meets the following mandatory
                    engineering standards:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li>
                      Minimum 150mm–200mm depth reinforced concrete floor (C25/C30 grade, minimum
                      28-day cure).
                    </li>
                    <li>
                      Stable 3-Phase (380V/415V, 50Hz) or Single-Phase (220V, 50Hz) power with
                      dedicated motor circuit breakers.
                    </li>
                    <li>
                      Dry, indoor environment with overhead ceiling clearance compliant with machine
                      lift travel.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">5.0</span> Commissioning,
                  Handover & Training
                </h4>
                <p className="text-muted-foreground">
                  For all automotive lifts, wheel balancers, tyre changers, and compressors, PAGE
                  certified engineers conduct on-site assembly, chemical wedge anchoring, hydraulic
                  pressure synchronization, and limit-switch calibration. Upon successful
                  load-testing, the engineer delivers up to four (4) hours of operational and safety
                  training to the workshop technicians. The handover is certified via a
                  countersigned <strong>Commissioning & Acceptance Certificate</strong>, which
                  officially initiates the warranty clock.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">6.0</span> Title, Risk of Loss
                  & Inspection Notice
                </h4>
                <p className="text-muted-foreground">
                  <strong>Risk of Loss:</strong> All risk of accidental physical loss,
                  deterioration, or transport damage transfers to the buyer immediately upon
                  physical unloading of the machinery at the buyer's premises.
                </p>
                <p className="text-muted-foreground">
                  <strong>Retention of Title:</strong> Full legal title and proprietary ownership of
                  all machinery, components, and diagnostic tools remain exclusively with PAGE
                  International Ltd. until 100% of the invoice balance has been cleared in bank
                  funds. PAGE reserves the legal right of repossession in the event of default on
                  payment obligations.
                </p>
                <p className="text-muted-foreground">
                  <strong>Inspection Period:</strong> The customer must inspect goods upon delivery
                  and record any transit damage or discrepancies on the delivery challan within{" "}
                  <strong>forty-eight (48) hours</strong>.
                </p>
              </div>

              {/* Section 7 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">7.0</span> Order Cancellation &
                  Restocking Fee
                </h4>
                <p className="text-muted-foreground">
                  Custom-indented equipment or foundation-tailored machinery cannot be cancelled or
                  returned once international production or maritime freight has been initiated.
                  In-stock machinery cancelled prior to delivery dispatch is subject to a{" "}
                  <strong>15% administrative and restocking fee</strong> to cover warehouse
                  preparation and inspection costs.
                </p>
              </div>

              {/* Section 8 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">8.0</span> Governing Law &
                  Arbitration
                </h4>
                <p className="text-muted-foreground">
                  These Commercial Terms of Supply are governed and construed in accordance with the
                  laws of the <strong>People's Republic of Bangladesh</strong>. Any disputes arising
                  in connection with commercial supply agreements shall be resolved amicably,
                  failing which they shall be referred to arbitration in Dhaka under the Arbitration
                  Act 2001 of Bangladesh.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================= */}
        {/* TAB 3: EQUIPMENT WARRANTY POLICY */}
        {/* ========================================================= */}
        <TabsContent value="warranty" className="mt-6 focus-visible:outline-none">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-10 shadow-sm space-y-8">
            {/* Document Header */}
            <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-bold">
                  After-Sales Service Standard — REF: PAGE-LEG-WARR-2026
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-foreground mt-1">
                  Equipment Warranty & Service Policy
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Official Warranty Coverage Schedules, Exclusions, SLA Commitments & Claim
                  Procedures
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                >
                  18 to 36 Months Warranty
                </Badge>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                  Tejgaon Spares Inventory
                </Badge>
                <Badge variant="outline" className="border-sky-500/30 text-sky-600 bg-sky-500/10">
                  Dhaka 4–8 Hour SLA
                </Badge>
              </div>
            </div>

            {/* Quick SLA Banner */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border p-4 bg-secondary/30 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Dhaka Division SLA
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Certified engineer on-site within <strong>4–8 business hours</strong> of
                    registered emergency breakdown.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-secondary/30 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-sky-500/10 text-sky-600 flex items-center justify-center shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Regional Hubs SLA
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Chittagong, Comilla & Sylhet field dispatch within{" "}
                    <strong>12–24 business hours</strong>.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 bg-secondary/30 flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Wrench className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Buffer Spares Stock
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    BDT 50M+ ready replacement seals, valves, and motors stored in Tejgaon
                    warehouse.
                  </p>
                </div>
              </div>
            </div>

            {/* Document Body Sections */}
            <div className="space-y-6 text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {/* Section 1: Detailed Warranty Table */}
              <div className="space-y-3">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">1.0</span> Equipment Warranty
                  Tenures by Category
                </h4>
                <p className="text-muted-foreground">
                  PAGE International Ltd. provides official manufacturer-backed commercial
                  warranties covering material defects, structural engineering, and component
                  failure as defined below:
                </p>

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/80 text-foreground font-bold uppercase tracking-wider border-b border-border">
                      <tr>
                        <th className="p-3">Equipment Category</th>
                        <th className="p-3">Covered Assemblies</th>
                        <th className="p-3">Warranty Tenure</th>
                        <th className="p-3">Included Support</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-muted-foreground">
                      <tr className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          Hydraulic Vehicle Lifts (2-Post, 4-Post, Scissor)
                        </td>
                        <td className="p-3">
                          Structural steel columns, carriages & lift arms
                          <br />
                          Hydraulic cylinders, pump units & electric motors
                          <br />
                          Equalization cables, pulleys & mechanical safety locks
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600">
                          36 Months (Steel)
                          <br />
                          24 Months (Hydraulics)
                          <br />
                          12 Months (Cables)
                        </td>
                        <td className="p-3">
                          On-site engineer labor, chemical re-torque, safety calibration
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          Tyre Changers & Digital Wheel Balancers
                        </td>
                        <td className="p-3">
                          Turntable motor, reduction gearbox & optical encoder PCB
                          <br />
                          Pneumatic bead-breaker cylinder & clamping valves
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600">
                          24 Months (Electronics & Motor)
                          <br />
                          12 Months (Pneumatics)
                        </td>
                        <td className="p-3">
                          Calibration certification, board swaps, pedal linkage repairs
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          Rotary Screw Air Compressors
                        </td>
                        <td className="p-3">
                          Airend screw rotor assembly
                          <br />
                          Three-phase electric motor, inverter drive & PLC controller
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600">
                          36 Months (Airend)
                          <br />
                          24 Months (Motor & PLC)
                        </td>
                        <td className="p-3">Oil pressure tuning, temperature sensor replacement</td>
                      </tr>

                      <tr className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          EV & Hybrid Diagnostic Bays
                        </td>
                        <td className="p-3">
                          SmartSafe battery charge/discharge balancers & insulation meters
                          <br />
                          Cloud software subscription & vehicle database updates
                          <br />
                          1,000V VDE insulated hand tool forging steel
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600">
                          24 Months (Hardware)
                          <br />
                          24 Months (Free Cloud)
                          <br />
                          Lifetime (VDE Steel)
                        </td>
                        <td className="p-3">
                          Firmware flashing, battery safety testing, voltage calibration
                        </td>
                      </tr>

                      <tr className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          Commercial OEM Spare Parts
                        </td>
                        <td className="p-3">
                          Heavy-duty ceramic brake pads, suspension bushings, pumps
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-600">
                          12 Months / 20,000 km
                        </td>
                        <td className="p-3">Immediate factory defect replacement</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">2.0</span> Mandatory Conditions
                  for Warranty Validity
                </h4>
                <p className="text-muted-foreground">
                  To ensure maximum technician safety and longevity of high-pressure machinery,
                  warranty validity is strictly conditional upon:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground text-xs sm:text-sm">
                  <li>
                    <strong>PAGE Certified Installation:</strong> Equipment must be assembled,
                    chemically anchored, and commissioned by authorized PAGE engineers or under
                    written technical supervision. Self-installation of 2-post and 4-post lifts
                    voids structural and hydraulic coverage.
                  </li>
                  <li>
                    <strong>Approved Operating Fluids:</strong> Hydraulic systems must utilize
                    exclusively ISO VG-46 or ISO VG-32 anti-wear hydraulic oil. Screw compressors
                    must use authorized synthetic rotary lubricant.
                  </li>
                  <li>
                    <strong>Electrical Surge & Phase Protection:</strong> Workshops must connect
                    equipment through functional 3-phase motor circuit breakers and
                    phase-sequence/voltage protection relays.
                  </li>
                  <li>
                    <strong>Maintenance Log:</strong> Maintenance personnel must maintain a
                    documented log verifying periodic lubrication, cable tension checks, and
                    moisture drainage.
                  </li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">3.0</span> Warranty Exclusions
                  & Limitations
                </h4>
                <div className="rounded-xl border border-border p-4 bg-secondary/30 space-y-2">
                  <p className="font-semibold text-foreground text-xs uppercase tracking-wider">
                    The warranty does not cover:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                    <li>
                      <strong>Consumable & Normal Wear Parts:</strong> Rubber arm pads, plastic
                      mounting head protectors, balancer clamping cones, air filters, oil filters,
                      separator elements, fuses, and indicator lamps.
                    </li>
                    <li>
                      <strong>Gross Weight Overloading:</strong> Damage resulting from exceeding
                      certified Safe Working Load (e.g. attempting to lift a 6.0T commercial truck
                      on a 4.0T passenger car lift).
                    </li>
                    <li>
                      <strong>Power Surge & Lightning Damage:</strong> Burnouts caused by utility
                      grid voltage spikes, phase loss, or lightning strikes where external surge
                      arrestors were absent.
                    </li>
                    <li>
                      <strong>Unauthorized Modifications:</strong> Unapproved alteration of
                      hydraulic pressure relief valves, structural drilling, or wiring bypasses.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">4.0</span> Warranty Claim
                  Protocol (Step-by-Step)
                </h4>
                <div className="grid gap-3 sm:grid-cols-3 pt-1">
                  <div className="rounded-lg border border-border p-3.5 bg-card">
                    <span className="text-primary font-mono font-bold text-xs">STEP 01</span>
                    <h5 className="font-bold text-foreground text-xs uppercase mt-1">
                      Ticket Submission
                    </h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Call our hotline (+880 9612-724346) or WhatsApp service desk (+880
                      1700-000000) with your Machine Serial Number and brief video/photo of the
                      symptom.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-3.5 bg-card">
                    <span className="text-primary font-mono font-bold text-xs">STEP 02</span>
                    <h5 className="font-bold text-foreground text-xs uppercase mt-1">
                      Remote Diagnostic
                    </h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      A senior applications engineer reviews telemetry within 60 minutes to
                      determine if hydraulic adjustment, electrical reset, or on-site replacement is
                      required.
                    </p>
                  </div>

                  <div className="rounded-lg border border-border p-3.5 bg-card">
                    <span className="text-primary font-mono font-bold text-xs">STEP 03</span>
                    <h5 className="font-bold text-foreground text-xs uppercase mt-1">
                      On-Site Dispatch
                    </h5>
                    <p className="text-xs text-muted-foreground mt-1">
                      Certified field engineer arrives on-site with genuine replacement parts drawn
                      from our Tejgaon buffer stock, executes repair, and re-certifies safe
                      operation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold uppercase tracking-wide text-foreground flex items-center gap-2">
                  <span className="text-primary font-mono font-bold">5.0</span> Emergency Breakdown
                  Contacts
                </h4>
                <div className="rounded-xl border border-border p-4 bg-secondary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-bold text-foreground block text-sm">
                      PAGE Central Engineering Service Desk
                    </span>
                    <span className="text-muted-foreground">
                      Tejgaon Industrial Area, Dhaka-1208 • Operating Saturday–Thursday 8:00 AM –
                      8:00 PM (Emergency Standby on Fridays)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href="tel:+8809612724346"
                      className="btn btn-primary h-8 px-3 text-xs font-bold uppercase"
                    >
                      <Phone className="h-3 w-3 mr-1" /> Call Service Hotline
                    </a>
                    <a
                      href="mailto:service@page-intl.com"
                      className="btn btn-outline h-8 px-3 text-xs font-bold uppercase"
                    >
                      <Mail className="h-3 w-3 mr-1" /> service@page-intl.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
