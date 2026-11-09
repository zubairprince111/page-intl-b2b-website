import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Lock,
  Phone,
  ShieldCheck,
  Truck,
  User,
  Wallet,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { taka } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { useCurrentUser } from "@/lib/auth-client";
import { useCreateOrder } from "@/lib/data-client";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Commercial Checkout — PAGE International" },
      { name: "description", content: "Complete your automotive parts and equipment order." },
      { property: "og:title", content: "Checkout — PAGE" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

export function Checkout() {
  const { lines, subtotal, clear, isLoaded } = useCart();
  const { data: user } = useCurrentUser();
  const createOrderMutation = useCreateOrder();

  const [done, setDone] = useState(false);
  const [pay, setPay] = useState("cod");
  const [isBusiness, setIsBusiness] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    companyName: "",
    bin: "",
    address: "",
    city: "Dhaka",
    district: "",
    postalCode: "",
    notes: "",
    honeypot: "",
  });

  // Autofill workshop details if signed in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        companyName: user.companyName || prev.companyName,
        city: user.city || prev.city,
      }));
      if (user.companyName) {
        setIsBusiness(true);
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const res = (await createOrderMutation.mutateAsync({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        companyName: isBusiness ? formData.companyName : undefined,
        shippingAddress: formData.address,
        city: formData.city,
        district: formData.district || undefined,
        postalCode: formData.postalCode || undefined,
        paymentMethod: pay,
        notes: formData.notes || undefined,
        items: lines.map((l) => ({ productSlug: l.product.slug, quantity: l.qty })),
        honeypot: formData.honeypot,
      })) as { success: boolean; orderNumber: string };

      if (res.orderNumber) {
        setOrderId(res.orderNumber);
      }
      clear();
      setDone(true);
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to process commercial order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-32 text-center bg-background">
        <div className="animate-spin h-7 w-7 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-muted-foreground font-mono">
          Restoring your checkout session...
        </p>
      </div>
    );
  }

  if (isLoaded && lines.length === 0 && !done) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-32 text-center bg-background">
        <h2 className="display-md text-foreground">Your Checkout Cart is Empty</h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Please add items to your cart before proceeding to checkout.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/shop"
            className="btn btn-primary h-11 px-7 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm"
          >
            Browse Products
          </Link>
          <Link
            to="/"
            className="btn btn-outline h-11 px-7 text-xs font-bold uppercase tracking-wider rounded-full"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="container-page flex min-h-screen flex-col items-center justify-center py-32 text-center bg-background">
        <div className="rounded-full bg-success/15 p-4 text-success mb-2">
          <CheckCircle2 className="h-16 w-16" strokeWidth={1.75} />
        </div>
        <h1 className="display-lg mt-4 text-foreground font-bold">Order Confirmed & Placed</h1>
        <p className="mt-2 text-xs font-mono font-bold uppercase tracking-widest text-primary">
          Order Reference: #{orderId}
        </p>
        <p className="mt-3 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Thank you for choosing PAGE International Ltd. Our commercial logistics desk has received
          your job card. We will contact you via phone within 2 hours to confirm delivery dispatch
          details.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="btn btn-primary h-11 px-6 text-xs font-bold uppercase">
            Continue Shopping
          </Link>
          <Link to="/" className="btn btn-outline h-11 px-6 text-xs font-bold uppercase">
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
          <Link to="/cart" className="hover:text-foreground">
            Cart
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Checkout</span>
        </nav>
      </div>

      <div className="container-page py-10 lg:py-14">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
          <h1 className="display-lg text-foreground font-bold">Commercial Checkout</h1>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5 text-primary" /> 256-Bit SSL Encrypted
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Left Form Details */}
          <div className="space-y-8">
            {/* Account Type Toggle */}
            <div className="rounded border border-border bg-card p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">
                1. Order Account Type
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsBusiness(false)}
                  className={`flex items-center justify-center gap-2 rounded border p-3 text-xs font-bold uppercase transition-colors ${
                    !isBusiness
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  <User className="h-4 w-4" /> Professional Automotive Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setIsBusiness(true)}
                  className={`flex items-center justify-center gap-2 rounded border p-3 text-xs font-bold uppercase transition-colors ${
                    isBusiness
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  <Building2 className="h-4 w-4" /> Commercial Workshop / Fleet
                </button>
              </div>
            </div>

            {/* Delivery Information */}
            <fieldset className="rounded border border-border bg-card p-5 space-y-4">
              <legend className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                2. Delivery & Contact Details
              </legend>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    placeholder="Your full legal name"
                    className="field"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+880 1..."
                    className="field"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {isBusiness && (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                        Company / Workshop Name *
                      </label>
                      <input
                        required
                        placeholder="e.g. Apex Garage Ltd."
                        className="field"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                        BIN / VAT Registration # (Optional)
                      </label>
                      <input
                        placeholder="For commercial tax invoice"
                        className="field"
                        value={formData.bin}
                        onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                    Street Address & Area *
                  </label>
                  <input
                    required
                    placeholder="House/Plot #, Road/Avenue, Industrial Zone"
                    className="field"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                    City / District *
                  </label>
                  <input
                    required
                    className="field"
                    autoComplete="address-level2"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                    Email Address (For Invoicing) *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="billing@domain.com"
                    className="field"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1">
                    Special Unloading or Vehicle Notes (Optional)
                  </label>
                  <textarea
                    placeholder="e.g., Heavy equipment unloading instructions, preferred time window, gate clearance"
                    className="field h-20 py-2.5"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
            </fieldset>

            {/* Payment Method */}
            <fieldset className="rounded border border-border bg-card p-5">
              <legend className="px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                3. Payment Method
              </legend>

              <div className="grid gap-3 sm:grid-cols-3 mt-1">
                {[
                  {
                    id: "cod",
                    name: "Cash on Delivery",
                    sub: "Pay upon physical inspection",
                    icon: Truck,
                  },
                  {
                    id: "b2b",
                    name: "Bank Wire / B2B Invoice",
                    sub: "Direct company account transfer",
                    icon: Building2,
                  },
                  {
                    id: "card",
                    name: "Card / Mobile Banking",
                    sub: "Visa, MC, bKash, Nagad",
                    icon: CreditCard,
                  },
                ].map((p) => (
                  <label
                    key={p.id}
                    className={`flex flex-col justify-between rounded border p-4 cursor-pointer transition-colors ${
                      pay === p.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p.icon
                        className={`h-5 w-5 ${pay === p.id ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <input
                        type="radio"
                        name="pay"
                        checked={pay === p.id}
                        onChange={() => setPay(p.id)}
                        className="accent-[var(--color-primary)]"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-foreground uppercase">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{p.sub}</p>
                    </div>
                  </label>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                * All transactions include registered VAT invoices from PAGE International Ltd.
              </p>
            </fieldset>
          </div>

          {/* Right Summary Panel */}
          <aside className="h-fit rounded border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground border-b border-border pb-3">
              Order Review ({lines.length} Items)
            </h2>

            <ul className="mt-4 space-y-3 divide-y divide-border/60 max-h-72 overflow-y-auto pr-1 text-xs">
              {lines.map((l) => (
                <li
                  key={l.slug}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={l.product.image}
                      alt=""
                      className="h-10 w-10 rounded border border-border object-contain p-1 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-foreground line-clamp-1">{l.product.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Qty: {l.qty} × {taka(l.product.price)}
                      </p>
                    </div>
                  </div>
                  <span className="font-display text-base font-bold text-foreground shrink-0">
                    {taka(l.qty * l.product.price)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-border pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold text-foreground">{taka(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-semibold text-success">Included</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">VAT / Tax</span>
                <span className="font-semibold text-foreground">Included</span>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <span className="text-sm font-bold uppercase">Total Payable</span>
                <span className="font-display text-3xl font-bold text-foreground">
                  {taka(subtotal)}
                </span>
              </div>
            </div>

            {/* Honeypot */}
            <input
              type="text"
              name="b_chk_hp"
              tabIndex={-1}
              autoComplete="off"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              className="hidden"
              aria-hidden="true"
            />

            {submitError && (
              <div className="mt-4 rounded border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={!lines.length || isSubmitting}
              className="btn btn-primary mt-6 w-full h-12 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Commercial Order...</span>
                </>
              ) : (
                <span>Place & Confirm Order</span>
              )}
            </button>

            <div className="mt-4 text-[11px] text-muted-foreground space-y-1">
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Genuine Warranty Included
              </p>
              <p className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" /> Trackable Dispatch via SMS & Email
              </p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
