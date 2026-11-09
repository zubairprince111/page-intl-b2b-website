import { useState, useEffect } from "react";
import { CheckCircle2, FileSpreadsheet, Minus, Plus, X, Loader2 } from "lucide-react";
import type { Product } from "@/lib/data";
import { useCreateQuote } from "@/lib/data-client";

export interface QuoteModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuoteModal({ product, onClose }: QuoteModalProps) {
  const [qty, setQty] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quoteNumber, setQuoteNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const createQuoteMutation = useCreateQuote();

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    phone: "",
    email: "",
    businessType: "Workshop / Garage",
    city: "Dhaka",
    notes: "",
    honeypot: "",
  });

  // Prevent background body scrolling when quotation modal is opened
  useEffect(() => {
    if (!product) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.phone) return;
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await createQuoteMutation.mutateAsync({
        companyName: formData.companyName,
        contactName: formData.contactName || formData.companyName,
        phone: formData.phone,
        email: formData.email,
        productSlug: product.slug,
        productName: product.name,
        qty,
        businessType: formData.businessType,
        city: formData.city,
        notes: formData.notes,
        honeypot: formData.honeypot,
      });

      if (res.quoteNumber) {
        setQuoteNumber(res.quoteNumber);
      }
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit quotation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border/80 shadow-2xl p-6 sm:p-7 text-foreground overflow-hidden max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close quote dialog"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-display font-bold uppercase tracking-wide">
              Quotation Request Received
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Your inquiry for{" "}
              <strong className="text-foreground">
                {qty}x {product.name}
              </strong>{" "}
              has been logged in our system under Reference ID:{" "}
              <span className="font-mono font-bold text-primary">
                {quoteNumber || `#RFQ-${Math.floor(100000 + Math.random() * 900000)}`}
              </span>
              .
            </p>
            <div className="rounded-xl border border-border bg-secondary/50 p-4 text-xs text-left space-y-1.5 text-muted-foreground">
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="font-semibold text-foreground truncate max-w-[220px]">
                  {product.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Company:</span>
                <span className="font-semibold text-foreground truncate max-w-[220px]">
                  {formData.companyName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Contact Phone:</span>
                <span className="font-mono text-foreground">{formData.phone}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Our commercial engineering team will prepare your formal price quotation and pro-forma
              invoice within 2–4 business hours.
            </p>
            <button
              onClick={handleReset}
              className="btn btn-primary h-10 px-8 text-xs font-bold uppercase tracking-wider rounded-full shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-border pb-3 pr-8">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
                Commercial RFQ & Wholesale
              </span>
              <h2 className="text-lg sm:text-xl font-display font-bold uppercase tracking-tight text-foreground mt-0.5">
                Request Price Quotation
              </h2>
            </div>

            {/* Product Summary Box */}
            <div className="my-3 flex items-center gap-3.5 rounded-xl border border-border/80 bg-secondary/40 p-2.5 shrink-0">
              <div className="h-12 w-12 shrink-0 rounded-lg border border-border bg-white p-1 flex items-center justify-center">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  {product.name}
                </h4>
                <div className="mt-0.5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-primary font-semibold">
                    {product.brand} · {product.sku}
                  </span>

                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-border rounded-lg bg-card h-6.5">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="px-2 text-xs hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-2 text-xs font-mono font-bold">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(qty + 1)}
                      className="px-2 text-xs hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="quote-company"
                    className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Company / Workshop *
                  </label>
                  <input
                    id="quote-company"
                    required
                    type="text"
                    value={formData.companyName}
                    placeholder="e.g. Master Motors Ltd."
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-card px-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="quote-contact"
                    className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Contact Person Name
                  </label>
                  <input
                    id="quote-contact"
                    type="text"
                    value={formData.contactName}
                    placeholder="e.g. Engr. Tanvir Ahmed"
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-card px-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="quote-phone"
                    className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Mobile Phone *
                  </label>
                  <input
                    id="quote-phone"
                    required
                    type="tel"
                    value={formData.phone}
                    placeholder="+880 1711-XXXXXX"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-card px-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="quote-email"
                    className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Work Email
                  </label>
                  <input
                    id="quote-email"
                    type="email"
                    value={formData.email}
                    placeholder="contact@workshop.com"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-card px-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="quote-business-type"
                    className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Business Sector
                  </label>
                  <select
                    id="quote-business-type"
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-card px-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Workshop / Garage">Independent Garage / Service Center</option>
                    <option value="Dealership 3S">Authorized Dealership (3S / 4S)</option>
                    <option value="Commercial Fleet">Commercial Logistics Fleet Depot</option>
                    <option value="Distributor / Wholesale">Distributor / Reseller</option>
                    <option value="EV Workshop">EV Conversion / Battery Workshop</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="quote-city"
                    className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                  >
                    Region / City
                  </label>
                  <input
                    id="quote-city"
                    type="text"
                    value={formData.city}
                    placeholder="Dhaka"
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-card px-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="quote-notes"
                  className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1"
                >
                  Specific Requirements or Notes
                </label>
                <textarea
                  id="quote-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Need floor anchoring, 3-phase power verification, or expedited delivery..."
                  className="w-full rounded-lg border border-input bg-card p-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Honeypot field for bot protection */}
              <input
                type="text"
                name="b_quote_hp"
                tabIndex={-1}
                autoComplete="off"
                value={formData.honeypot}
                onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                className="hidden"
                aria-hidden="true"
              />

              {errorMsg && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-500">
                  {errorMsg}
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary w-full h-10 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting to Engineering Desk...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4" />
                      <span>Submit Price Quotation Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
