export interface QuotationEmailPayload {
  quote: {
    id: string;
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    productSlug: string;
    productName: string;
    qty: number;
    businessType?: string | null;
    city?: string | null;
    notes?: string | null;
    items?: { productSlug: string; productName: string; qty: number; unitPrice?: number }[] | null;
    itemsJson?:
      { productSlug: string; productName: string; qty: number; unitPrice?: number }[] | null;
  };
  productName: string;
  unitPrice: number;
  qty: number;
  message?: string | undefined;
  mode?: "rich" | "plain" | undefined;
}

export function openGmailQuotationDraft({
  quote,
  productName,
  unitPrice,
  qty,
  message,
}: QuotationEmailPayload): {
  gmailUrl: string;
  mailtoUrl: string;
  subject: string;
  body: string;
} {
  const total = unitPrice * qty;
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const quoteItems = quote.itemsJson || quote.items || null;
  const isMultiItem = quoteItems && quoteItems.length > 1;

  const subject = isMultiItem
    ? `[OFFICIAL COMMERCIAL QUOTATION] PAGE International — Ref #${quote.id.toUpperCase()} (${quoteItems.length} Products Order)`
    : `[OFFICIAL COMMERCIAL QUOTATION] PAGE International — Ref #${quote.id.toUpperCase()} for ${productName}`;

  const inquirySection =
    isMultiItem && quoteItems
      ? `2. ORIGINAL INQUIRY SUBMITTED BY CLIENT (${quoteItems.length} Products):
${quoteItems.map((it, idx) => `  ${idx + 1}. ${it.productName} — Requested Qty: ${it.qty} unit(s)`).join("\n")}
${quote.notes ? `\n• Client Notes / Specifications: "${quote.notes}"\n` : ""}`
      : `2. ORIGINAL INQUIRY SUBMITTED BY CLIENT:
• Product Requested: ${quote.productName}
• Quantity Requested: ${quote.qty} unit(s)
${quote.notes ? `• Client Notes / Specifications: "${quote.notes}"\n` : ""}`;

  const itemsTotal =
    isMultiItem && quoteItems
      ? quoteItems.reduce((acc, it) => acc + (it.unitPrice || unitPrice) * it.qty, 0)
      : total;

  const offerSection =
    isMultiItem && quoteItems
      ? `3. OFFICIAL COMMERCIAL OFFER (ITEMIZED BREAKDOWN):
${quoteItems
  .map(
    (it, idx) => `  ${idx + 1}. ${it.productName}
     • Unit Price: ৳${(it.unitPrice || unitPrice).toLocaleString("en-BD")} BDT
     • Quantity: ${it.qty} unit(s)
     • Line Total: ৳${((it.unitPrice || unitPrice) * it.qty).toLocaleString("en-BD")} BDT`,
  )
  .join("\n\n")}

• COMBINED COMMERCIAL VALUATION: ৳${itemsTotal.toLocaleString("en-BD")} BDT
(All standard commercial terms apply. Formal itemized Tax/Mushak invoice provided upon PO confirmation.)`
      : `3. OFFICIAL COMMERCIAL OFFER:
• Equipment / Product Model: ${productName}
• Quoted Unit Price: ৳${unitPrice.toLocaleString("en-BD")} BDT
• Quantity: ${qty} unit(s)
• Total Commercial Valuation: ৳${total.toLocaleString("en-BD")} BDT
(All standard commercial terms apply. Formal itemized Tax/Mushak invoice provided upon PO confirmation.)`;

  const body = `Dear ${quote.contactName || quote.companyName},

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

${inquirySection}

${offerSection}

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

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    quote.email,
  )}&su=${encodeURIComponent(subject)}`;

  const mailtoUrl = `mailto:${encodeURIComponent(quote.email)}?subject=${encodeURIComponent(
    subject,
  )}`;

  if (typeof window !== "undefined") {
    const win = window.open(gmailUrl, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      window.location.href = mailtoUrl;
    }
  }

  return { gmailUrl, mailtoUrl, subject, body };
}
