import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Commercial Terms of Supply — PAGE International" },
      {
        name: "description",
        content:
          "Official B2B Commercial Terms of Supply for workshop machinery, pro-forma invoicing, payment milestones, delivery, and commissioning by PAGE International Ltd.",
      },
      { property: "og:title", content: "Commercial Terms of Supply — PAGE International" },
      {
        property: "og:description",
        content:
          "Standard commercial framework for garage equipment, pro-forma validity, Mushak 6.3 VAT, and on-site commissioning across Bangladesh.",
      },
    ],
  }),
  component: TermsPage,
});

export function TermsPage() {
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
            <FileText className="h-3.5 w-3.5" />
            <span>Commercial Framework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display uppercase tracking-tight text-foreground">
            Commercial Terms of Supply
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            PAGE International Ltd. • Standard B2B Terms • Dhaka, Bangladesh
          </p>
        </div>

        {/* Minimal Highlight Box */}
        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-xs sm:text-sm text-foreground/90">
          <p className="font-semibold text-foreground mb-1">B2B Commercial Framework Summary</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All equipment supplies, pro-forma invoices, and workshop machinery orders are subject to
            standard commercial terms: 14–30 day pro-forma validity, statutory Mushak 6.3 VAT (15%),
            and mandatory PAGE certified on-site commissioning.
          </p>
        </div>

        {/* Minimal Body Content */}
        <div className="mt-8 space-y-6 text-xs sm:text-sm text-foreground/90 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              1. Contract Formation & Quotation Binding
            </h2>
            <p className="text-muted-foreground">
              Catalog pricing and digital cart requests represent invitations to treat. A legally
              binding supply agreement is established only upon:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Issuance of an official PAGE Pro-Forma Invoice.</li>
              <li>Receipt of the customer’s signed Purchase Order (PO) or written acceptance.</li>
              <li>Receipt of the designated advance commitment deposit in PAGE’s bank account.</li>
            </ol>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              2. Quotation Validity & Pricing
            </h2>
            <p className="text-muted-foreground">
              Unless explicitly specified otherwise on the pro-forma invoice, quotation prices
              remain firm for <strong>fourteen (14) to thirty (30) calendar days</strong> from the
              date of dispatch. Due to international sea freight indices, customs tariffs, and
              exchange rate fluctuations, unaccepted quotations are subject to revision thereafter.
              Domestic contracts are billed in Bangladeshi Taka (BDT).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              3. Statutory Taxes & VAT
            </h2>
            <p className="text-muted-foreground">
              All commercial transactions comply with National Board of Revenue (NBR) regulations.
              Official invoices clearly itemize <strong>Mushak 6.3 VAT (15%)</strong> and applicable
              Advance Income Tax (AIT). PAGE provides an official Mushak 6.3 tax challan upon goods
              delivery.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              4. Payment Schedules & Milestones
            </h2>
            <p className="text-muted-foreground">
              Standard commercial orders adhere to the following milestone schedules:
            </p>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/70 text-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="p-3">Order Type</th>
                    <th className="p-3">Advance</th>
                    <th className="p-3">Interim</th>
                    <th className="p-3">Final Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted-foreground">
                  <tr>
                    <td className="p-3 font-medium text-foreground">Ready-Stock Machinery</td>
                    <td className="p-3">50% on Confirmation</td>
                    <td className="p-3">50% prior to dispatch</td>
                    <td className="p-3 font-mono">0% (Pre-transit)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Factory Indent / Import</td>
                    <td className="p-3">30% on PO</td>
                    <td className="p-3">50% upon port arrival</td>
                    <td className="p-3 font-mono">20% post-commissioning</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-foreground">Fleet Spares Replenishment</td>
                    <td className="p-3">100% or Credit</td>
                    <td className="p-3">—</td>
                    <td className="p-3 font-mono">Net 30 Days (Approved)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              * Payments must be made via Corporate Account Payee Cheque, BEFTN, or RTGS bank
              transfer to PAGE International Ltd.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              5. Delivery & Workshop Site Readiness
            </h2>
            <p className="text-muted-foreground">
              <strong>Delivery Point:</strong> Deliveries are curbside to the workshop facility
              address specified on the pro-forma invoice.
            </p>
            <p className="text-muted-foreground">
              <strong>Unloading:</strong> Because workshop lifts and compressors weigh between 650kg
              and 2,500kg, the client workshop is responsible for arranging forklift or overhead
              rigging unless turnkey unloading was contracted in writing.
            </p>
            <p className="text-muted-foreground">
              <strong>Civil & Electrical Prerequisites:</strong> Prior to engineer dispatch, the
              facility must ensure:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Reinforced concrete slab of minimum 150mm–200mm thickness (C25/C30 rating).</li>
              <li>Dedicated 3-Phase (380V/415V) or Single-Phase (220V) electrical connection.</li>
              <li>Adequate ceiling height and dry, covered operating bay.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              6. Commissioning & Operator Handover
            </h2>
            <p className="text-muted-foreground">
              PAGE certified engineers carry out anchor drilling, hydraulic pressure
              synchronization, safety latch leveling, and load testing. Upon completion, PAGE
              provides up to 4 hours of technician safety training. The customer and PAGE engineer
              sign the
              <strong>Commissioning & Acceptance Certificate</strong>, which activates warranty
              coverage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              7. Title, Risk of Loss & Inspection
            </h2>
            <p className="text-muted-foreground">
              Risk of loss transfers to the buyer upon physical arrival and unloading at the
              customer facility. Full legal title remains with PAGE International Ltd. until 100% of
              the invoice balance has cleared. Any transit damage or missing parts must be recorded
              on the delivery challan within <strong>forty-eight (48) hours</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              8. Cancellations & Governing Law
            </h2>
            <p className="text-muted-foreground">
              Custom-indented machinery cannot be cancelled once international maritime shipment has
              commenced. In-stock machinery cancelled prior to dispatch is subject to a 15%
              restocking and warehouse fee.
            </p>
            <p className="text-muted-foreground">
              These terms are governed by the laws of the{" "}
              <strong>People’s Republic of Bangladesh</strong>. Unresolved disputes shall be
              referred to arbitration in Dhaka under the Arbitration Act 2001.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
