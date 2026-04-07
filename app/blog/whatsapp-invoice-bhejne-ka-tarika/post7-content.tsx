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

function PullQuote({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ margin: "40px 0", padding: "22px 26px", borderLeft: `8px solid ${color}`, background: C.gray, fontSize: "clamp(16px, 2.3vw, 20px)", fontWeight: 800, fontFamily: FH, color: C.navy, lineHeight: 1.4, fontStyle: "italic", position: "relative" }}>
      <span aria-hidden="true" style={{ position: "absolute", top: -8, left: 12, fontSize: 52, color, opacity: 0.15, lineHeight: 1, fontStyle: "normal" }}>&ldquo;</span>
      {text}
    </div>
  );
}

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

function ScriptCard({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div style={{ background: "#fff", border: `3px solid ${color}`, padding: "16px 20px", position: "relative", marginBottom: 12 }}>
      <div style={{ position: "absolute", top: -10, left: 14, background: color, color: "#fff", padding: "2px 10px", fontSize: 10, fontWeight: 900, fontFamily: FH }}>{label}</div>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: C.navy, fontWeight: 500, fontStyle: "italic", marginTop: 4 }}>&ldquo;{text}&rdquo;</p>
    </div>
  );
}

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

function InvoiceComparison({ lang }: { lang: Lang }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14, margin: "28px 0" }}>
      <div style={{ border: `3px solid ${C.coral}`, background: "#FFF5F5", overflow: "hidden" }}>
        <div style={{ background: C.coral, padding: "10px 16px", fontSize: 12, fontWeight: 900, fontFamily: FH, color: "#fff", letterSpacing: 1 }}>❌ {lang === "hi" ? "WHATSAPP TEXT" : "WHATSAPP TEXT"}</div>
        <div style={{ padding: "16px 18px" }}>
          <div style={{ background: "#E8F5E9", border: "1px solid #c8e6c9", borderRadius: "12px 12px 0 12px", padding: "10px 14px", fontSize: 13, color: "#333", display: "inline-block", maxWidth: "85%" }}>
            {lang === "hi"
              ? "Rajesh ji payment kar dijiye ₹45,000"
              : "Rajesh ji please pay ₹45,000"}
          </div>
          <ul style={{ marginTop: 10, paddingLeft: 0, listStyle: "none", fontSize: 12, color: C.coral, fontWeight: 700 }}>
            {(lang === "hi"
              ? ["Kaunse kaam ka? Pata nahi", "Due date kya hai? Mention nahi", "GST include hai? Unclear", "Koi proof nahi"]
              : ["Which project? Unclear", "Due date? Not mentioned", "GST included? Unknown", "No paper trail at all"]
            ).map((line, i) => <li key={i} style={{ marginBottom: 4 }}>✗ {line}</li>)}
          </ul>
        </div>
      </div>
      <div style={{ border: `3px solid ${C.teal}`, background: "#F0FDFA", overflow: "hidden" }}>
        <div style={{ background: C.teal, padding: "10px 16px", fontSize: 12, fontWeight: 900, fontFamily: FH, color: "#fff", letterSpacing: 1 }}>✅ {lang === "hi" ? "PROFESSIONAL PDF INVOICE" : "PROFESSIONAL PDF INVOICE"}</div>
        <div style={{ padding: "16px 18px" }}>
          <div style={{ background: "#fff", border: `2px solid ${C.teal}`, padding: "10px 14px", fontSize: 12, color: C.navy }}>
            <div style={{ fontWeight: 900, fontFamily: FH, fontSize: 13, marginBottom: 6 }}>{lang === "hi" ? "INVOICE #INV-0042" : "INVOICE #INV-0042"}</div>
            <div style={{ color: `${C.navy}88`, fontSize: 11, marginBottom: 8 }}>{lang === "hi" ? "Anjali Interiors → Rajesh Sharma" : "Anjali Interiors → Rajesh Sharma"}</div>
            <div style={{ borderTop: `1px solid ${C.gray}`, paddingTop: 6, fontSize: 11 }}>
              <div>{lang === "hi" ? "Modular Kitchen Design" : "Modular Kitchen Design"} — ₹38,136</div>
              <div style={{ color: `${C.navy}88` }}>GST 18% — ₹6,864</div>
              <div style={{ fontWeight: 900, marginTop: 4 }}>{lang === "hi" ? "Total: ₹45,000" : "Total: ₹45,000"}</div>
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: C.teal, fontWeight: 700 }}>{lang === "hi" ? "Due: 30 April 2026" : "Due: 30 April 2026"}</div>
          </div>
          <ul style={{ marginTop: 10, paddingLeft: 0, listStyle: "none", fontSize: 12, color: C.teal, fontWeight: 700 }}>
            {(lang === "hi"
              ? ["Project clearly mention hai", "GST breakdown visible", "Due date set hai", "PDF = legal proof"]
              : ["Project clearly stated", "GST breakdown visible", "Due date set", "PDF = legal proof"]
            ).map((line, i) => <li key={i} style={{ marginBottom: 4 }}>✓ {line}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

function InvoiceChecklist({ lang }: { lang: Lang }) {
  const items = lang === "hi"
    ? [
        { label: "Aapka business naam aur contact", must: true },
        { label: "Client ka naam aur address", must: true },
        { label: "Invoice number (sequential)", must: true },
        { label: "Invoice date aur due date", must: true },
        { label: "Items / services with rate × qty", must: true },
        { label: "GST (SAC code + 18%) — agar applicable", must: false },
        { label: "Total amount (base + tax)", must: true },
        { label: "Payment details (UPI ID / bank)", must: true },
      ]
    : [
        { label: "Your business name and contact", must: true },
        { label: "Client name and address", must: true },
        { label: "Invoice number (sequential)", must: true },
        { label: "Invoice date and due date", must: true },
        { label: "Line items with rate × quantity", must: true },
        { label: "GST (SAC code + 18%) — if applicable", must: false },
        { label: "Total amount (base + tax)", must: true },
        { label: "Payment details (UPI ID / bank)", must: true },
      ];
  return (
    <div style={{ margin: "24px 0", background: "#fff", border: `3px solid ${C.navy}`, boxShadow: shadow(4, 4, C.gold), overflow: "hidden" }}>
      <div style={{ background: C.navy, padding: "10px 18px", fontSize: 11, fontWeight: 900, color: C.gold, letterSpacing: 1.5, fontFamily: FH }}>{lang === "hi" ? "PROFESSIONAL INVOICE MEIN KYA HONA CHAHIYE" : "WHAT A PROFESSIONAL INVOICE MUST INCLUDE"}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", borderBottom: i < items.length - 1 ? `1px solid ${C.gray}` : "none" }}>
          <span style={{ width: 20, height: 20, borderRadius: "50%", background: item.must ? C.teal : C.gold, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 11, fontWeight: 900, color: "#fff" }}>✓</span>
          <span style={{ fontSize: 14, color: C.navy, fontWeight: 600 }}>{item.label}</span>
          {!item.must && <span style={{ marginLeft: "auto", fontSize: 10, color: C.gold, fontWeight: 900, fontFamily: FH }}>{lang === "hi" ? "IF APPLICABLE" : "IF APPLICABLE"}</span>}
        </div>
      ))}
    </div>
  );
}

function PaymentDetailsCard({ lang }: { lang: Lang }) {
  return (
    <div style={{ margin: "24px 0", background: "#fff", border: `3px solid ${C.teal}`, position: "relative", boxShadow: shadow(6, 6, C.teal) }}>
      <div style={{ position: "absolute", top: -11, left: 14, background: C.teal, color: "#fff", padding: "2px 12px", fontSize: 10, fontWeight: 900, fontFamily: FH }}>{lang === "hi" ? "INVOICE MEIN PAYMENT DETAILS" : "PAYMENT DETAILS ON YOUR INVOICE"}</div>
      <div style={{ padding: "24px 20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${C.teal}18`, border: `2px solid ${C.teal}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>📱</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.navy, fontFamily: FH }}>{lang === "hi" ? "UPI ID" : "UPI ID"}</div>
            <div style={{ fontSize: 13, color: `${C.navy}88`, marginTop: 2 }}>{lang === "hi" ? "Fastest option — client turant pay kar sakta hai. e.g. anjali@upi" : "Fastest option — client can pay instantly. e.g. anjali@upi"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${C.gold}18`, border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 16 }}>🏦</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.navy, fontFamily: FH }}>{lang === "hi" ? "Bank Account Details" : "Bank Account Details"}</div>
            <div style={{ fontSize: 13, color: `${C.navy}88`, marginTop: 2 }}>{lang === "hi" ? "Backup ke liye — account number + IFSC code mention karo" : "As backup — add account number + IFSC code"}</div>
          </div>
        </div>
        <div style={{ marginTop: 8, padding: "12px 14px", background: `${C.coral}10`, border: `2px solid ${C.coral}`, fontSize: 13, color: C.navy, fontWeight: 700 }}>
          ⚠️ {lang === "hi" ? "Kabhi mat assume karo ki client ko aapke payment details yaad hain — har invoice pe clearly mention karo." : "Never assume the client remembers your payment details — mention them on every invoice."}
        </div>
      </div>
    </div>
  );
}

function FollowUpMiniTimeline({ lang }: { lang: Lang }) {
  const steps = lang === "hi"
    ? [
        { day: "Invoice bheja", color: C.teal, sub: "PDF WhatsApp pe share kiya + message" },
        { day: "2-3 din baad", color: C.gold, sub: "Gentle check-in: \"Invoice mili? Koi question?\"" },
        { day: "Due date ke din", color: C.coral, sub: "Polite reminder: amount + UPI ID repeat karo" },
      ]
    : [
        { day: "Invoice sent", color: C.teal, sub: "PDF shared on WhatsApp + message" },
        { day: "2-3 days later", color: C.gold, sub: "Gentle check-in: \"Did you receive the invoice?\"" },
        { day: "On due date", color: C.coral, sub: "Polite reminder: repeat the amount + UPI ID" },
      ];
  return (
    <div style={{ margin: "24px 0", position: "relative", paddingLeft: 28 }}>
      <div aria-hidden="true" style={{ position: "absolute", left: 13, top: 8, bottom: 8, width: 3, background: `${C.navy}22` }} />
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 20, position: "relative" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.color, border: `3px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "absolute", left: -28, zIndex: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{i + 1}</span>
          </div>
          <div style={{ marginLeft: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: s.color, fontFamily: FH, letterSpacing: 1, marginBottom: 4, textTransform: "uppercase" }}>{s.day}</div>
            <p style={{ fontSize: 14, color: C.navy, fontWeight: 600, lineHeight: 1.5 }}>{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatFlowMockup({ lang }: { lang: Lang }) {
  const messages = lang === "hi"
    ? [
        { who: "user", text: "Invoice banao @Anjali ke liye — Modular Kitchen Design ₹38,136 + GST" },
        { who: "ai", text: "Invoice #INV-0042 ready hai:\nAnjali Sharma · Modular Kitchen Design\nBase: ₹38,136 + GST 18%: ₹6,864 = Total ₹45,000\nDue: 30 April 2026" },
        { who: "user", text: "PDF banao aur WhatsApp pe bhejo" },
        { who: "ai", text: "PDF generate ho gayi! Share button dabao — PDF seedha WhatsApp pe jayegi." },
      ]
    : [
        { who: "user", text: "Create invoice for @Anjali — Modular Kitchen Design ₹38,136 + GST" },
        { who: "ai", text: "Invoice #INV-0042 ready:\nAnjali Sharma · Modular Kitchen Design\nBase: ₹38,136 + GST 18%: ₹6,864 = Total ₹45,000\nDue: 30 April 2026" },
        { who: "user", text: "Generate PDF and share on WhatsApp" },
        { who: "ai", text: "PDF generated! Tap the Share button — the actual PDF file will go directly on WhatsApp." },
      ];

  return (
    <div style={{ margin: "24px 0", background: "#fff", border: `3px solid ${C.navy}`, overflow: "hidden", boxShadow: shadow(6, 6, C.navy) }}>
      <div style={{ background: C.navy, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.teal }} />
        <span style={{ fontSize: 11, fontWeight: 900, color: C.teal, letterSpacing: 1.5, fontFamily: FH }}>{lang === "hi" ? "SELLNSETTLE CHAT" : "SELLNSETTLE CHAT"}</span>
      </div>
      <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.who === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "80%",
              padding: "10px 14px",
              borderRadius: msg.who === "user" ? "12px 12px 0 12px" : "12px 12px 12px 0",
              background: msg.who === "user" ? C.navy : C.gray,
              color: msg.who === "user" ? "#fff" : C.navy,
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.5,
              whiteSpace: "pre-line",
            }}>{msg.text}</div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          {[lang === "hi" ? "PDF Preview" : "PDF Preview", lang === "hi" ? "WhatsApp Share" : "WhatsApp Share"].map((chip, i) => (
            <div key={i} style={{ background: i === 1 ? C.teal : C.gray, color: i === 1 ? "#fff" : C.navy, padding: "6px 14px", borderRadius: 100, fontSize: 11, fontWeight: 900, fontFamily: FH, border: `2px solid ${C.navy}` }}>{chip}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════
// MAIN
// ═══════════════════════

export default function Post7Content() {
  const [lang, setLang] = useState<Lang>("hi");
  const t = (hi: string, en: string) => lang === "hi" ? hi : en;

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0" rel="stylesheet" />
      <LangToggle lang={lang} onToggle={() => setLang(l => l === "hi" ? "en" : "hi")} />

      {/* HERO */}
      <div style={{ background: C.navy, padding: "100px 32px 60px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: -50, right: -70, width: 320, height: 320, borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", background: `${C.teal}22` }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -30, left: -50, width: 220, height: 220, borderRadius: "50%", background: `${C.coral}15` }} />
        <div aria-hidden="true" style={{ position: "absolute", top: 60, left: "40%", width: 140, height: 140, borderRadius: "50%", background: `${C.gold}12` }} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <nav className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>{" / "}
            <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>Blog</Link>{" / "}
            <span style={{ color: "rgba(255,255,255,0.6)" }}>WhatsApp Invoice Guide</span>
          </nav>
          <div style={{ display: "inline-block", background: C.teal, color: "#fff", padding: "4px 14px", fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: FH, marginBottom: 20, border: `2px solid ${C.navy}` }}>WhatsApp</div>
          <h1 style={{ fontFamily: FH, fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 12 }}>
            {lang === "hi"
              ? <>WhatsApp Pe Invoice Kaise Bhejein —{" "}<span style={{ color: C.teal }}>Professional Tarike Se</span></>
              : <>How to Send an Invoice on WhatsApp —{" "}<span style={{ color: C.teal }}>The Professional Way</span></>}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 20, maxWidth: 560 }}>
            {t(
              "\"₹45,000 kar dijiye\" — yeh invoice nahi hai. Seekho PDF banao, sahi message ke saath share karo, aur payment track karo.",
              "\"Please pay ₹45,000\" is not an invoice. Learn to create a PDF, share it with the right message, and track payment."
            )}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600 }}>
            <time dateTime="2026-04-22">April 22, 2026</time><span>·</span><span>5 min read</span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: `${C.navy}cc`, fontWeight: 500, marginBottom: 16 }}>
          {t(
            "Anjali ek interior designer hain Jaipur mein. Kaam complete hua — modular kitchen ka, ₹45,000 ka. Unhone Rajesh ko WhatsApp kiya: \"Rajesh ji payment kar dijiye ₹45,000.\" Rajesh ne read kiya, phir bhool gaye. 2 hafte baad bhi payment nahi. Anjali ne awkward feel kiya dobara maangne mein.",
            "Anjali is an interior designer in Jaipur. Project done — modular kitchen, ₹45,000. She WhatsApped Rajesh: \"Please pay ₹45,000.\" He read it. Then forgot. Two weeks later, still no payment. Anjali felt awkward asking again."
          )}
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: `${C.navy}aa`, fontWeight: 500, marginBottom: 32 }}>
          {t(
            "Problem yeh nahi thi ki Rajesh bura banda tha. Problem thi ki Anjali ne invoice nahi bheja — sirf ek text bheja. Koi due date nahi, koi payment detail nahi, koi proof nahi. Ek proper PDF invoice se yeh situation poori badal jaati.",
            "The problem wasn't that Rajesh was a bad client. The problem was Anjali never sent an invoice — just a text. No due date, no payment details, no paper trail. A proper PDF invoice would have changed this entirely."
          )}
        </p>

        <PullQuote
          text={t(
            "\"Payment maangne mein awkward feel hota hai\" — but ek proper invoice ke saath aapko maangna nahi padta. Invoice khud bolta hai.",
            "Feeling awkward asking for payment? A proper invoice does the asking for you."
          )}
          color={C.teal}
        />
        <BlobDivider color={C.teal} />

        {/* TIP 1 */}
        <TipCard
          number="01"
          title={t("WhatsApp pe amount type karna invoice nahi hai", "Typing an amount on WhatsApp is not an invoice")}
          icon="chat_bubble"
          color={C.coral}
          shadowColor={C.coral}
        >
          <p>{t(
            "Bahut saare small business owners — interior designers, photographers, coaches — yahi karte hain. WhatsApp pe ek line type kar dete hain: \"payment karo ₹X.\" Lagta hai convenient hai. But yeh professionally aur legally bahut weak hai.",
            "Most small business owners — interior designers, photographers, coaches — do exactly this. One line on WhatsApp: \"please pay ₹X.\" Feels convenient. But it's professionally and legally very weak."
          )}</p>
          <InvoiceComparison lang={lang} />
          <p>{t(
            "Ek proper invoice PDF = ek legal document. Agar kabhi dispute ho — client kahe \"unhone mujhe bataya nahi tha\" — aapke paas proof hai.",
            "A proper PDF invoice is a legal document. If there's ever a dispute — client claims they weren't told — you have proof."
          )}</p>
        </TipCard>

        {/* TIP 2 */}
        <TipCard
          number="02"
          title={t("Professional invoice PDF mein kya hona chahiye", "What a professional invoice PDF must include")}
          icon="description"
          color={C.gold}
          shadowColor={C.gold}
        >
          <p>{t(
            "Ek professional invoice mein kuch cheezein zaroori hain — inke bina invoice incomplete hai aur payment confusing ho sakti hai.",
            "A professional invoice needs certain fields — without them it's incomplete and payment gets confusing."
          )}</p>
          <InvoiceChecklist lang={lang} />
          <p style={{ marginTop: 12 }}>{t(
            "Yeh cheezein manually Excel/Word template mein fill kar sakte ho, ya SellNSettle jaisi chat-based tool se 30 second mein bana sakte ho — aap pe depend karta hai.",
            "You can fill these manually in an Excel/Word template, or use a chat-based tool like SellNSettle to create one in 30 seconds — your choice."
          )}</p>
        </TipCard>

        <BlobDivider color={C.gold} flip />

        {/* TIP 3 */}
        <TipCard
          number="03"
          title={t("PDF share karne ka sahi tarika", "The right way to share a PDF invoice on WhatsApp")}
          icon="share"
          color={C.teal}
          shadowColor={C.teal}
        >
          <p>{t(
            "Invoice ready hai — ab share karna bhi sahi tarike se karo. Screenshot mat bhejo. Actual PDF file bhejo — woh download ho sakti hai, save ho sakti hai, client dekh sakta hai.",
            "Invoice is ready — now share it the right way too. Don't send a screenshot. Send the actual PDF file — it can be downloaded, saved, and viewed properly."
          )}</p>
          <p style={{ margin: "12px 0" }}>{t(
            "Aur sirf PDF mat bhejo — ek short message ke saath bhejo jo client ko clearly bata de:",
            "And don't just send the PDF cold — add a short message that tells the client exactly:"
          )}</p>

          <ScriptCard
            label={t("INVOICE BHEJTE WAQT — WHATSAPP MESSAGE", "WHEN SENDING INVOICE — WHATSAPP MESSAGE")}
            color={C.teal}
            text={t(
              "Hi Rajesh ji, project complete ho gaya — invoice attached hai modular kitchen design ke liye (₹45,000). Due date 30 April hai. Payment details invoice mein hain (UPI ID bhi). Koi question ho toh batayiye.",
              "Hi Rajesh ji, project is complete — invoice attached for the modular kitchen design (₹45,000). Due date is 30 April. Payment details are in the invoice (UPI ID included). Let me know if you have any questions."
            )}
          />

          <p style={{ marginTop: 12 }}>{t(
            "Ek baar mein sab clear kar do — project naam, amount, due date, payment method. Client ko doosri jagah nahi dhoondna padega.",
            "Get everything clear in one go — project name, amount, due date, payment method. The client doesn't need to look anywhere else."
          )}</p>

          {/* Mini phone share mockup */}
          <div style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", background: C.gray, border: `3px solid ${C.navy}`, position: "relative" }}>
            <div style={{ position: "absolute", top: -11, left: 14, background: C.navy, color: "#fff", padding: "2px 12px", fontSize: 10, fontWeight: 900, fontFamily: FH }}>{t("PRO TIP", "PRO TIP")}</div>
            <div style={{ fontSize: 28 }}>📎</div>
            <div style={{ fontSize: 14, color: C.navy, fontWeight: 600, lineHeight: 1.5 }}>
              {t(
                "PDF file attach karo — \"document\" wale option se. Screenshot ya photo mat bhejo. Client PDF save kar sakta hai, print kar sakta hai, accountant ko forward kar sakta hai.",
                "Attach as a PDF file — use the \"document\" option. Not a screenshot or photo. Client can save it, print it, forward to their accountant."
              )}
            </div>
          </div>
        </TipCard>

        {/* TIP 4 */}
        <TipCard
          number="04"
          title={t("Invoice mein payment details zaroori hain — assume mat karo", "Payment details are non-negotiable — never assume")}
          icon="payments"
          color={C.navy}
          shadowColor={C.navy}
        >
          <p>{t(
            "Yeh sabse badi galti hai. Client ke paas invoice hai, amount pata hai, due date pata hai — but UPI ID ya bank details nahi hain. Client pay karna chahta hai, but nahi kar sakta. Dobara poochna padega. Delay hoga.",
            "This is the biggest mistake. Client has the invoice, knows the amount, knows the due date — but has no UPI ID or bank details. They want to pay but can't. They have to ask again. Delay happens."
          )}</p>
          <PaymentDetailsCard lang={lang} />
          <p style={{ marginTop: 4 }}>{t(
            "Hamare paas UPI hai — India mein sabse fast payment method. UPI ID invoice pe clearly likho. Bank details backup ke liye. Dono dene se koi client excuse nahi de sakta.",
            "We have UPI — India's fastest payment method. Put your UPI ID clearly on the invoice. Bank details as backup. With both options, no client has an excuse."
          )}</p>
        </TipCard>

        <BlobDivider color={C.coral} />

        {/* TIP 5 */}
        <TipCard
          number="05"
          title={t("Invoice share karne ke baad follow-up set karo", "Set a follow-up after sharing to make sure they saw it")}
          icon="track_changes"
          color={C.coral}
          shadowColor={C.teal}
        >
          <p>{t(
            "WhatsApp ke blue ticks ka matlab yeh nahi ki client ne invoice padha. Wo open kiya hoga — 2 second mein scroll kiya hoga. Invoice actually dekhi ho, amount note kiya ho, due date note kiya ho — alag baat hai.",
            "WhatsApp blue ticks don't mean the client read the invoice. They may have opened it for 2 seconds and scrolled past. Actually reading it, noting the amount and due date — that's different."
          )}</p>
          <FollowUpMiniTimeline lang={lang} />
          <ScriptCard
            label={t("2-3 DIN BAAD CHECK-IN", "2-3 DAYS LATER CHECK-IN")}
            color={C.coral}
            text={t(
              "Hi Rajesh ji, invoice mili na? Koi question ho amount ya payment details ke baare mein toh batayiye.",
              "Hi Rajesh ji, did you receive the invoice? Let me know if you have any questions about the amount or payment details."
            )}
          />
          <p style={{ marginTop: 12 }}>{t(
            "Yeh pushy nahi hai — professional hai. Aap confirm kar rahe ho ki client ko sab kuch clearly mila. 90% cases mein client bolta hai \"haan mili, agle hafte karta hoon\" — aur aapko doubt khatam hota hai.",
            "This is not pushy — it's professional. You're confirming the client received everything clearly. In 90% of cases they'll say \"yes got it, will pay next week\" — and your uncertainty is gone."
          )}</p>
        </TipCard>

        <BlobDivider color={C.navy} flip />

        {/* CTA */}
        <div style={{ background: C.gray, border: `4px solid ${C.navy}`, padding: "36px 32px", boxShadow: shadow(8, 8, C.teal), marginTop: 48 }}>
          <h2 style={{ fontFamily: FH, fontSize: 24, fontWeight: 900, color: C.navy, marginBottom: 8 }}>
            {t("SellNSettle mein invoice kaise bhejein WhatsApp pe", "How SellNSettle handles WhatsApp invoicing")}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: `${C.navy}bb`, fontWeight: 500, marginBottom: 20 }}>
            {lang === "hi"
              ? <><Link href="/" style={{ color: C.teal, fontWeight: 700 }}>SellNSettle</Link>{" "}mein aap chat karke invoice banate ho, PDF generate hoti hai, aur ek tap se WhatsApp pe share hoti hai — actual PDF file ke saath, sirf link nahi:</>
              : <>In <Link href="/" style={{ color: C.teal, fontWeight: 700 }}>SellNSettle</Link>, you create invoices via chat, PDF gets generated, and you share it on WhatsApp in one tap — actual PDF file, not just a link:</>}
          </p>

          <ChatFlowMockup lang={lang} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              t("Invoice banao chat se — @mention se client aur items select karo", "Create invoice via chat — @mention client and catalog items"),
              t("GST auto-calculate hoti hai — 18% base amount pe", "GST auto-calculated — 18% on base amount"),
              t("PDF ek tap mein — WeasyPrint se proper formatted invoice", "PDF in one tap — properly formatted invoice"),
              t("WhatsApp share = actual PDF file, sirf link nahi", "WhatsApp share = actual PDF file, not just a link"),
              t("Invoice status track karo — sent, paid, outstanding", "Track invoice status — sent, paid, outstanding"),
              t("AI se payment reminder generate karo — message ready, aap share karo", "AI generates payment reminder message — you share when ready"),
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "#fff", border: `2px solid ${C.navy}22` }}>
                <span style={{ color: C.teal, fontWeight: 900, fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ color: C.navy, fontSize: 14, fontWeight: 600 }}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/register" style={{ display: "inline-block", background: C.coral, color: "#fff", padding: "16px 32px", fontWeight: 900, fontSize: 18, border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.navy), textDecoration: "none", fontFamily: FH }}>
            {t("Free mein shuru karo — card nahi chahiye →", "Start your early access — no card needed →")}
          </Link>
        </div>

        {/* RELATED */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `4px solid ${C.gray}` }}>
          <h3 style={{ fontFamily: FH, fontWeight: 900, fontSize: 20, color: C.navy, marginBottom: 16 }}>{t("Aur padhein", "Related articles")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { href: "/blog/how-to-send-professional-invoice-interior-designer", title: t("Interior Designer Ke Liye Professional Invoice Kaise Bhejein", "How to Send a Professional Invoice as an Interior Designer"), color: C.coral },
              { href: "/blog/gst-invoice-format-interior-designer-free-template", title: t("GST Invoice Format for Interior Designers — Free Template", "GST Invoice Format for Interior Designers — Free Template"), color: C.gold },
              { href: "/blog/payment-reminder-templates-hindi-english", title: t("Payment Reminder Messages — 10 Templates in Hindi & English", "Payment Reminder Messages — 10 Templates in Hindi & English"), color: C.teal },
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
