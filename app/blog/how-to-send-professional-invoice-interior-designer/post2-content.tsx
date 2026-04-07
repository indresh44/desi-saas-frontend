"use client";

import Link from "next/link";

const C = {
  coral: "#FF6B6B",
  teal: "#2EC4B6",
  gold: "#d4af37",
  navy: "#0a192f",
  gray: "#F8F9FA",
} as const;

const shadow = (x: number, y: number, color: string) =>
  `${x}px ${y}px 0px 0px ${color}`;

const FH = "var(--font-plus-jakarta)";

// ── Reusable components ──

function BlobDivider({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <div aria-hidden="true" style={{ width: "100%", height: 100, display: "flex", justifyContent: flip ? "flex-end" : "flex-start", alignItems: "center", overflow: "hidden", opacity: 0.12 }}>
      <svg width="400" height="100" viewBox="0 0 400 100" fill="none">
        <ellipse cx={flip ? 300 : 100} cy="50" rx="200" ry="50" fill={color} style={{ transform: flip ? "rotate(-8deg)" : "rotate(8deg)" }} />
        <circle cx={flip ? 150 : 280} cy="30" r="25" fill={color} opacity="0.5" />
      </svg>
    </div>
  );
}

function PullQuote({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ margin: "40px 0", padding: "24px 28px", borderLeft: `8px solid ${color}`, background: C.gray, fontSize: "clamp(17px, 2.5vw, 21px)", fontWeight: 800, fontFamily: FH, color: C.navy, lineHeight: 1.4, fontStyle: "italic", position: "relative" }}>
      <span aria-hidden="true" style={{ position: "absolute", top: -8, left: 14, fontSize: 56, color, opacity: 0.15, lineHeight: 1, fontStyle: "normal" }}>&ldquo;</span>
      {text}
    </div>
  );
}

function MistakeCard({ number, title, desc, color }: { number: string; title: string; desc: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "18px 20px", background: "#fff", border: `3px solid ${color}33`, marginBottom: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${color}18`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FH, fontSize: 14, fontWeight: 900, color, flexShrink: 0 }}>{number}</div>
      <div>
        <p style={{ fontWeight: 800, fontSize: 15, color: C.navy, marginBottom: 3 }}>{title}</p>
        <p style={{ fontSize: 13, color: `${C.navy}99`, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Invoice comparison ──
function InvoiceComparison() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16, margin: "32px 0" }}>
      <div style={{ border: `3px solid ${C.coral}`, padding: 20, background: "#FFF5F5", position: "relative" }}>
        <div style={{ position: "absolute", top: -12, left: 16, background: C.coral, color: "#fff", padding: "3px 12px", fontSize: 11, fontWeight: 900, fontFamily: FH }}>❌ WHATSAPP MESSAGE</div>
        <div style={{ background: "#E8F5E9", borderRadius: 12, padding: "14px 18px", marginTop: 10, fontSize: 14, color: "#333", lineHeight: 1.6, fontWeight: 500 }}>
          Modular kitchen 2.5L + hardware 80K + labour 40K = 3.7L.<br />30% advance = 1.11L<br />UPI: xyz@oksbi
        </div>
        <p style={{ fontSize: 11, color: C.coral, fontWeight: 700, marginTop: 10 }}>No items breakdown. No GST. No due date. Looks informal.</p>
      </div>
      <div style={{ border: `3px solid ${C.teal}`, padding: 20, background: "#F0FDFA", position: "relative" }}>
        <div style={{ position: "absolute", top: -12, left: 16, background: C.teal, color: "#fff", padding: "3px 12px", fontSize: 11, fontWeight: 900, fontFamily: FH }}>✅ PROFESSIONAL PDF INVOICE</div>
        <div style={{ background: "#fff", border: `2px solid ${C.navy}`, padding: "14px 18px", marginTop: 10, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, borderBottom: `1px solid ${C.navy}22`, paddingBottom: 6 }}>
            <span style={{ fontWeight: 900, fontSize: 14, fontFamily: FH }}>INVOICE</span>
            <span style={{ fontSize: 10, color: "#999" }}>#INV-042</span>
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}><strong>Rajesh Kumar</strong> · Due: 15 April 2026</div>
          {[
            { item: "Modular Kitchen", qty: "×1", amt: "₹2,50,000" },
            { item: "Hardware (Hettich)", qty: "×1 set", amt: "₹80,000" },
            { item: "Labour", qty: "—", amt: "₹40,000" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: i < 2 ? "1px dashed #eee" : "none" }}>
              <span>{l.item} <span style={{ color: "#999" }}>{l.qty}</span></span>
              <span style={{ fontWeight: 700 }}>{l.amt}</span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.navy}33`, marginTop: 6, paddingTop: 4, fontSize: 11, display: "flex", justifyContent: "space-between", color: "#999" }}>
            <span>CGST (9%)</span><span>₹33,300</span>
          </div>
          <div style={{ fontSize: 11, display: "flex", justifyContent: "space-between", color: "#999", paddingBottom: 6, borderBottom: `2px solid ${C.navy}` }}>
            <span>SGST (9%)</span><span>₹33,300</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}>
            <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: 1 }}>TOTAL</span>
            <span style={{ fontWeight: 900, fontSize: 18, color: C.coral, fontFamily: FH }}>₹4,36,600</span>
          </div>
        </div>
        <p style={{ fontSize: 11, color: C.teal, fontWeight: 700, marginTop: 10 }}>Itemized, GST included, due date set. Looks trustworthy.</p>
      </div>
    </div>
  );
}

// ── Annotated invoice diagram ──
function InvoiceChecklist() {
  const fields = [
    { num: "1", label: "Business name & logo", note: "Even if solo — looks professional", color: C.coral },
    { num: "2", label: "GSTIN", note: "Required above ₹20L turnover", color: C.teal },
    { num: "3", label: "SAC Code", note: "Interior design: 998533 or 998539", color: C.gold },
    { num: "4", label: "Client name & address", note: "Full legal name for records", color: C.navy },
    { num: "5", label: "Invoice number", note: "Sequential: INV-001, INV-002... never duplicate", color: C.coral },
    { num: "6", label: "Invoice date & due date", note: "\"Jab ho sake\" is NOT a due date", color: C.teal },
    { num: "7", label: "Itemized services with qty & rate", note: "Each item separately — not one lump sum", color: C.gold },
    { num: "8", label: "GST breakdown", note: "CGST+SGST (same state) or IGST (different state)", color: C.navy },
    { num: "9", label: "Total amount", note: "Bold, big, impossible to miss", color: C.coral },
    { num: "10", label: "Payment details", note: "Bank account OR UPI ID. QR code if possible", color: C.teal },
  ];

  return (
    <div style={{ margin: "32px 0", background: "#fff", border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.gold), overflow: "hidden" }}>
      <div style={{ background: C.navy, padding: "14px 24px", color: "#fff", fontFamily: FH, fontWeight: 900, fontSize: 16, display: "flex", alignItems: "center", gap: 8 }}>
        <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20 }}>checklist</span>
        Invoice Checklist — 10 Required Fields
      </div>
      <div style={{ padding: "8px 0" }}>
        {fields.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 24px", borderBottom: i < fields.length - 1 ? `1px solid ${C.gray}` : "none" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${f.color}18`, border: `2px solid ${f.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FH, fontSize: 12, fontWeight: 900, color: f.color, flexShrink: 0 }}>{f.num}</div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 14, color: C.navy }}>{f.label}</p>
              <p style={{ fontSize: 12, color: `${C.navy}88`, marginTop: 1 }}>{f.note}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Chat flow mockup ──
function ChatFlowMockup() {
  return (
    <div style={{ margin: "32px 0", background: C.gray, border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.teal), padding: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 900, color: C.teal, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, fontFamily: FH }}>HOW IT WORKS IN SELLNSETTLE</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Step 1 */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: C.navy, color: "#fff", padding: "10px 16px", borderRadius: "16px 16px 4px 16px", fontSize: 14, fontWeight: 500, maxWidth: "85%" }}>
            <span style={{ color: C.gold }}>@Anjali</span> ka invoice banao — <span style={{ color: C.gold }}>@ModularKitchen</span> ×2, <span style={{ color: C.gold }}>@HettichHardware</span> ×4
          </div>
        </div>
        {/* Step 2 */}
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div style={{ background: "#fff", border: `3px solid ${C.navy}`, padding: "12px 16px", borderRadius: "16px 16px 16px 4px", fontSize: 13, boxShadow: shadow(3, 3, C.gold), maxWidth: "85%" }}>
            <p style={{ fontWeight: 800, color: C.navy, marginBottom: 6 }}>Invoice #043 ready ✅</p>
            <div style={{ fontSize: 12, color: `${C.navy}88`, lineHeight: 1.5 }}>
              Modular Kitchen ×2 — ₹2,50,000<br />
              Hettich Hardware ×4 — ₹92,000<br />
              <strong style={{ color: C.navy }}>Total: ₹3,42,000</strong> (incl. GST)
            </div>
          </div>
        </div>
        {/* Step 3 */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "#fff", border: `2px solid ${C.navy}`, borderRadius: 100, padding: "6px 16px", fontSize: 13, fontWeight: 800, color: C.navy, display: "flex", alignItems: "center", gap: 6 }}>
            📄 PDF
          </div>
          <div style={{ background: "#25D366", border: `2px solid ${C.navy}`, borderRadius: 100, padding: "6px 16px", fontSize: 13, fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
            📱 WhatsApp
          </div>
        </div>
        <p style={{ fontSize: 12, color: `${C.navy}66`, fontWeight: 600, fontStyle: "italic" }}>30 seconds. Done. Client ko professional invoice pahunch gaya.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════
// MAIN POST COMPONENT
// ═══════════════════════════════
export default function Post2Content() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0" rel="stylesheet" />

      {/* ═══ HERO ═══ */}
      <div style={{ background: C.navy, padding: "100px 32px 60px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: -50, right: -80, width: 320, height: 320, borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", background: `${C.gold}22` }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -30, left: -50, width: 220, height: 220, borderRadius: "50%", background: `${C.teal}15` }} />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <nav className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>{" / "}
            <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>Blog</Link>{" / "}
            <span style={{ color: "rgba(255,255,255,0.6)" }}>Invoice Guide</span>
          </nav>

          <div style={{ display: "inline-block", background: C.coral, color: "#fff", padding: "4px 14px", fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: FH, marginBottom: 20, border: `2px solid ${C.navy}` }}>
            Invoicing
          </div>

          <h1 style={{ fontFamily: FH, fontSize: "clamp(26px, 5vw, 46px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 12 }}>
            How to Send a <span style={{ color: C.gold }}>Professional Invoice</span> as an Interior Designer
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 20 }}>
            Free GST format included. Stop sending WhatsApp messages as bills.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600 }}>
            <time dateTime="2026-04-14">April 14, 2026</time>
            <span>·</span>
            <span>7 min read</span>
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Intro */}
        <p style={{ fontSize: 18, lineHeight: 1.8, color: `${C.navy}cc`, fontWeight: 500, marginBottom: 16 }}>
          &ldquo;Kaam ho gaya, payment maango&rdquo; — yeh approach bahut common hai. But <em>how</em> you ask for payment matters as much as the work itself.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: `${C.navy}aa`, fontWeight: 500, marginBottom: 16 }}>
          A WhatsApp message saying &ldquo;modular kitchen 2.5L, UPI bhej do&rdquo; is not an invoice — it&apos;s a text. And it makes you look like you&apos;re not running a real business.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: `${C.navy}aa`, fontWeight: 500, marginBottom: 32 }}>
          This post covers exactly what your invoice should include, common mistakes to avoid, and how to create one in 30 seconds.
        </p>

        <BlobDivider color={C.gold} />

        {/* ─── SECTION 1 ─── */}
        <div style={{ background: "#fff", border: `4px solid ${C.navy}`, boxShadow: shadow(8, 8, C.coral), padding: 0, overflow: "hidden", marginBottom: 48 }}>
          <div style={{ background: C.coral, padding: "18px 24px", borderBottom: `4px solid ${C.navy}` }}>
            <h2 style={{ fontFamily: FH, fontSize: "clamp(18px, 3vw, 24px)", fontWeight: 900, color: "#fff", margin: 0 }}>
              Why WhatsApp messages and handwritten bills hurt you
            </h2>
          </div>
          <div style={{ padding: "24px 28px", fontSize: 16, lineHeight: 1.75, color: `${C.navy}dd`, fontWeight: 500 }}>
            <InvoiceComparison />

            <p style={{ marginTop: 16 }}>Three problems with informal billing:</p>

            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { icon: "🙈", title: "Client doesn't take it seriously", desc: "A text is easy to ignore. A PDF with your logo and due date feels like a real obligation." },
                { icon: "📉", title: "You look unprofessional", desc: "The designer who sends a branded PDF gets the next project referral. The one who sends a text doesn't." },
                { icon: "⚖️", title: "No record for disputes", desc: "\"Maine toh 2.5 lakh bola tha, 3 nahi\" — agar invoice nahi hai, toh proof nahi hai." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 16px", background: C.gray }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 15, color: C.navy }}>{item.title}</p>
                    <p style={{ fontSize: 13, color: `${C.navy}99`, marginTop: 2 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── SECTION 2 ─── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: FH, fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 900, color: C.navy, marginBottom: 12 }}>
            What a professional interior design invoice <span style={{ color: C.teal }}>must include</span>
          </h2>
          <p style={{ fontSize: 15, color: `${C.navy}99`, marginBottom: 8 }}>
            10 fields. Miss any one and your invoice is incomplete.
          </p>
          <InvoiceChecklist />
        </div>

        <PullQuote text="Invoice number, due date, aur itemized pricing — yeh teen cheezein sabse zyada miss hoti hain. In teen ko fix karo, 80% problem solve." color={C.teal} />

        <BlobDivider color={C.teal} flip />

        {/* ─── SECTION 3 ─── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: FH, fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 900, color: C.navy, marginBottom: 16 }}>
            5 common <span style={{ color: C.coral }}>invoice mistakes</span> interior designers make
          </h2>

          <MistakeCard number="1" title="No invoice number" desc="'Woh invoice... kaunsa tha?' problem. Sequential numbers (INV-001, 002...) make everything trackable." color={C.coral} />
          <MistakeCard number="2" title="Vague descriptions" desc='"Interior work — ₹3.7L" tells the client nothing. Itemize: material, labour, hardware — separately.' color={C.gold} />
          <MistakeCard number="3" title="Missing due date" desc="If you don't set one, the client assumes 'koi jaldi nahi hai.' Always set a specific date." color={C.teal} />
          <MistakeCard number="4" title="Wrong GST calculation" desc="18% GST on interior design services. Calculate on the base amount, not on the total after adding GST." color={C.navy} />
          <MistakeCard number="5" title="Not sending a PDF" desc="Excel files get corrupted. WhatsApp messages get buried. PDF is permanent, shareable, and professional." color={C.coral} />
        </div>

        <BlobDivider color={C.coral} />

        {/* ─── SECTION 4 ─── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: FH, fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 900, color: C.navy, marginBottom: 16 }}>
            Create and send an invoice in <span style={{ color: C.gold }}>30 seconds</span>
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: `${C.navy}aa`, fontWeight: 500, marginBottom: 8 }}>
            If invoicing takes 20 minutes, you&apos;ll skip it. If it takes 30 seconds, you&apos;ll do it every time. That&apos;s the real fix — make invoicing so easy there&apos;s no excuse to delay it.
          </p>

          <ChatFlowMockup />

          <p style={{ fontSize: 15, lineHeight: 1.8, color: `${C.navy}99`, fontWeight: 500, marginTop: 16 }}>
            If you&apos;re not using SellNSettle, the manual approach works too: open your template (Excel/Word), fill in details, export as PDF, send on WhatsApp. The key is — <strong>do it the same day the milestone is complete.</strong> The closer the invoice is to the work, the faster the payment.
          </p>
        </div>

        <BlobDivider color={C.gold} flip />

        {/* ═══ CTA ═══ */}
        <div style={{ background: C.gray, border: `4px solid ${C.navy}`, padding: "36px 32px", boxShadow: shadow(8, 8, C.teal), marginTop: 48 }}>
          <h2 style={{ fontFamily: FH, fontSize: 24, fontWeight: 900, color: C.navy, marginBottom: 16 }}>How SellNSettle helps</h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: `${C.navy}bb`, fontWeight: 500, marginBottom: 20 }}>
            <Link href="/" style={{ color: C.teal, fontWeight: 700 }}>SellNSettle</Link> is a <strong>chat-first CRM</strong> built for Indian small businesses. For invoicing specifically:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              { t: "Chat to create", d: "\"@Rajesh ka invoice banao, @ModularKitchen ×2\" — AI creates it with items, quantities, and amounts." },
              { t: "GST auto-calculated", d: "Add your GSTIN in settings. AI handles CGST/SGST breakdown automatically." },
              { t: "One-tap PDF", d: "Generate a branded PDF invoice with your business name, logo, and payment details." },
              { t: "One-tap WhatsApp share", d: "Share the actual PDF file on WhatsApp — not a link, not a screenshot, the real document." },
              { t: "All invoices stored", d: "Search \"Rajesh ke invoices\" anytime. No more digging through WhatsApp chats." },
              { t: "Hindi, English, Hinglish", d: "Chat in whatever language you think in. AI understands all three." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "#fff", border: `2px solid ${C.navy}22` }}>
                <span style={{ color: C.teal, fontWeight: 900, fontSize: 16, flexShrink: 0 }}>✓</span>
                <div>
                  <strong style={{ color: C.navy, fontSize: 14 }}>{item.t}:</strong>{" "}
                  <span style={{ color: `${C.navy}99`, fontSize: 14 }}>{item.d}</span>
                </div>
              </div>
            ))}
          </div>

          <Link href="/register" style={{
            display: "inline-block", background: C.coral, color: "#fff",
            padding: "16px 32px", fontWeight: 900, fontSize: 18,
            border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.navy),
            textDecoration: "none", fontFamily: FH,
          }}>
            Try SellNSettle free — no card needed →
          </Link>
        </div>

        {/* ═══ RELATED ═══ */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `4px solid ${C.gray}` }}>
          <h3 style={{ fontFamily: FH, fontWeight: 900, fontSize: 20, color: C.navy, marginBottom: 16 }}>Related articles</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { href: "/blog/interior-design-client-management-tips", title: "Interior Design Client Management: 7 Tips That Actually Work", color: C.coral },
              { href: "/blog/follow-up-kaise-karein-lead-miss-na-ho", title: "Follow-up Kaise Karein Taaki Lead Miss Na Ho", color: C.teal },
              { href: "/blog/gst-invoice-format-interior-designer-free-template", title: "GST Invoice Format for Interior Designers — Free Template Download", color: C.gold },
            ].map((post) => (
              <Link key={post.href} href={post.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", border: `3px solid ${C.navy}22`, textDecoration: "none", color: C.navy, fontWeight: 700, fontSize: 15 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: post.color, flexShrink: 0 }} />
                {post.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}