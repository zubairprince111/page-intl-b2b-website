import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  Mail,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useCreateQuote } from "@/lib/data-client";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Quotation Cart (RFQ) — PAGE International" },
      {
        name: "description",
        content:
          "Review your selected automotive parts and garage equipment to request official commercial quotations and pro-forma invoices.",
      },
      { property: "og:title", content: "Quotation Cart — PAGE International" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Cart,
});

export function Cart() {
  const { lines, setQty, remove, clear, isLoaded } = useCart();
  const createQuoteMutation = useCreateQuote();
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    city: "Dhaka",
    notes: "",
  });

  const totalUnits = lines.reduce((acc, l) => acc + l.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.phone) return;

    // Save all cart items into ONE single consolidated quotation request in PostgreSQL
    try {
      if (lines.length > 0) {
        const firstLine = lines[0];
        const productSummary =
          lines.length === 1 && firstLine
            ? `${firstLine.qty}x ${firstLine.product.name}`
            : `${lines.length} Products: ${lines.map((l) => `${l.qty}x ${l.product.name}`).join(", ")}`;

        const res = await createQuoteMutation.mutateAsync({
          companyName: formData.companyName,
          contactName: formData.contactName || formData.companyName,
          phone: formData.phone,
          email: formData.email || "client@workshop.bd",
          productSlug: firstLine ? firstLine.product.slug : "",
          productName: productSummary,
          qty: totalUnits,
          items: lines.map((l) => ({
            productSlug: l.product.slug,
            productName: l.product.name,
            qty: l.qty,
            unitPrice: l.product.price,
          })),
          businessType: "Cart Multi-Item Order",
          city: formData.city || "Dhaka",
          notes: formData.notes
            ? `${formData.notes} [Cart Request]`
            : `Quotation Cart Request (${lines.length} products, ${totalUnits} total units)`,
        });

        if (res.quoteNumber) {
          setRefId(res.quoteNumber);
        }
      }
    } catch (err) {
      console.error("Failed to add quotation from cart:", err);
    }

    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    clear();
  };

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
          <Link to="/shop" className="hover:text-foreground">
            Shop
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Quotation Cart (RFQ)</span>
        </nav>
      </div>

      <div className="container-page py-8 lg:py-12">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-border pb-4 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                B2B Procurement Request
              </span>
            </div>
            <h1 className="display-lg text-foreground font-bold mt-1">Commercial Quotation Cart</h1>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full w-fit">
            {lines.length} {lines.length === 1 ? "Product" : "Products"} ({totalUnits} total units)
          </span>
        </div>

        {submitted ? (
          /* Multi-Product RFQ Submission Confirmation */
          <div className="mt-10 max-w-2xl mx-auto rounded-3xl border border-border bg-card p-8 sm:p-10 shadow-xl text-center space-y-5 animate-in fade-in duration-300">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <h2 className="display-md text-foreground font-bold">
              Multi-Product Quotation Request Received!
            </h2>

            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Your inquiry for{" "}
              <strong className="text-foreground">
                {lines.length} line items ({totalUnits} total units)
              </strong>{" "}
              has been logged under Reference ID:{" "}
              <span className="font-mono font-bold text-primary">{refId}</span>.
            </p>

            <div className="rounded-2xl border border-border bg-secondary/40 p-5 text-xs text-left space-y-3">
              <div className="flex justify-between border-b border-border/80 pb-2">
                <span className="text-muted-foreground">Company Name:</span>
                <span className="font-semibold text-foreground">{formData.companyName}</span>
              </div>
              <div className="flex justify-between border-b border-border/80 pb-2">
                <span className="text-muted-foreground">Contact Phone:</span>
                <span className="font-mono font-semibold text-foreground">{formData.phone}</span>
              </div>
              {formData.email && (
                <div className="flex justify-between border-b border-border/80 pb-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{formData.email}</span>
                </div>
              )}
              <div className="pt-1">
                <span className="block font-bold uppercase tracking-wider text-muted-foreground text-[10px] mb-2">
                  Items Included in Quotation:
                </span>
                <ul className="space-y-1.5 divide-y divide-border/60">
                  {lines.map((l) => (
                    <li
                      key={l.slug}
                      className="flex justify-between items-center pt-1.5 text-[11px]"
                    >
                      <span className="truncate max-w-[260px] text-foreground font-medium">
                        {l.product.name}
                      </span>
                      <span className="font-mono font-bold text-primary">
                        {l.qty}x · Quote Pending
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Our B2B commercial engineering department will compile your official price quotation,
              volume rebate tier, and pro-forma invoice within 2–4 business hours.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-primary h-11 px-8 text-xs font-bold uppercase tracking-wider rounded-full shadow-md"
              >
                Clear Cart & Done
              </button>
              <Link
                to="/shop"
                className="btn btn-outline h-11 px-6 text-xs font-bold uppercase tracking-wider rounded-full"
              >
                Back to Shop Catalogue
              </Link>
            </div>
          </div>
        ) : !isLoaded ? (
          /* Loading State while reading local storage */
          <div className="mt-12 rounded-3xl border border-border/80 py-24 text-center bg-card shadow-xs">
            <div className="animate-spin h-7 w-7 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-xs text-muted-foreground font-mono">
              Restoring your quotation cart...
            </p>
          </div>
        ) : !lines.length ? (
          /* Empty State */
          <div className="mt-12 rounded-3xl border border-dashed border-border py-24 text-center bg-card">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground mx-auto mb-4">
              <ShoppingBag className="h-8 w-8" />
            </span>
            <h2 className="display-md text-foreground">Your Quotation Cart is Empty</h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              You have not added any automotive spare parts or garage machinery to your quotation
              list yet. Add products to request combined pricing and pro-forma invoices.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                to="/shop"
                className="btn btn-primary h-11 px-7 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm"
              >
                Browse Products
              </Link>
              <Link
                to="/shop"
                search={{ cat: "Garage Equipment" }}
                className="btn btn-outline h-11 px-7 text-xs font-bold uppercase tracking-wider rounded-full"
              >
                Explore Garage Machinery
              </Link>
            </div>
          </div>
        ) : (
          /* Main Quotation List & Multi-Product Form */
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
            {/* Left Column: Line Items */}
            <div className="space-y-4">
              <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                {lines.map((l) => (
                  <div
                    key={l.slug}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5"
                  >
                    <div className="flex items-center gap-4">
                      <Link
                        to="/shop/$slug"
                        params={{ slug: l.slug }}
                        className="aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/60 p-2"
                      >
                        <img
                          src={l.product.image}
                          alt={l.product.name}
                          className="h-full w-full object-contain mix-blend-multiply"
                        />
                      </Link>

                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          <span className="text-primary font-bold">{l.product.brand}</span>
                          <span>•</span>
                          <span className="font-mono">{l.product.sku}</span>
                        </div>
                        <Link
                          to="/shop/$slug"
                          params={{ slug: l.slug }}
                          className="mt-0.5 block text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug"
                        >
                          {l.product.name}
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-block text-[11px] font-mono font-semibold text-primary">
                            Pricing: Quotation on Request
                          </span>
                          <span className="text-muted-foreground text-xs">•</span>
                          <span className="text-[10px] font-semibold text-emerald-600">
                            {l.product.stock}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                      {/* Quantity Stepper */}
                      <div className="flex items-center">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground mr-2 hidden sm:inline">
                          Qty:
                        </span>
                        <div className="flex h-8.5 items-center rounded-lg border border-input bg-card shadow-xs">
                          <button
                            type="button"
                            onClick={() => setQty(l.slug, Math.max(1, l.qty - 1))}
                            aria-label="Decrease quantity"
                            className="grid h-full w-8 place-items-center hover:bg-secondary text-foreground transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold font-mono">
                            {l.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(l.slug, l.qty + 1)}
                            aria-label="Increase quantity"
                            className="grid h-full w-8 place-items-center hover:bg-secondary text-foreground transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => remove(l.slug)}
                        aria-label="Remove item"
                        className="text-muted-foreground hover:text-destructive p-1.5 transition-colors rounded-md hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Reassurance Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <span>100% Genuine OEM / OES</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary shrink-0" />
                  <span>Direct Site Dispatch</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <Wrench className="h-4 w-4 text-primary shrink-0" />
                  <span>Workshop Installation Available</span>
                </div>
              </div>
            </div>

            {/* Right Column: Multi-Product Quotation Request Form */}
            <aside className="h-fit rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-card p-6 text-foreground shadow-xl">
              <div className="border-b border-border pb-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                    Multi-Product RFQ
                  </span>
                </div>
                <h2 className="text-base font-display font-bold uppercase tracking-tight text-foreground mt-0.5">
                  Request Commercial Pricing
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Admin will calculate exact bulk pricing, tax invoices, and shipping estimates for
                  all {lines.length} items.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Company / Workshop Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhaka Premier Motors Ltd."
                    className="w-full h-9.5 px-3 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="Engineer / Manager"
                      className="w-full h-9.5 px-3 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Contact Phone <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+880 17XX-XXXXXX"
                      className="w-full h-9.5 px-3 rounded-lg border border-input bg-background text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      placeholder="procurement@corp.com"
                      className="w-full h-9.5 px-3 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Delivery Region
                    </label>
                    <select
                      className="w-full h-9.5 px-2.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    >
                      <option value="Dhaka">Dhaka Division</option>
                      <option value="Chittagong">Chittagong Division</option>
                      <option value="Sylhet">Sylhet Division</option>
                      <option value="Rajshahi">Rajshahi Division</option>
                      <option value="Khulna">Khulna Division</option>
                      <option value="Nationwide">Nationwide Delivery</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Procurement Notes / Project Requirements
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Specific delivery timeline, foundation bolt specs, or power requirements..."
                    className="w-full p-2.5 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                <div className="rounded-lg bg-secondary/50 p-3 text-[11px] text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Products for Quotation:</span>
                    <span className="font-semibold text-foreground">{lines.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Quantity:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {totalUnits} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Quotation Turnaround:</span>
                    <span className="font-semibold text-primary">2–4 business hours</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full h-11 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xl shadow-md"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit RFQ for {lines.length} Items</span>
                </button>

                <p className="text-[10px] text-center text-muted-foreground pt-1">
                  Includes formal pro-forma invoice, warranty documents & freight schedule.
                </p>
              </form>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
