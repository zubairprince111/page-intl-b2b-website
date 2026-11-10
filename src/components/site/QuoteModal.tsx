import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  FileSpreadsheet,
  Minus,
  Plus,
  X,
  Loader2,
  Mail,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  Send,
  Sparkles,
} from "lucide-react";
import type { Product } from "@/lib/data";
import {
  useQuoteSubmissionConfig,
  useCreateQuote,
  useSendQuoteOtp,
  useVerifyAndSubmitQuote,
} from "@/lib/data-client";

export interface QuoteModalProps {
  product: Product | null;
  onClose: () => void;
}

export function QuoteModal({ product, onClose }: QuoteModalProps) {
  const [step, setStep] = useState<"form" | "otp" | "success">("form");
  const [qty, setQty] = useState(1);
  const [otp, setOtp] = useState("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [submittedViaOtp, setSubmittedViaOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [copiedRef, setCopiedRef] = useState(false);

  const otpInputRef = useRef<HTMLInputElement>(null);

  const { data: quoteConfig, refetch: refetchQuoteConfig } = useQuoteSubmissionConfig();
  const requireEmailOtp = quoteConfig?.requireEmailOtp ?? false;

  const createQuoteMutation = useCreateQuote();
  const sendOtpMutation = useSendQuoteOtp();
  const verifyAndSubmitMutation = useVerifyAndSubmitQuote();

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

  // Reset transient modal state whenever product changes or modal closes
  useEffect(() => {
    setStep("form");
    setQty(1);
    setOtp("");
    setQuoteNumber("");
    setSubmittedViaOtp(false);
    setErrorMsg(null);
  }, [product?.slug]);

  // Prevent background body scrolling when modal is open
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

  // Handle countdown timer for OTP resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus OTP input when switching to OTP screen
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [step]);

  if (!product) return null;

  const isSubmittingForm = sendOtpMutation.isPending || createQuoteMutation.isPending;

  // Step 1: Submit Form Directly OR Trigger Email OTP based on server configuration
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const companyName = formData.companyName.trim();
    const contactName = formData.contactName.trim() || companyName;
    const phone = formData.phone.trim();
    const email = formData.email.trim();

    if (!companyName || !phone || !email) {
      setErrorMsg("Please fill in all required fields (Company, Phone, and Email).");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Please provide a valid business email address.");
      return;
    }

    setErrorMsg(null);

    try {
      const activeConfig = quoteConfig ?? (await refetchQuoteConfig()).data;
      const needsOtp = activeConfig?.requireEmailOtp ?? false;

      if (needsOtp) {
        await sendOtpMutation.mutateAsync({
          email,
          companyName,
          productName: product.name,
        });

        setStep("otp");
        setCooldown(60);
        setOtp("");
        return;
      }

      const res = await createQuoteMutation.mutateAsync({
        companyName,
        contactName,
        phone,
        email,
        productSlug: product.slug,
        productName: product.name,
        qty,
        businessType: formData.businessType,
        city: formData.city,
        notes: formData.notes,
        honeypot: formData.honeypot,
      });

      setSubmittedViaOtp(false);
      if (res.quoteNumber) {
        setQuoteNumber(res.quoteNumber);
      }
      setStep("success");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to submit quotation request. Please check your details.");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || sendOtpMutation.isPending) return;
    setErrorMsg(null);
    try {
      await sendOtpMutation.mutateAsync({
        email: formData.email.trim(),
        companyName: formData.companyName.trim(),
        productName: product.name,
      });
      setCooldown(60);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to resend verification code.");
    }
  };

  // Step 2: Verify OTP and Save Quote
  const handleVerifyOtpAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (cleanOtp.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setErrorMsg(null);

    try {
      const res = await verifyAndSubmitMutation.mutateAsync({
        otp: cleanOtp,
        companyName: formData.companyName.trim(),
        contactName: formData.contactName.trim() || formData.companyName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        productSlug: product.slug,
        productName: product.name,
        qty,
        businessType: formData.businessType,
        city: formData.city,
        notes: formData.notes,
        honeypot: formData.honeypot,
      });

      setSubmittedViaOtp(true);
      if (res.quoteNumber) {
        setQuoteNumber(res.quoteNumber);
      }
      setStep("success");
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid verification code. Please try again.");
    }
  };

  const handleCopyRef = () => {
    if (navigator.clipboard && quoteNumber) {
      navigator.clipboard.writeText(quoteNumber);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleDone = () => {
    setStep("form");
    setOtp("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-7 text-foreground overflow-hidden max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close quote dialog"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === "success" ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                {submittedViaOtp
                  ? "Email Verified • Request Confirmed"
                  : "Direct RFQ Logged • Request Confirmed"}
              </span>
              <h3 className="text-2xl font-display font-bold uppercase tracking-tight text-foreground">
                Quotation Request Received
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Your inquiry for{" "}
              <strong className="text-foreground">
                {qty}x {product.name}
              </strong>{" "}
              has been logged under Reference ID:
            </p>

            {/* Reference ID Pill with Copy */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border">
              <span className="font-mono font-bold text-base text-primary">
                {quoteNumber || "#RFQ-2026-CONFIRMED"}
              </span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                title="Copy reference number"
              >
                {copiedRef ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-xs text-left space-y-2 text-muted-foreground">
              <div className="flex justify-between">
                <span>Product:</span>
                <span className="font-semibold text-foreground truncate max-w-[220px]">
                  {product.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Workshop / Company:</span>
                <span className="font-semibold text-foreground truncate max-w-[220px]">
                  {formData.companyName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{submittedViaOtp ? "Verified Email:" : "Email Address:"}</span>
                <span className="font-mono text-foreground">{formData.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-mono text-foreground">{formData.phone}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Our commercial engineering desk will prepare your formal price quotation and pro-forma
              invoice within 2–4 business hours. No password or login was required.
            </p>

            <button
              onClick={handleDone}
              className="btn btn-primary h-10 px-8 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : step === "otp" ? (
          /* STEP 2: EMAIL OTP VERIFICATION */
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                setStep("form");
                setErrorMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Edit Details</span>
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-display font-bold uppercase tracking-tight text-foreground">
                Verify Your Work Email
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                We sent a 6-digit verification code to{" "}
                <strong className="text-foreground">{formData.email}</strong>. Enter it below to
                confirm your quotation request.
              </p>
            </div>

            <form onSubmit={handleVerifyOtpAndSubmit} className="space-y-4 pt-2">
              {/* 6-Digit OTP Input */}
              <div>
                <label
                  htmlFor="quote-otp-input"
                  className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center mb-2"
                >
                  Enter 6-Digit Code
                </label>
                <input
                  ref={otpInputRef}
                  id="quote-otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="------"
                  className="w-full h-12 text-center font-mono font-bold text-2xl tracking-[0.5em] rounded-xl border border-input bg-card text-foreground focus:border-primary focus:outline-none shadow-xs"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-500 text-center animate-in fade-in">
                  {errorMsg}
                </div>
              )}

              {/* Verify CTA */}
              <button
                type="submit"
                disabled={otp.length < 6 || verifyAndSubmitMutation.isPending}
                className="btn btn-primary w-full h-11 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {verifyAndSubmitMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Code & Logging Quotation...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Verify Email & Submit Quotation</span>
                  </>
                )}
              </button>

              {/* Resend Cooldown */}
              <div className="text-center text-xs text-muted-foreground pt-1">
                {cooldown > 0 ? (
                  <span>Resend code in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={sendOtpMutation.isPending}
                    className="text-primary font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${sendOtpMutation.isPending ? "animate-spin" : ""}`}
                    />
                    <span>Resend Verification Code</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* STEP 1: QUOTATION DETAILS FORM */
          <>
            {/* Header */}
            <div className="border-b border-border pb-3 pr-8">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                Request Price Quotation
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                We will prepare an official commercial quote and availability.
              </p>
            </div>

            {/* Product Summary Box */}
            <div className="my-3 flex items-center gap-3.5 rounded-2xl border border-border/80 bg-secondary/40 p-2.5 shrink-0">
              <div className="h-12 w-12 shrink-0 rounded-xl border border-border bg-white p-1 flex items-center justify-center">
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
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto space-y-3 pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label
                    htmlFor="quote-company"
                    className="block text-xs font-medium text-foreground mb-1"
                  >
                    Company / Workshop <span className="text-destructive">*</span>
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
                    className="block text-xs font-medium text-foreground mb-1"
                  >
                    Contact Person{" "}
                    <span className="text-muted-foreground font-normal">(Optional)</span>
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
                    className="block text-xs font-medium text-foreground mb-1"
                  >
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="quote-phone"
                    required
                    type="tel"
                    value={formData.phone}
                    placeholder="+880 1711-XXXXXX"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-card px-2.5 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="quote-email"
                    className="block text-xs font-medium text-foreground mb-1"
                  >
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="quote-email"
                    required
                    type="email"
                    value={formData.email}
                    placeholder="contact@workshop.com"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-8 rounded-lg border border-input bg-card px-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="quote-notes"
                  className="block text-xs font-medium text-foreground mb-1"
                >
                  Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                </label>
                <input
                  id="quote-notes"
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Specific requirements or delivery timeline..."
                  className="w-full h-8 rounded-lg border border-input bg-card px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
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
                  disabled={isSubmittingForm}
                  className="btn btn-primary w-full h-10 text-xs font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingForm ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {requireEmailOtp
                          ? "Sending Verification Code..."
                          : "Submitting Quotation Request..."}
                      </span>
                    </>
                  ) : requireEmailOtp ? (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Verify with Email OTP</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Quotation Request</span>
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
