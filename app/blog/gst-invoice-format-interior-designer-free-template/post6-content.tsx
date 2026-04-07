"use client";

import { useState } from "react";
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

type Lang = "hi" | "en";

// ── Blob divider ──
function BlobDivider({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <div aria-hidden="true" style={{ width: "100%", height: 90, display: "flex", justifyContent: flip ? "flex-end" : "flex-start", alignItems: "center", overflow: "hidden", opacity: 0.12 }}>
      <svg width="380" height="90" viewBox="0 0 380 90" fill="none">
        <ellipse cx={flip ? 280 : 100} cy="45" rx="190" ry="45" fill={color} style={{ transform: flip ? "rotate(-6deg)" : "rotate(6deg)" }} />
        <circle cx={flip ? 130 : 270} cy="30" r="22" fill={color} opacity="0.5" />
      </svg>
    </div>
  );
}

// ── Pull quote ──
function PullQuote({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ margin: "40px 0", padding: "22px 26px", borderLeft: `8px solid ${color}`, background: C.gray, fontSize: "clamp(16px, 2.3vw, 20px)", fontWeight: 800, fontFamily: FH, color: C.navy, lineHeight: 1.4, fontStyle: "italic", position: "relative" }}>
      <span aria-hidden="true" style={{ position: "absolute", top: -8, left: 12, fontSize: 52, color, opacity: 0.15, lineHeight: 1, fontStyle: "normal" }}>&ldquo;</span>
      {text}
    </div>
  );
}

// ── Tip card ──
function TipCard({ number, title, icon, color, shadowColor, children }: { number: string; title: string; icon: string; color: string; shadowColor: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: `4px solid ${C.navy}`, boxShadow: shadow(8, 8, shadowColor), overflow: "hidden", marginBottom: 48 }}>
      <div style={{ background: color, padding: "18px 24px", display: "flex", alignItems: "center", gap: 14, borderBottom: `4px solid ${C.navy}` }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#fff", border: `3px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FH, fontSize: 22, fontWeight: 900, color: C.navy, flexShrink: 0, boxShadow: shadow(3, 3, C.navy) }}>{number}</div>
        <div>
          <span className="material-symbols-outlined" style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: color === C.navy ? "#fff" : C.navy, opacity: 0.5, display: "block", marginBottom: 2 }}>{icon}</span>
          <h2 style={{ fontFamily: FH, fontSize: "clamp(16px, 2.8vw, 22px)", fontWeight: 900, color: color === C.navy ? "#fff" : C.navy, lineHeight: 1.2, margin: 0 }}>{title}</h2>
        </div>
      </div>
      <div style={{ padding: "22px 26px", fontSize: 15, lineHeight: 1.75, color: `${C.navy}dd`, fontWeight: 500 }}>{children}</div>
    </div>
  );
}

// ── Mistake card ──
function MistakeCard({ number, title, desc, color }: { number: string; title: string; desc: string; color: string }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "16px 18px", background: "#fff", border: `3px solid ${color}`, position: "relative", marginBottom: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${color}18`, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FH, fontSize: 14, fontWeight: 900, color, flexShrink: 0 }}>{number}</div>
      <div>
        <p style={{ fontWeight: 800, fontSize: 15, color: C.navy, marginBottom: 4 }}>{title}</p>
        <p style={{ fontSize: 13, color: `${C.navy}99`, lineHeight: 1.55 }}>{desc}</p>
      </div>
    </div>
  );
}

// ── Language toggle ──
function LangToggle({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button onClick={onToggle} aria-label="Toggle language" style={{ position: "fixed", bottom: 20, right: 20, zIndex: 60, background: C.navy, color: "#fff", border: "none", borderRadius: 100, padding: "10px 18px", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: FH, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 6px 24px rgba(0,0,0,0.25)" }}>
      <span style={{ width: 34, height: 20, borderRadius: 10, background: "rgba(255,255,255,0.15)", position: "relative", display: "inline-block" }}>
        <span style={{ position: "absolute", top: 3, left: lang === "en" ? 3 : 17, width: 14, height: 14, borderRadius: "50%", background: C.teal, transition: "left 0.25s ease" }} />
      </span>
      {lang === "en" ? "EN" : "हिं"}
    </button>
  );
}

// ── GST info card ──
function GSTInfoCard({ lang }: { lang: Lang }) {
  return (
    <div style={{ margin: "24px 0", background: "#fff", border: `3px solid ${C.teal}`, overflow: "hidden" }}>
      <div style={{ background: C.navy, padding: "10px 20px", fontSize: 11, fontWeight: 900, color: C.teal, letterSpacing: 1.5, fontFamily: FH }}>
        {lang === "hi" ? "GST AT A GLANCE — INTERIOR DESIGN" : "GST AT A GLANCE — INTERIOR DESIGN"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {[
          { label: lang === "hi" ? "SAC Code" : "SAC Code", value: "998533", sub: lang === "hi" ? "Interior design services" : "Interior design services" },
          { label: lang === "hi" ? "GST Rate" : "GST Rate", value: "18%", sub: lang === "hi" ? "CGST 9% + SGST 9%" : "CGST 9% + SGST 9%" },
          { label: lang === "hi" ? "Registration threshold" : "Registration threshold", value: "₹20L", sub: lang === "hi" ? "₹10L special category states" : "₹10L special category states" },
          { label: lang === "hi" ? "Inter-state billing" : "Inter-state billing", value: "IGST", sub: lang === "hi" ? "18% as single tax" : "18% as single tax" },
        ].map((item, i) => (
          <div key={i} style={{ padding: "16px 20px", borderBottom: i < 2 ? `2px solid ${C.gray}` : "none", borderRight: i % 2 === 0 ? `2px solid ${C.gray}` : "none" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: `${C.navy}77`, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.label}</div>
            <div style={{ fontFamily: FH, fontSize: 22, fontWeight: 900, color: C.teal, marginBottom: 2 }}>{item.value}</div>
            <div style={{ fontSize: 12, color: `${C.navy}88`, fontWeight: 600 }}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GST checklist ──
function GSTChecklist({ lang }: { lang: Lang }) {
  const fields = lang === "hi"
    ? [
        { label: "Business ka naam aur address", required: true },
        { label: "GSTIN (15-digit GST number)", required: true },
        { label: "Invoice number (sequential — INV-001, INV-002...)", required: true },
        { label: "Invoice date", required: true },
        { label: "Client ka naam aur address", required: true },
        { label: "Client ka GSTIN (agar registered hain)", required: false },
        { label: "SAC code — 998533 (interior design services)", required: true },
        { label: "Description of services / items", required: true },
        { label: "Quantity aur rate per item", required: true },
        { label: "Taxable amount (GST se pehle)", required: true },
        { label: "CGST 9% + SGST 9% (intra-state) ya IGST 18% (inter-state)", required: true },
        { label: "Total amount (tax ke baad)", required: true },
        { label: "Payment details — UPI ID ya bank account", required: false },
        { label: "Due date", required: false },
      ]
    : [
        { label: "Your business name and address", required: true },
        { label: "GSTIN (your 15-digit GST number)", required: true },
        { label: "Invoice number (sequential — INV-001, INV-002...)", required: true },
        { label: "Invoice date", required: true },
        { label: "Client's name and address", required: true },
        { label: "Client's GSTIN (if GST registered)", required: false },
        { label: "SAC code — 998533 (interior design services)", required: true },
        { label: "Description of services / line items", required: true },
        { label: "Quantity and rate per item", required: true },
        { label: "Taxable amount (before GST)", required: true },
        { label: "CGST 9% + SGST 9% (intra-state) or IGST 18% (inter-state)", required: true },
        { label: "Total amount (after tax)", required: true },
        { label: "Payment details — UPI ID or bank account", required: false },
        { label: "Due date", required: false },
      ];

  return (
    <div style={{ margin: "20px 0", background: "#fff", border: `3px solid ${C.navy}`, overflow: "hidden" }}>
      <div style={{ background: C.navy, padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: C.teal, letterSpacing: 1.5, fontFamily: FH }}>
          {lang === "hi" ? "GST INVOICE CHECKLIST" : "GST INVOICE CHECKLIST"}
        </span>
        <div style={{ display: "flex", gap: 12, fontSize: 11, fontWeight: 700 }}>
          <span style={{ color: C.coral }}>● {lang === "hi" ? "Mandatory" : "Mandatory"}</span>
          <span style={{ color: `rgba(255,255,255,0.4)` }}>● {lang === "hi" ? "Recommended" : "Recommended"}</span>
        </div>
      </div>
      {fields.map((f, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < fields.length - 1 ? `1px solid ${C.gray}` : "none", background: i % 2 === 0 ? "#fff" : `${C.gray}66` }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: f.required ? C.coral : `${C.navy}33`, flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: C.navy, lineHeight: 1.4 }}>{f.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Sample GST invoice mockup ──
function SampleInvoice({ lang }: { lang: Lang }) {
  return (
    <div style={{ margin: "24px 0", background: "#fff", border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.gold), overflow: "hidden" }}>
      {/* Invoice header */}
      <div style={{ background: C.navy, padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: FH, fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 2 }}>TAX INVOICE</div>
          <div style={{ fontSize: 11, color: `rgba(255,255,255,0.5)`, fontWeight: 600 }}>#INV-2024-047</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: FH, fontSize: 13, fontWeight: 900, color: C.gold }}>Priya Interiors</div>
          <div style={{ fontSize: 11, color: `rgba(255,255,255,0.5)`, marginTop: 2 }}>Jaipur, Rajasthan</div>
          <div style={{ fontSize: 10, color: C.teal, marginTop: 2, fontWeight: 700 }}>GSTIN: 08AABCP1234K1Z5</div>
        </div>
      </div>

      {/* Client + dates */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `2px solid ${C.navy}22` }}>
        <div style={{ padding: "14px 22px", borderRight: `1px solid ${C.navy}22` }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: `${C.navy}66`, letterSpacing: 1, marginBottom: 6, fontFamily: FH }}>{lang === "hi" ? "BILL TO" : "BILL TO"}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>Anjali & Rohan Mehta</div>
          <div style={{ fontSize: 12, color: `${C.navy}88`, marginTop: 2 }}>Vaishali Nagar, Jaipur</div>
        </div>
        <div style={{ padding: "14px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: `${C.navy}66`, fontWeight: 700 }}>{lang === "hi" ? "Invoice Date" : "Invoice Date"}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.navy }}>10 April 2026</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: `${C.navy}66`, fontWeight: 700 }}>{lang === "hi" ? "Due Date" : "Due Date"}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.coral }}>25 April 2026</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: `${C.navy}66`, fontWeight: 700 }}>SAC</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.teal }}>998533</span>
          </div>
        </div>
      </div>

      {/* Line items */}
      <div style={{ padding: "0 22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 90px", gap: 8, padding: "10px 0", borderBottom: `2px solid ${C.navy}`, fontSize: 10, fontWeight: 900, color: `${C.navy}77`, letterSpacing: 0.5, fontFamily: FH }}>
          <span>{lang === "hi" ? "DESCRIPTION" : "DESCRIPTION"}</span>
          <span style={{ textAlign: "right" }}>{lang === "hi" ? "QTY" : "QTY"}</span>
          <span style={{ textAlign: "right" }}>{lang === "hi" ? "RATE" : "RATE"}</span>
          <span style={{ textAlign: "right" }}>{lang === "hi" ? "AMOUNT" : "AMOUNT"}</span>
        </div>
        {[
          { desc: lang === "hi" ? "Modular Kitchen Design + Execution" : "Modular Kitchen Design + Execution", qty: "1", rate: "₹2,50,000", amt: "₹2,50,000" },
          { desc: lang === "hi" ? "Hardware — Hettich fittings" : "Hardware — Hettich fittings", qty: "1 set", rate: "₹80,000", amt: "₹80,000" },
          { desc: lang === "hi" ? "Labour charges" : "Labour charges", qty: "—", rate: "₹40,000", amt: "₹40,000" },
        ].map((item, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 90px 90px", gap: 8, padding: "10px 0", borderBottom: `1px dashed ${C.navy}18`, fontSize: 13, color: C.navy }}>
            <span style={{ fontWeight: 600 }}>{item.desc}</span>
            <span style={{ textAlign: "right", color: `${C.navy}88` }}>{item.qty}</span>
            <span style={{ textAlign: "right", color: `${C.navy}88` }}>{item.rate}</span>
            <span style={{ textAlign: "right", fontWeight: 700 }}>{item.amt}</span>
          </div>
        ))}
      </div>

      {/* Tax breakdown */}
      <div style={{ padding: "12px 22px", borderTop: `2px solid ${C.navy}22`, background: C.gray }}>
        {[
          { label: lang === "hi" ? "Subtotal (taxable amount)" : "Subtotal (taxable amount)", value: "₹3,70,000", bold: false },
          { label: "CGST @ 9%", value: "₹33,300", bold: false },
          { label: "SGST @ 9%", value: "₹33,300", bold: false },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13, color: `${C.navy}bb`, fontWeight: row.bold ? 900 : 600 }}>
            <span>{row.label}</span>
            <span>{row.value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", borderTop: `2px solid ${C.navy}`, marginTop: 6, fontSize: 16, fontWeight: 900, color: C.navy, fontFamily: FH }}>
          <span>{lang === "hi" ? "TOTAL AMOUNT" : "TOTAL AMOUNT"}</span>
          <span style={{ color: C.coral }}>₹4,36,600</span>
        </div>
      </div>

      {/* Payment */}
      <div style={{ padding: "12px 22px 16px", borderTop: `2px solid ${C.navy}22` }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: `${C.navy}66`, letterSpacing: 1, marginBottom: 8, fontFamily: FH }}>{lang === "hi" ? "PAYMENT DETAILS" : "PAYMENT DETAILS"}</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>UPI: priya@oksbi</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: `${C.navy}77` }}>A/C: 1234567890 · IFSC: SBIN0001234</span>
        </div>
      </div>
    </div>
  );
}

// ── Chat flow mockup ──
function ChatFlowMockup({ lang }: { lang: Lang }) {
  const steps = lang === "hi"
    ? [
        { type: "user", text: "GST invoice banao @Anjali — modular kitchen 2.5L, hardware 80K, labour 40K, SAC 998533" },
        { type: "ai", text: "Invoice #047 ready — ₹3,70,000 + 18% GST = ₹4,36,600. CGST ₹33,300 + SGST ₹33,300 automatically calculate hua." },
        { type: "chips", chips: ["PDF Generate", "WhatsApp Share", "Edit"] },
      ]
    : [
        { type: "user", text: "Create GST invoice for @Anjali — modular kitchen 2.5L, hardware 80K, labour 40K, SAC 998533" },
        { type: "ai", text: "Invoice #047 ready — ₹3,70,000 + 18% GST = ₹4,36,600. CGST ₹33,300 + SGST ₹33,300 calculated automatically." },
        { type: "chips", chips: ["Generate PDF", "Share on WhatsApp", "Edit"] },
      ];

  return (
    <div style={{ margin: "20px 0", background: "#fff", border: `3px solid ${C.navy}`, overflow: "hidden" }}>
      <div style={{ background: C.navy, padding: "10px 18px", fontSize: 11, fontWeight: 900, color: C.teal, letterSpacing: 1.5, fontFamily: FH }}>
        {lang === "hi" ? "SELLNSETTLE — CHAT SE GST INVOICE" : "SELLNSETTLE — GST INVOICE VIA CHAT"}
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {steps.map((step, i) => {
          if (step.type === "user") return (
            <div key={i} style={{ alignSelf: "flex-end", background: `${C.teal}15`, border: `2px solid ${C.teal}33`, borderRadius: "12px 12px 2px 12px", padding: "10px 14px", maxWidth: "85%", fontSize: 13, fontWeight: 600, color: C.navy, lineHeight: 1.5, fontStyle: "italic" }}>
              &ldquo;{step.text}&rdquo;
            </div>
          );
          if (step.type === "ai") return (
            <div key={i} style={{ alignSelf: "flex-start", background: `${C.navy}06`, border: `2px solid ${C.navy}15`, borderRadius: "12px 12px 12px 2px", padding: "10px 14px", maxWidth: "85%", fontSize: 13, fontWeight: 600, color: C.navy, lineHeight: 1.5 }}>
              🤖 {step.text}
            </div>
          );
          if (step.type === "chips") return (
            <div key={i} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {step.chips!.map((chip, j) => (
                <div key={j} style={{ padding: "6px 14px", background: j === 0 ? C.coral : j === 1 ? "#128C7E" : `${C.navy}10`, color: j < 2 ? "#fff" : C.navy, border: `2px solid ${j === 0 ? C.coral : j === 1 ? "#128C7E" : `${C.navy}22`}`, fontSize: 12, fontWeight: 800, borderRadius: 4, fontFamily: FH }}>
                  {chip}
                </div>
              ))}
            </div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

// ═══════════════════════
// MAIN
// ═══════════════════════

export default function Post6Content() {
  const [lang, setLang] = useState<Lang>("en");
  const t = (en: string, hi: string) => lang === "en" ? en : hi;

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0" rel="stylesheet" />
      <LangToggle lang={lang} onToggle={() => setLang(l => l === "en" ? "hi" : "en")} />

      {/* ═══ HERO ═══ */}
      <div style={{ background: C.navy, padding: "100px 32px 60px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: -50, right: -70, width: 300, height: 300, borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", background: `${C.gold}22` }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -30, left: -50, width: 200, height: 200, borderRadius: "50%", background: `${C.teal}15` }} />
        <div aria-hidden="true" style={{ position: "absolute", top: "40%", right: "30%", width: 120, height: 120, borderRadius: "50%", background: `${C.coral}10` }} />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <nav className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>{" / "}
            <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>Blog</Link>{" / "}
            <span style={{ color: "rgba(255,255,255,0.6)" }}>GST Invoicing</span>
          </nav>

          <div style={{ display: "inline-block", background: C.gold, color: C.navy, padding: "4px 14px", fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: FH, marginBottom: 20, border: `2px solid ${C.navy}` }}>
            Invoicing
          </div>

          <h1 style={{ fontFamily: FH, fontSize: "clamp(26px, 5vw, 46px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 12 }}>
            {t("GST Invoice Format for Interior Designers — ", "Interior Designers ke liye GST Invoice Format — ")}
            <span style={{ color: C.gold }}>{t("Free Template", "Free Template")}</span>
          </h1>

          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 20, maxWidth: 560 }}>
            {t(
              "SAC code, 18% GST, mandatory fields, common mistakes — everything you need to send a legally correct GST invoice as an interior designer in India.",
              "SAC code, 18% GST, mandatory fields, common mistakes — interior designer ke liye legally correct GST invoice bhejne ki poori guide."
            )}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600 }}>
            <time dateTime="2026-04-28">April 28, 2026</time><span>·</span><span>6 min read</span>
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Intro */}
        <p style={{ fontSize: 17, lineHeight: 1.8, color: `${C.navy}cc`, fontWeight: 500, marginBottom: 16 }}>
          {t(
            "Most interior designers in India — especially those working solo or with a small team — send invoices as WhatsApp messages or basic Excel sheets. That works when you're starting out. But once your turnover crosses ₹20 lakhs, you're required to register for GST and send proper tax invoices.",
            "India mein zyaadatar interior designers — especially jo akele ya chhoti team ke saath kaam karte hain — invoices WhatsApp messages ya basic Excel sheets ke zariye bhejte hain. Starting mein yeh chalata hai. Lekin jab turnover ₹20 lakh cross kar jaata hai, GST registration aur proper tax invoice mandatory ho jaata hai."
          )}
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: `${C.navy}aa`, fontWeight: 500, marginBottom: 32 }}>
          {t(
            "And even before that threshold, sending a GST-compliant invoice makes you look more professional, helps clients with input tax credit, and keeps you out of trouble during audits. This guide covers everything — SAC code, mandatory fields, a sample invoice, and the most common mistakes.",
            "Aur us threshold se pehle bhi, GST-compliant invoice bhejne se aap zyaada professional dikhte ho, client ko input tax credit milta hai, aur audit ke waqt koi problem nahi hoti. Is guide mein sab kuch hai — SAC code, mandatory fields, sample invoice, aur common mistakes."
          )}
        </p>

        <PullQuote
          text={t(
            "A GST invoice isn't just a legal requirement — it's proof you run a real business.",
            "GST invoice sirf legal requirement nahi hai — yeh proof hai ki aap ek real business chalate ho."
          )}
          color={C.gold}
        />

        <BlobDivider color={C.gold} />

        {/* ─── TIP 1: GST requirements ─── */}
        <TipCard number="01" title={t("GST requirements for interior design services", "Interior design services ke liye GST requirements")} icon="receipt_long" color={C.teal} shadowColor={C.teal}>
          <p>
            {t(
              "Interior design services fall under SAC code 998533 — 'Architectural and interior design services.' The GST rate is 18%, split as CGST 9% + SGST 9% for intra-state work, or IGST 18% when billing a client in a different state.",
              "Interior design services SAC code 998533 ke under aati hain — 'Architectural and interior design services.' GST rate 18% hai — intra-state kaam ke liye CGST 9% + SGST 9%, aur doosre state mein billing ke liye IGST 18%."
            )}
          </p>
          <GSTInfoCard lang={lang} />
          <p>
            {t(
              "The registration threshold is ₹20 lakhs annual turnover. If you're in a special category state (J&K, Himachal, Uttarakhand, and others), the threshold is ₹10 lakhs. Once you cross it — mandatory registration, mandatory GST invoices.",
              "Registration threshold ₹20 lakh annual turnover hai. Special category states (J&K, Himachal, Uttarakhand, etc.) mein yeh ₹10 lakh hai. Threshold cross karte hi — registration mandatory, GST invoice mandatory."
            )}
          </p>
          <div style={{ marginTop: 16, padding: "14px 18px", background: `${C.gold}10`, border: `3px solid ${C.gold}`, fontSize: 14, fontWeight: 700, color: C.navy, lineHeight: 1.6 }}>
            💡 {t(
              "Even if you're below the threshold, you can register voluntarily — it lets your B2B clients claim input tax credit on your invoice, which makes you easier to work with.",
              "Threshold se neeche ho tab bhi voluntary registration kar sakte ho — isse B2B clients aapke invoice pe input tax credit claim kar sakte hain, jo unke liye faydemand hota hai."
            )}
          </div>
        </TipCard>

        {/* ─── TIP 2: Mandatory fields ─── */}
        <TipCard number="02" title={t("What a GST-compliant invoice must include", "GST-compliant invoice mein kya hona chahiye")} icon="checklist" color={C.gold} shadowColor={C.gold}>
          <p>
            {t(
              "A GST invoice has a specific set of mandatory fields. Miss any of them and the invoice is technically non-compliant — your client can't claim ITC on it, and you could face issues during a GST audit.",
              "GST invoice mein specific mandatory fields hote hain. Ek bhi miss ho toh invoice technically non-compliant ho jaata hai — client ITC claim nahi kar sakta, aur GST audit mein problem ho sakti hai."
            )}
          </p>
          <GSTChecklist lang={lang} />
          <p style={{ marginTop: 8 }}>
            {t(
              "The red dots are legally required. The rest are strongly recommended — payment details and due date aren't legally mandatory on the invoice itself, but leaving them out makes it harder to get paid on time.",
              "Red dots legally required hain. Baaki strongly recommended hain — payment details aur due date technically mandatory nahi hain invoice pe, lekin inhe chhod do toh time pe payment milna mushkil ho jaata hai."
            )}
          </p>
        </TipCard>

        <BlobDivider color={C.teal} flip />

        {/* ─── TIP 3: Sample invoice ─── */}
        <TipCard number="03" title={t("Sample GST invoice — interior designer, Jaipur", "Sample GST invoice — interior designer, Jaipur")} icon="description" color={C.coral} shadowColor={C.coral}>
          <p>
            {t(
              "Here's a realistic example. Priya Interiors (Jaipur) is billing Anjali & Rohan Mehta for a modular kitchen project — design, hardware, and labour.",
              "Yeh ek realistic example hai. Priya Interiors (Jaipur) Anjali & Rohan Mehta ko modular kitchen project ke liye bill kar rahi hai — design, hardware, aur labour."
            )}
          </p>
          <SampleInvoice lang={lang} />
          <p>
            {t(
              "Notice how GST is applied only on the taxable subtotal (₹3,70,000) — not on the total including GST. That's a common mistake we'll cover in the next section.",
              "Dhyan dein — GST sirf taxable subtotal (₹3,70,000) pe lagta hai — total including GST pe nahi. Yeh ek common mistake hai jo hum agli section mein cover karenge."
            )}
          </p>
        </TipCard>

        <PullQuote
          text={t(
            "GST is calculated on the base amount — not on itself. ₹3,70,000 × 18% = ₹66,600 tax. Not ₹4,36,600 × 18%.",
            "GST base amount pe calculate hota hai — apne aap pe nahi. ₹3,70,000 × 18% = ₹66,600 tax. ₹4,36,600 × 18% nahi."
          )}
          color={C.coral}
        />

        <BlobDivider color={C.coral} />

        {/* ─── TIP 4: Common mistakes ─── */}
        <TipCard number="04" title={t("4 common GST mistakes interior designers make", "Interior designers ki 4 common GST mistakes")} icon="error" color={C.navy} shadowColor={C.navy}>
          <p>
            {t(
              "These mistakes won't get you arrested, but they can invalidate your client's ITC claim, cause problems during audits, or just make you look careless.",
              "Yeh mistakes aapko arrest nahi karaengi, lekin client ka ITC claim invalid ho sakta hai, audit mein problem ho sakti hai, ya simply unprofessional dikh sakte ho."
            )}
          </p>
          <div style={{ marginTop: 20 }}>
            <MistakeCard
              number="01"
              color={C.coral}
              title={t("Charging 18% on the total including GST", "Total including GST pe 18% charge karna")}
              desc={t(
                "GST applies to the base (taxable) amount only. If your work costs ₹3,70,000, GST is ₹66,600. Not 18% of ₹4,36,600.",
                "GST sirf base (taxable) amount pe lagta hai. Agar kaam ₹3,70,000 ka hai, toh GST ₹66,600 hai. ₹4,36,600 ka 18% nahi."
              )}
            />
            <MistakeCard
              number="02"
              color={C.gold}
              title={t("Missing the SAC code", "SAC code nahi likhna")}
              desc={t(
                "SAC 998533 must appear on every invoice. Without it, the invoice is non-compliant and the client can't claim ITC.",
                "SAC 998533 har invoice pe hona chahiye. Iske bina invoice non-compliant hai aur client ITC claim nahi kar sakta."
              )}
            />
            <MistakeCard
              number="03"
              color={C.coral}
              title={t("Wrong GSTIN format or no GSTIN", "GSTIN format galat ya GSTIN hi nahi")}
              desc={t(
                "GSTIN is 15 characters: 2-digit state code + 10-digit PAN + 1 entity number + 1 check digit. Example: 08AABCP1234K1Z5. Verify it before printing.",
                "GSTIN 15 characters ka hota hai: 2-digit state code + 10-digit PAN + 1 entity number + 1 check digit. Example: 08AABCP1234K1Z5. Print karne se pehle verify karein."
              )}
            />
            <MistakeCard
              number="04"
              color={C.teal}
              title={t("Non-sequential invoice numbers", "Invoice numbers sequential nahi hain")}
              desc={t(
                "GST rules require sequential invoice numbers within a financial year. Gaps (INV-001, INV-003, INV-007) raise flags during audits. Don't skip or reuse numbers.",
                "GST rules mein ek financial year mein invoice numbers sequential hone chahiye. Gaps (INV-001, INV-003, INV-007) audit mein flag hote hain. Numbers skip ya reuse mat karein."
              )}
            />
          </div>
        </TipCard>

        <BlobDivider color={C.gold} flip />

        {/* ─── TIP 5: Create in 30 seconds ─── */}
        <TipCard number="05" title={t("Create a GST invoice in 30 seconds — via chat", "30 second mein GST invoice — chat se")} icon="bolt" color={C.gold} shadowColor={C.teal}>
          <p>
            {t(
              "Manually calculating CGST + SGST, filling in SAC codes, maintaining sequential numbers — it's all small but time-consuming. SellNSettle handles all of it automatically when you create an invoice by chat.",
              "CGST + SGST manually calculate karna, SAC code fill karna, sequential numbers maintain karna — yeh sab chhota kaam hai but time lagta hai. SellNSettle yeh sab automatically handle karta hai jab aap chat se invoice create karte ho."
            )}
          </p>
          <ChatFlowMockup lang={lang} />
          <p style={{ marginTop: 12 }}>
            {t(
              "The AI calculates GST on the taxable amount, splits it into CGST + SGST (or IGST for inter-state), and generates a PDF — all from a single chat message. Add your SAC code in catalog items — it auto-fills on every invoice. You just share the PDF on WhatsApp.",
              "AI taxable amount pe GST calculate karta hai, CGST + SGST mein split karta hai (inter-state ke liye IGST), aur PDF generate karta hai — ek single chat message se. Catalog items mein SAC code add karo — har invoice pe auto-fill ho jaata hai. Aap bas PDF WhatsApp pe share karo."
            )}
          </p>
          <div style={{ marginTop: 16, padding: "14px 18px", background: `${C.navy}06`, border: `3px solid ${C.navy}22`, fontSize: 14, fontWeight: 700, color: `${C.navy}bb`, lineHeight: 1.6 }}>
            {t(
              "If you prefer making invoices manually, that works too — use this post as a checklist and any PDF tool (Word, Canva, Excel) to build your template.",
              "Agar aap manually invoice banana prefer karte ho, woh bhi theek hai — is post ko checklist ki tarah use karein aur kisi bhi PDF tool (Word, Canva, Excel) se apna template banao."
            )}
          </div>
        </TipCard>

        <BlobDivider color={C.navy} />

        {/* ═══ CTA ═══ */}
        <div style={{ background: C.gray, border: `4px solid ${C.navy}`, padding: "36px 32px", boxShadow: shadow(8, 8, C.teal), marginTop: 48 }}>
          <h2 style={{ fontFamily: FH, fontSize: 24, fontWeight: 900, color: C.navy, marginBottom: 16 }}>
            {t("How SellNSettle handles GST invoicing", "SellNSettle mein GST invoicing kaise kaam karta hai")}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: `${C.navy}bb`, fontWeight: 500, marginBottom: 20 }}>
            <Link href="/" style={{ color: C.teal, fontWeight: 700 }}>SellNSettle</Link>{" "}
            {t(
              "is a chat-first CRM for Indian service businesses. Here's what it actually does for GST invoicing:",
              "Indian service businesses ke liye ek chat-first CRM hai. GST invoicing ke liye yeh actually kya karta hai:"
            )}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              t("Create invoices via chat — @mention the client, list items, rates", "Chat se invoice create karein — @mention client, items aur rates type karein"),
              t("GST automatically calculated on taxable amount — not on total", "GST automatically taxable amount pe calculate hota hai — total pe nahi"),
              t("CGST + SGST split handled for intra-state billing", "Intra-state billing ke liye CGST + SGST split automatic"),
              t("PDF generated with all mandatory fields — client name, GSTIN field, SAC code, line items, tax breakdown", "PDF mein sab mandatory fields — client naam, GSTIN field, SAC code, line items, tax breakdown"),
              t("Share PDF directly on WhatsApp in one tap", "PDF ek tap mein directly WhatsApp pe share karein"),
              t("Sequential invoice numbers maintained automatically", "Sequential invoice numbers automatically maintain hote hain"),
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "#fff", border: `2px solid ${C.navy}22` }}>
                <span style={{ color: C.teal, fontWeight: 900, fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ color: C.navy, fontSize: 14, fontWeight: 600 }}>{item}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: `${C.navy}77`, fontWeight: 600, marginBottom: 20 }}>
            {t(
              "Note: SellNSettle's invoice PDF includes a GSTIN field but does not validate your GSTIN against the GST portal. Always verify your GSTIN is entered correctly.",
              "Note: SellNSettle ke invoice PDF mein GSTIN field hota hai lekin yeh GST portal ke against validate nahi karta. Apna GSTIN correctly enter karna aapki responsibility hai."
            )}
          </p>
          <Link href="/register" style={{ display: "inline-block", background: C.coral, color: "#fff", padding: "16px 32px", fontWeight: 900, fontSize: 18, border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.navy), textDecoration: "none", fontFamily: FH }}>
            {t("Start your early access →", "Free mein shuru karo →")}
          </Link>
        </div>

        {/* ═══ RELATED ═══ */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `4px solid ${C.gray}` }}>
          <h3 style={{ fontFamily: FH, fontWeight: 900, fontSize: 20, color: C.navy, marginBottom: 16 }}>
            {t("Related articles", "Aur padhein")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { href: "/blog/how-to-send-professional-invoice-interior-designer", title: "How to Send a Professional Invoice as an Interior Designer", color: C.coral },
              { href: "/blog/whatsapp-invoice-bhejne-ka-tarika", title: "WhatsApp Pe Invoice Kaise Bhejein — Professional Tarike Se", color: C.teal },
              { href: "/blog/interior-design-client-management-tips", title: "Interior Design Client Management: 7 Tips That Actually Work", color: C.gold },
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
