import { useState } from "react";
import {
  X,
  Mail,
  Copy,
  Check,
  Printer,
  Smartphone,
  Monitor,
  Sparkles,
  Send,
  Download,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { taka } from "@/lib/data";

export type QuoteRequest = {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  productSlug: string;
  productName: string;
  qty: number;
  items?:
    { productSlug: string; productName: string; qty: number; unitPrice?: number }[] | undefined;
  itemsJson?:
    { productSlug: string; productName: string; qty: number; unitPrice?: number }[] | undefined;
  businessType?: string | null;
  city?: string | null;
  notes?: string | null;
  status?: string;
  reply?: string | null;
  quotedPrice?: number | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export interface QuotationEmailProps {
  quote: QuoteRequest;
  productName: string;
  unitPrice: number;
  qty: number;
  message?: string | undefined;
  onClose: () => void;
  onSent?: () => void;
}

/**
 * Generates an email-client compatible standalone HTML template with inline styles.
 */
export function generateQuotationEmailHtml({
  quote,
  productName,
  unitPrice,
  qty,
  message,
}: {
  quote: QuoteRequest;
  productName: string;
  unitPrice: number;
  qty: number;
  message?: string | undefined;
}): string {
  const isMulti = quote.items && quote.items.length > 1;
  const items =
    isMulti && quote.items
      ? quote.items
      : [{ productSlug: quote.productSlug, productName, qty, unitPrice }];
  const grandTotal = items.reduce((acc, it) => acc + (it.unitPrice || unitPrice) * it.qty, 0);
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const tableRowsHtml = items
    .map(
      (it, idx) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 14px; font-size: 13px; color: #64748b; font-family: monospace;">${idx + 1}</td>
        <td style="padding: 12px 14px; font-size: 13px; color: #0f172a; font-weight: 600;">
          ${it.productName}
          ${it.productSlug ? `<div style="font-size: 11px; color: #94a3b8; font-family: monospace; font-weight: normal; margin-top: 2px;">SKU: ${it.productSlug}</div>` : ""}
        </td>
        <td style="padding: 12px 14px; font-size: 13px; color: #334155; text-align: center; font-weight: 600;">${it.qty}</td>
        <td style="padding: 12px 14px; font-size: 13px; color: #334155; text-align: right; font-family: monospace;">৳${(it.unitPrice || unitPrice).toLocaleString("en-BD")}</td>
        <td style="padding: 12px 14px; font-size: 13px; color: #0f172a; text-align: right; font-weight: 700; font-family: monospace;">৳${((it.unitPrice || unitPrice) * it.qty).toLocaleString("en-BD")}</td>
      </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Commercial Quotation — PAGE International</title>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #18181b 0%, #09090b 100%); padding: 32px 36px; border-bottom: 3px solid #dc2626;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td>
            <div style="display: inline-block; background-color: #dc2626; color: #ffffff; font-weight: 900; font-size: 13px; letter-spacing: 2px; padding: 4px 10px; border-radius: 6px; margin-bottom: 8px;">
              PAGE INTERNATIONAL
            </div>
            <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
              Commercial Quotation
            </h1>
            <p style="margin: 4px 0 0 0; color: #a1a1aa; font-size: 12px;">
              Automotive Workshop Machinery & Fleet Solutions
            </p>
          </td>
          <td style="text-align: right; vertical-align: top;">
            <div style="display: inline-block; background-color: rgba(220, 38, 38, 0.15); border: 1px solid rgba(220, 38, 38, 0.4); color: #f87171; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; font-family: monospace;">
              Ref: #${quote.id.toUpperCase()}
            </div>
            <div style="margin-top: 8px; color: #a1a1aa; font-size: 11px;">
              Date: <strong style="color: #ffffff;">${dateStr}</strong>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Metadata Strip -->
    <div style="background-color: #f1f5f9; padding: 12px 36px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td><strong>Status:</strong> <span style="color: #059669; font-weight: 700;">● Official Quotation (Valid)</span></td>
          <td style="text-align: center;"><strong>Validity:</strong> 15 Calendar Days</td>
          <td style="text-align: right;"><strong>Currency:</strong> BDT (৳)</td>
        </tr>
      </table>
    </div>

    <!-- Body Container -->
    <div style="padding: 32px 36px;">
      
      <!-- Greeting -->
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #0f172a; line-height: 1.6;">
        Dear <strong>${quote.contactName || quote.companyName}</strong>,
      </p>
      <p style="margin: 0 0 24px 0; font-size: 13px; color: #475569; line-height: 1.6;">
        Thank you for choosing PAGE International. In response to your commercial procurement inquiry, our technical engineering desk has compiled the formal price quotation and delivery terms detailed below:
      </p>

      <!-- Client Details Card -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #dc2626; margin-bottom: 12px;">
          Client & Workshop Profile
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <tr>
            <td style="padding: 4px 0; color: #64748b; width: 35%;">Company Name:</td>
            <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${quote.companyName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Contact Person:</td>
            <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${quote.contactName}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Phone Number:</td>
            <td style="padding: 4px 0; color: #0f172a; font-family: monospace; font-weight: 600;">${quote.phone}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Official Email:</td>
            <td style="padding: 4px 0; color: #0f172a;">${quote.email}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #64748b;">Site / Delivery City:</td>
            <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${quote.city || "Dhaka, Bangladesh"}</td>
          </tr>
          ${
            quote.notes
              ? `
          <tr>
            <td style="padding: 4px 0; color: #64748b; vertical-align: top;">Client Notes:</td>
            <td style="padding: 4px 0; color: #334155; font-style: italic;">"${quote.notes}"</td>
          </tr>`
              : ""
          }
        </table>
      </div>

      <!-- Itemized Quotation Table -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #0f172a; margin-bottom: 10px;">
          Itemized Equipment Specifications & Valuation
        </div>
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding: 10px 14px;">#</th>
              <th style="padding: 10px 14px;">Description</th>
              <th style="padding: 10px 14px; text-align: center;">Qty</th>
              <th style="padding: 10px 14px; text-align: right;">Unit Price</th>
              <th style="padding: 10px 14px; text-align: right;">Line Total</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
          <tfoot>
            <tr style="background-color: #f8fafc; border-top: 2px solid #e2e8f0;">
              <td colspan="4" style="padding: 14px; text-align: right; font-size: 13px; font-weight: 700; color: #334155;">
                Total Commercial Valuation:
              </td>
              <td style="padding: 14px; text-align: right; font-size: 16px; font-weight: 800; color: #dc2626; font-family: monospace;">
                ৳${grandTotal.toLocaleString("en-BD")}
              </td>
            </tr>
          </tfoot>
        </table>
        <p style="margin: 6px 0 0 0; font-size: 11px; color: #94a3b8; text-align: right;">
          * Standard commercial terms apply. Formal itemized Tax/Mushak invoice provided upon Purchase Order.
        </p>
      </div>

      <!-- Warranty & Inclusions Checklist -->
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #15803d; margin-bottom: 10px;">
          ✓ Included Technical & Warranty Services
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; color: #166534;">
          <tr>
            <td style="padding: 4px 0; vertical-align: top; width: 20px;">✓</td>
            <td style="padding: 4px 0;"><strong>Certified Installation:</strong> Foundation chemical anchoring, laser leveling & electrical wiring verification.</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; vertical-align: top;">✓</td>
            <td style="padding: 4px 0;"><strong>Commercial Warranty:</strong> 18 to 36 Months official warranty with priority certified engineer standby.</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; vertical-align: top;">✓</td>
            <td style="padding: 4px 0;"><strong>Operator Training:</strong> Complimentary bay safety, preventive calibration & operator training session.</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; vertical-align: top;">✓</td>
            <td style="padding: 4px 0;"><strong>10-Year Spares Guarantee:</strong> Dedicated logistics replenishment directly from our Tejgaon Hub.</td>
          </tr>
        </table>
      </div>

      <!-- Notes from Commercial Desk -->
      ${
        message
          ? `
      <div style="background-color: #ffffff; border-left: 4px solid #dc2626; padding: 14px 18px; margin-bottom: 24px; background-color: #fff1f2;">
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9f1239; margin-bottom: 4px;">
          Notes & Commercial Terms
        </div>
        <p style="margin: 0; font-size: 12px; color: #4c0519; line-height: 1.5;">
          ${message}
        </p>
      </div>`
          : ""
      }

      <!-- Call to Action Box -->
      <div style="text-align: center; background-color: #0f172a; border-radius: 12px; padding: 24px; color: #ffffff; margin-bottom: 24px;">
        <h3 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; text-transform: uppercase;">
          Ready to Proceed or Schedule a Bay Demo?
        </h3>
        <p style="margin: 0 0 16px 0; font-size: 12px; color: #94a3b8;">
          Simply reply directly to this email or contact our B2B commercial desk:
        </p>
        <div>
          <a href="tel:+8809612724346" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 12px; padding: 10px 20px; border-radius: 8px; margin: 0 4px 8px 4px; text-transform: uppercase;">
            Call Hotline: +880 9612-PAGE-INTL
          </a>
          <a href="https://wa.me/8801700000000" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 12px; padding: 10px 20px; border-radius: 8px; margin: 0 4px 8px 4px; text-transform: uppercase;">
            WhatsApp Desk
          </a>
        </div>
      </div>

      <!-- Signature Block -->
      <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #475569; line-height: 1.6;">
        <strong style="color: #0f172a; font-size: 13px;">B2B Commercial & Technical Desk</strong><br>
        <strong>PAGE International Ltd.</strong><br>
        Tejgaon Industrial Area, Dhaka-1208, Bangladesh<br>
        Hotline: +880 9612-PAGE-INTL (+880 9612-724346) · Email: <a href="mailto:b2b@page-intl.com" style="color: #dc2626; text-decoration: none;">b2b@page-intl.com</a><br>
        Website: <a href="https://www.pageinternational.com" style="color: #dc2626; text-decoration: none;">www.pageinternational.com</a>
      </div>
    </div>

    <!-- Bottom Disclaimer Footer -->
    <div style="background-color: #f8fafc; padding: 16px 36px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8;">
      This official commercial quotation is issued electronically by PAGE International Ltd.
      <br>© ${new Date().getFullYear()} PAGE International Ltd. All rights reserved. "The Company Behind The Workshop"
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads a standard RFC 822 .eml file with full HTML styling.
 * Opens directly in Outlook, Apple Mail, and Thunderbird with rich design pre-rendered.
 */
export function downloadQuotationEml({
  quote,
  productName,
  htmlContent,
}: {
  quote: QuoteRequest;
  productName: string;
  htmlContent: string;
}) {
  const isMulti = quote.items && quote.items.length > 1;
  const subject = isMulti
    ? `[OFFICIAL COMMERCIAL QUOTATION] PAGE International — Ref #${quote.id.toUpperCase()} (${quote.items?.length} Products Order)`
    : `[OFFICIAL COMMERCIAL QUOTATION] PAGE International — Ref #${quote.id.toUpperCase()} for ${productName}`;

  const emlContent = [
    `From: "PAGE International Desk" <b2b@page-intl.com>`,
    `To: "${quote.contactName || quote.companyName}" <${quote.email}>`,
    `Subject: ${subject}`,
    `Date: ${new Date().toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    htmlContent,
  ].join("\r\n");

  const blob = new Blob([emlContent], { type: "message/rfc822" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PAGE-Quotation-${quote.id.toUpperCase()}.eml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Dual-method rich clipboard writer:
 * 1. navigator.clipboard.write([ClipboardItem({ "text/html": ..., "text/plain": ... })])
 * 2. DOM Range copy fallback for older browsers or restricted permissions.
 */
export async function copyQuotationHtmlToClipboard(
  html: string,
  plainText: string,
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Method 1: Modern ClipboardItem API (high fidelity for Gmail / Outlook)
  try {
    if (navigator.clipboard && typeof window.ClipboardItem !== "undefined") {
      const blobHtml = new Blob([html], { type: "text/html" });
      const blobText = new Blob([plainText], { type: "text/plain" });
      await navigator.clipboard.write([
        new window.ClipboardItem({
          "text/html": blobHtml,
          "text/plain": blobText,
        }),
      ]);
      return true;
    }
  } catch (err) {
    console.warn("ClipboardItem write failed, trying DOM selection copy:", err);
  }

  // Method 2: DOM Range Selection fallback (supported across all desktop browsers)
  try {
    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "fixed";
    hiddenContainer.style.left = "-9999px";
    hiddenContainer.style.top = "-9999px";
    hiddenContainer.style.opacity = "0";
    hiddenContainer.innerHTML = html;
    document.body.appendChild(hiddenContainer);

    const range = document.createRange();
    range.selectNodeContents(hiddenContainer);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
      selection.removeAllRanges();
    }
    document.body.removeChild(hiddenContainer);
    return true;
  } catch (err) {
    console.warn("DOM copy failed, falling back to plain text:", err);
  }

  // Method 3: Plain text fallback
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(plainText);
      return false;
    }
  } catch {
    // ignore
  }

  return false;
}

export function QuotationEmailModal({
  quote,
  productName,
  unitPrice,
  qty,
  message,
  onClose,
  onSent,
}: QuotationEmailProps) {
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);
  const [gmailOpenedNotice, setGmailOpenedNotice] = useState(false);

  const htmlContent = generateQuotationEmailHtml({
    quote,
    productName,
    unitPrice,
    qty,
    message,
  });

  const isMulti = quote.items && quote.items.length > 1;
  const items =
    isMulti && quote.items
      ? quote.items
      : [{ productSlug: quote.productSlug, productName, qty, unitPrice }];
  const grandTotal = items.reduce((acc, it) => acc + (it.unitPrice || unitPrice) * it.qty, 0);
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const plainTextFallback = `Dear ${quote.contactName || quote.companyName},

Thank you for your business inquiry with PAGE International. Regarding your quotation request (Ref: #${quote.id.toUpperCase()}), please find our official commercial offer and quotation report below:

=======================================================
PAGE INTERNATIONAL — COMMERCIAL QUOTATION REPORT
=======================================================
Quotation Ref: #${quote.id.toUpperCase()}
Issue Date: ${dateStr}
Validity: 15 Calendar Days
Prepared For: ${quote.companyName}

1. CLIENT & DELIVERY DETAILS:
• Company Name: ${quote.companyName}
• Contact Person: ${quote.contactName}
• Phone: ${quote.phone}
• Email: ${quote.email}
• City / Workshop Location: ${quote.city || "Dhaka, Bangladesh"}
• Industry / Business Type: ${quote.businessType || "Automotive Workshop / Fleet"}

2. ORIGINAL INQUIRY SUBMITTED BY CLIENT:
• Product Requested: ${quote.productName}
• Quantity Requested: ${quote.qty} unit(s)
${quote.notes ? `• Client Notes / Specifications: "${quote.notes}"\n` : ""}
3. OFFICIAL COMMERCIAL OFFER:
${items
  .map(
    (it, idx) => `• Item ${idx + 1}: ${it.productName}
  Unit Price: ৳${(it.unitPrice || unitPrice).toLocaleString("en-BD")} BDT
  Quantity: ${it.qty} unit(s)
  Total: ৳${((it.unitPrice || unitPrice) * it.qty).toLocaleString("en-BD")} BDT`,
  )
  .join("\n\n")}

• TOTAL COMMERCIAL VALUATION: ৳${grandTotal.toLocaleString("en-BD")} BDT
(All standard commercial terms apply. Formal itemized Tax/Mushak invoice provided upon PO confirmation.)

4. TECHNICAL INCLUSIONS & WARRANTY:
✓ Certified on-site delivery, leveling, chemical anchoring, and power wiring inspection
✓ 18 to 36 Months official manufacturer warranty with priority certified engineer dispatch
✓ Free operator safety and technician calibration training at your workshop bay
✓ 10-Year guaranteed genuine spare parts availability from PAGE Tejgaon logistics hub

5. NOTES & TERMS FROM COMMERCIAL DESK:
${message || "We look forward to partnering with your workshop and ensuring world-class equipment uptime."}

=======================================================
HOW TO PROCEED / CONFIRM ORDER:
To accept this quotation, request pro-forma tax invoice, or schedule an in-person demonstration at our Tejgaon Hub, simply reply to this email or contact our commercial desk:

• Direct B2B Hotline: +880 9612-PAGE-INTL (+880 9612-724346)
• Official WhatsApp: +880 1700-000000
• Commercial Email: b2b@page-intl.com | sales@page-intl.com

Warm regards,

B2B Commercial & Technical Support Desk
PAGE International Ltd.
Tejgaon Industrial Area, Dhaka-1208, Bangladesh
Website: www.pageinternational.com
"The Company Behind The Workshop"
`;

  async function handleCopy() {
    await copyQuotationHtmlToClipboard(htmlContent, plainTextFallback);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  async function handleOpenGmail() {
    // 1. Copy formatted HTML to clipboard so the user can paste (Ctrl+V) if they want graphical HTML
    await copyQuotationHtmlToClipboard(htmlContent, plainTextFallback);
    setGmailOpenedNotice(true);

    // 2. Open Gmail compose with recipient and subject pre-filled, but clean empty body
    const subject = isMulti
      ? `[OFFICIAL COMMERCIAL QUOTATION] PAGE International — Ref #${quote.id.toUpperCase()} (${quote.items?.length} Products Order)`
      : `[OFFICIAL COMMERCIAL QUOTATION] PAGE International — Ref #${quote.id.toUpperCase()} for ${productName}`;

    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      quote.email,
    )}&su=${encodeURIComponent(subject)}`;

    window.open(gmailUrl, "_blank");

    if (onSent) onSent();
  }

  function handleDownloadEml() {
    downloadQuotationEml({ quote, productName, htmlContent });
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-white/10 bg-[#171717] text-zinc-100 shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#1a1a1a] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center border border-red-500/20">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Branded Quotation Email Template</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Ready to Dispatch
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Client: {quote.companyName} ({quote.email}) · Ref #{quote.id.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop / Mobile view toggle */}
            <div className="hidden sm:flex items-center bg-[#242424] p-0.5 rounded-lg border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setDeviceView("desktop")}
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  deviceView === "desktop"
                    ? "bg-zinc-800 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Desktop Width View (640px)"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeviceView("mobile")}
                className={`p-1.5 rounded-md text-xs font-medium transition-all ${
                  deviceView === "mobile"
                    ? "bg-zinc-800 text-white shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
                title="Mobile Width View (375px)"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Download EML */}
            <button
              type="button"
              onClick={handleDownloadEml}
              className="h-8 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download .EML file (Opens in Outlook / Apple Mail with HTML pre-loaded)"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">.EML File</span>
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={handlePrint}
              className="h-8 px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save PDF"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Gmail Instructions Banner */}
        <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-amber-950/40 border-b border-white/[0.08] px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>1-Click Dispatch:</strong> When you click <strong>Send via Gmail</strong>,
              this styled template is copied to your clipboard. Gmail will open with an empty body —
              just press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[11px] font-mono text-emerald-400 font-bold border border-emerald-500/30">
                Ctrl + V
              </kbd>{" "}
              to paste the full design!
            </span>
          </div>
          {gmailOpenedNotice && (
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 animate-pulse">
              <Check className="h-3.5 w-3.5" />
              Template copied! Press Ctrl + V in the Gmail window
            </span>
          )}
        </div>

        {/* Live Email Preview Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0f0f0f] flex justify-center items-start">
          <div
            className={`transition-all duration-300 shadow-xl rounded-2xl overflow-hidden ${
              deviceView === "desktop" ? "w-full max-w-[660px]" : "w-[390px]"
            }`}
          >
            <iframe
              title="Quotation Email Template Preview"
              srcDoc={htmlContent}
              className="w-full min-h-[580px] h-[64vh] border-0 rounded-2xl bg-white"
              sandbox="allow-same-origin allow-popups"
            />
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="px-5 py-4 border-t border-white/[0.08] bg-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>
              Opens Gmail with empty body and copies this design to your clipboard. In Gmail, just
              press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-200 border border-white/10 font-mono">
                Ctrl+V
              </kbd>
              .
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className={`h-9 px-4 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                copied
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border-white/[0.08]"
              }`}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{copied ? "Copied Rich HTML!" : "Copy Rich Template"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenGmail}
              className="h-9 px-5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-red-900/30 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send via Gmail</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
