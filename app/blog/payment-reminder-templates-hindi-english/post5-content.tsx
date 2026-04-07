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

// ── Tip card (matches all other blog posts) ──
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

// ── Script / template card ──
function ScriptCard({ situation, text, color, note }: { situation: string; text: string; color: string; note?: string }) {
  return (
    <div style={{ background: "#fff", border: `3px solid ${color}`, position: "relative", marginBottom: 16 }}>
      <div style={{ position: "absolute", top: -11, left: 14, background: color, color: "#fff", padding: "2px 12px", fontSize: 10, fontWeight: 900, fontFamily: FH, whiteSpace: "nowrap" }}>{situation}</div>
      <div style={{ padding: "20px 20px 16px" }}>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: C.navy, fontWeight: 500, fontStyle: "italic", marginTop: 4, whiteSpace: "pre-line" }}>&ldquo;{text}&rdquo;</p>
        {note && (
          <p style={{ fontSize: 12, color: `${C.navy}77`, fontWeight: 600, marginTop: 10, fontStyle: "normal", borderTop: `1px dashed ${color}44`, paddingTop: 8 }}>
            💡 {note}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Reminder timeline — ScriptCard style ──
function ReminderTimeline({ lang }: { lang: Lang }) {
  const stages = lang === "hi"
    ? [
        { day: "DUE DATE", label: "GENTLE 🌸", color: C.teal, desc: "Sirf yaad dilao — tone soft rakhein. Invoice dobara attach karo." },
        { day: "DAY +3", label: "FIRM 📋", color: C.gold, desc: "Direct ho jao — invoice number aur exact amount clearly mention karo." },
        { day: "DAY +7", label: "DIRECT ⚡", color: C.coral, desc: "Payment abhi bhi pending hai — clearly bolein. Due date kitne din pehle thi woh bhi mention karein." },
        { day: "DAY +14", label: "FINAL 🔴", color: C.navy, desc: "Last notice. Professional tone, but serious — 'agle steps consider karne padenge' type line zaroor rakhein." },
      ]
    : [
        { day: "DUE DATE", label: "GENTLE 🌸", color: C.teal, desc: "Just a nudge — keep the tone soft. Re-attach the invoice." },
        { day: "DAY +3", label: "FIRM 📋", color: C.gold, desc: "Be direct — clearly state the invoice number and exact amount due." },
        { day: "DAY +7", label: "DIRECT ⚡", color: C.coral, desc: "Make it clear the payment is overdue. Mention how many days since the due date." },
        { day: "DAY +14", label: "FINAL 🔴", color: C.navy, desc: "Last notice. Stay professional but make the seriousness clear — include a line about 'further steps'." },
      ];

  return (
    <div style={{ marginTop: 20 }}>
      {stages.map((s, i) => (
        <div key={i} style={{ background: "#fff", border: `3px solid ${s.color}`, position: "relative", marginBottom: 14 }}>
          <div style={{ position: "absolute", top: -11, left: 14, background: s.color, color: s.color === C.navy ? "#fff" : "#fff", padding: "2px 12px", fontSize: 10, fontWeight: 900, fontFamily: FH, whiteSpace: "nowrap" }}>
            {s.day} — {s.label}
          </div>
          <div style={{ padding: "18px 20px 14px" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: `${C.navy}cc`, lineHeight: 1.6, marginTop: 4 }}>{s.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Do / Don't card ──
function DoDontCard({ lang }: { lang: Lang }) {
  const dos = lang === "hi"
    ? ["Invoice number aur amount hamesha include karein", "PDF attach karein — unhe dhoodhne mat do", "UPI ID ya bank details message mein hi dein", "Tone polite rakhein — aap koi ehsaan nahi maang rahe", "Specific due date mention karein — 'jaldi' nahi, 'kal tak' likhein"]
    : ["Always include invoice number and amount", "Attach the PDF — don't make them search for it", "Include UPI or bank details in the message itself", "Keep the tone polite — you're not asking for a favour", "Name a specific date — not 'soon', say 'by tomorrow'"];

  const donts = lang === "hi"
    ? ["'Sorry to bother you' se shuru mat karein — aap in the right ho", "Sirf 'payment kab karoge?' mat likhein — details dein", "Ek hi message mein 5 baar remind mat karein", "Angry ya frustrated tone mein mat likhein", "Invoice ke bina ya amount bataaye reminder mat bhejein"]
    : ["Don't start with 'sorry to bother you' — you're in the right", "Don't just write 'when will you pay?' — give details", "Don't send 5 reminders in one message", "Don't write in an angry or frustrated tone", "Never send a reminder without invoice details or amount"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 16, margin: "28px 0" }}>
      <div style={{ border: `3px solid ${C.teal}`, padding: 20, background: "#F0FDFA" }}>
        <div style={{ fontFamily: FH, fontWeight: 900, fontSize: 13, color: C.teal, marginBottom: 14, letterSpacing: 1 }}>✅ DO</div>
        {dos.map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, fontSize: 13, color: C.navy, fontWeight: 600, lineHeight: 1.5 }}>
            <span style={{ color: C.teal, flexShrink: 0, marginTop: 1 }}>✓</span> {d}
          </div>
        ))}
      </div>
      <div style={{ border: `3px solid ${C.coral}`, padding: 20, background: "#FFF5F5" }}>
        <div style={{ fontFamily: FH, fontWeight: 900, fontSize: 13, color: C.coral, marginBottom: 14, letterSpacing: 1 }}>❌ DON&apos;T</div>
        {donts.map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, fontSize: 13, color: C.navy, fontWeight: 600, lineHeight: 1.5 }}>
            <span style={{ color: C.coral, flexShrink: 0, marginTop: 1 }}>✗</span> {d}
          </div>
        ))}
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

// ═══════════════════════
// MAIN
// ═══════════════════════

export default function Post5Content() {
  const [lang, setLang] = useState<Lang>("hi");
  const t = (hi: string, en: string) => lang === "hi" ? hi : en;

  // ── Hindi templates ──
  const hindiTemplates = [
    {
      situation: "DUE DATE — GENTLE",
      color: C.teal,
      text: "Hi [Name] ji, yeh ek gentle reminder hai ki invoice #[number] ka ₹[amount] aaj due hai.\nPayment details invoice mein hain — UPI: [your-upi-id]\nKoi problem ho toh batayiye. Thank you! 🙏",
      note: "Tone ekdum soft rakhein. Pehla reminder ek yaad dilaana hai, demand nahi.",
    },
    {
      situation: "DAY +3 — FIRM",
      color: C.gold,
      text: "Hi [Name] ji, invoice #[number] ka ₹[amount] 3 din se pending hai.\nKya aapko invoice mila tha? Attached kar raha/rahi hoon dobara.\nPayment mein koi issue ho toh baat karte hain.",
      note: "Invoice dobara attach karo. Client ne shayad pehla miss kar diya.",
    },
    {
      situation: "DAY +7 — DIRECT",
      color: C.coral,
      text: "[Name] ji, invoice #[number] — ₹[amount] — abhi bhi pending hai.\nMujhe yaad dilana hai ki yeh [due date] se due hai.\nKripya is hafte payment kar dein. UPI: [your-upi-id]\nBank details bhi invoice mein hain.",
      note: "Direct raho, lekin abhi bhi polite. Amount aur due date clearly mention karein.",
    },
    {
      situation: "PARTIAL PAYMENT — ACKNOWLEDGMENT",
      color: C.teal,
      text: "Hi [Name] ji, ₹[partial-amount] ka payment received ho gaya, thank you! 🙏\nRemaining balance: ₹[remaining-amount] — invoice #[number]\nBaaki payment [date] tak expect kar raha/rahi hoon. Let me know if any issue.",
      note: "Partial payment milne pe turant acknowledge karo. Remaining amount clearly mention karo.",
    },
    {
      situation: "DAY +14 — FINAL NOTICE",
      color: C.navy,
      text: "[Name] ji, yeh invoice #[number] ke liye final reminder hai.\nAmount: ₹[amount] — due date [original-due-date] thi.\nKripya [final-date] tak payment karein warna mujhe agle steps consider karne padenge.\nUPI: [your-upi-id] | Account details invoice mein attached hain.",
      note: "Final notice mein 'agle steps' mention karo — vague rakhein lekin serious tone hona chahiye.",
    },
  ];

  // ── English templates ──
  const englishTemplates = [
    {
      situation: "DUE DATE — GENTLE",
      color: C.teal,
      text: "Hi [Name], just a gentle reminder that Invoice #[number] for ₹[amount] is due today.\nPayment details are on the invoice — UPI: [your-upi-id]\nLet me know if you have any questions. Thank you!",
      note: "Keep it light. This is a nudge, not a demand.",
    },
    {
      situation: "DAY +3 — FIRM",
      color: C.gold,
      text: "Hi [Name], following up on Invoice #[number] for ₹[amount], which has been pending for 3 days.\nI've re-attached the invoice in case you missed it.\nPlease let me know if there's any issue with the payment.",
      note: "Re-attach the invoice. They may have genuinely missed it.",
    },
    {
      situation: "DAY +7 — DIRECT",
      color: C.coral,
      text: "Hi [Name], Invoice #[number] for ₹[amount] is now 7 days overdue (due date: [date]).\nCould you please process the payment this week?\nUPI: [your-upi-id] | Bank details are on the invoice.",
      note: "Stay polite but be direct. Mention the overdue duration explicitly.",
    },
    {
      situation: "PARTIAL PAYMENT — ACKNOWLEDGMENT",
      color: C.teal,
      text: "Hi [Name], thank you for the payment of ₹[partial-amount] — received.\nRemaining balance on Invoice #[number]: ₹[remaining-amount]\nI'm expecting the balance by [date]. Please let me know if that works.",
      note: "Acknowledge partial payments immediately. State the remaining balance clearly.",
    },
    {
      situation: "DAY +14 — FINAL NOTICE",
      color: C.navy,
      text: "Hi [Name], this is a final reminder for Invoice #[number] for ₹[amount], originally due on [date].\nKindly process the payment by [final-date] to avoid any further action.\nUPI: [your-upi-id] | Bank details attached.",
      note: "Mention 'further action' — keep it vague but make the seriousness clear.",
    },
  ];

  const templates = lang === "hi" ? hindiTemplates : englishTemplates;

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0" rel="stylesheet" />
      <LangToggle lang={lang} onToggle={() => setLang(l => l === "hi" ? "en" : "hi")} />

      {/* ═══ HERO ═══ */}
      <div style={{ background: C.navy, padding: "100px 32px 60px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: -50, right: -70, width: 300, height: 300, borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", background: `${C.coral}20` }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -30, left: -50, width: 200, height: 200, borderRadius: "50%", background: `${C.teal}15` }} />
        <div aria-hidden="true" style={{ position: "absolute", top: "35%", left: "55%", width: 140, height: 140, borderRadius: "50%", background: `${C.gold}12` }} />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <nav className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>{" / "}
            <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>Blog</Link>{" / "}
            <span style={{ color: "rgba(255,255,255,0.6)" }}>{t("Payment Reminders", "Payment Reminders")}</span>
          </nav>

          <div style={{ display: "inline-block", background: C.coral, color: "#fff", padding: "4px 14px", fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: FH, marginBottom: 20, border: `2px solid ${C.navy}` }}>
            Payments
          </div>

          <h1 style={{ fontFamily: FH, fontSize: "clamp(26px, 5vw, 46px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 12 }}>
            {t(
              "Payment Reminder Messages — ",
              "Payment Reminder Messages — "
            )}
            <span style={{ color: C.coral }}>
              {t("10 Templates Hindi & English mein", "10 Templates in Hindi & English")}
            </span>
          </h1>

          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 20, maxWidth: 560 }}>
            {t(
              "Paisa maangna awkward lagta hai — lekin baaki invoice zyada buri baat hai. Copy-paste ready templates, gentle se final notice tak.",
              "Asking for payment feels awkward — but an unpaid invoice is worse. Copy-paste ready templates, from gentle to final notice."
            )}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600 }}>
            <time dateTime="2026-04-25">April 25, 2026</time><span>·</span><span>5 min read</span>
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Intro */}
        <p style={{ fontSize: 17, lineHeight: 1.8, color: `${C.navy}cc`, fontWeight: 500, marginBottom: 16 }}>
          {t(
            "Sabse bura kaam — project khatam hone ke baad bhi client ko payment ke liye follow up karna. Designers, photographers, coaches, contractors — sabko yeh problem hai.",
            "The worst part of running a service business — chasing clients for payment after the work is already done. Designers, photographers, coaches, contractors — everyone faces this."
          )}
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: `${C.navy}aa`, fontWeight: 500, marginBottom: 32 }}>
          {t(
            "Problem yeh nahi ki client bure hain. Problem yeh hai ki hum awkward feel karte hain paisa maangne mein. Toh ya toh reminder nahi bhejte, ya itna hesitant message bhejte hain ki client ko seriously hi nahi leta. Yahan hain 10 ready-made templates jo seedha kaam karte hain.",
            "The problem isn't that clients are bad people. The problem is that asking for money feels awkward — so you either don't send the reminder at all, or you write something so hesitant that the client doesn't take it seriously. Here are 10 ready-made templates that actually work."
          )}
        </p>

        <PullQuote
          text={t(
            "Reminder bhejne se awkward feel karna band karo. Aap koi bheekh nahi maang rahe — aapka haq maang rahe ho.",
            "Stop feeling awkward about sending payment reminders. You're not begging — you're collecting what you earned."
          )}
          color={C.coral}
        />

        <BlobDivider color={C.coral} />

        {/* ─── SECTION 1: WHEN TO SEND ─── */}
        <TipCard number="01" title={t("Reminder kab bhejein?", "When should you send reminders?")} icon="schedule" color={C.teal} shadowColor={C.teal}>
          <p>
            {t(
              "Ek reminder kaafi nahi hota. Aur roz remind karna pushy hai. Sahi schedule yeh hai:",
              "One reminder is rarely enough. And reminding every day is pushy. The right schedule looks like this:"
            )}
          </p>
          <ReminderTimeline lang={lang} />
          <p>
            {t(
              "Har reminder pe tone change hona chahiye. Pehla friendly, doosra firm, teesra direct, chautha final. Ek hi tone use karte rehne se client ko serious nahi lagta.",
              "Your tone should escalate with each reminder. First is friendly, second is firm, third is direct, fourth is final. Using the same tone every time signals to the client that there are no real consequences."
            )}
          </p>
        </TipCard>

        <BlobDivider color={C.teal} flip />

        {/* ─── SECTION 2/3: TEMPLATES ─── */}
        <TipCard
          number="02"
          title={t("5 Payment Reminder Templates — Hindi (WhatsApp-ready)", "5 Payment Reminder Templates — English (WhatsApp / Email)")}
          icon="message"
          color={lang === "hi" ? C.coral : C.gold}
          shadowColor={lang === "hi" ? C.coral : C.gold}
        >
          <p>
            {t(
              "[Name], [number], [amount], [date] — yeh placeholders aap apne client ke details se replace karein. Baaki copy-paste ke liye ready hai.",
              "Replace [Name], [number], [amount], [date] with your client's details. Everything else is ready to copy-paste."
            )}
          </p>
          <div style={{ marginTop: 20 }}>
            {templates.map((tpl, i) => (
              <ScriptCard
                key={i}
                situation={tpl.situation}
                text={tpl.text}
                color={tpl.color}
                note={tpl.note}
              />
            ))}
          </div>
        </TipCard>

        <BlobDivider color={C.gold} />

        {/* ─── SECTION 4: TIPS ─── */}
        <TipCard number="03" title={t("Effective reminder ke liye 5 tips", "5 tips for effective reminders")} icon="tips_and_updates" color={C.navy} shadowColor={C.navy}>
          <p>
            {t(
              "Template se bhi zyada zaroori hai ki reminder sahi tarike se bheja jaaye. Yeh karo aur yeh mat karo:",
              "The template matters, but so does how you send it. Here's what to do — and what to avoid:"
            )}
          </p>
          <DoDontCard lang={lang} />
          <div style={{ marginTop: 20, padding: "16px 20px", background: `${C.gold}10`, border: `3px solid ${C.gold}` }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, lineHeight: 1.6, margin: 0 }}>
              {t(
                "💡 Sabse important tip: paisa maangne ke liye apologize mat karo. \"Sorry to disturb\" likha? Hata do. Aap kisi ka ehsaan nahi le rahe — apna kaam karaya, apna paisa maang rahe ho.",
                "💡 Most important tip: never apologize for asking. Remove \"sorry to disturb.\" You didn't take a favour — you delivered work, and you deserve to be paid."
              )}
            </p>
          </div>
        </TipCard>

        <BlobDivider color={C.navy} flip />

        {/* ─── SECTION 5: LANG SWITCH PROMPT ─── */}
        <div style={{ margin: "0 0 48px", padding: "18px 22px", background: `${C.navy}08`, border: `3px solid ${C.navy}22`, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🔄</span>
          <p style={{ fontSize: 14, fontWeight: 600, color: `${C.navy}bb`, lineHeight: 1.6, margin: 0 }}>
            {t(
              "English templates chahiye? Toggle button use karein — bottom-right corner mein — EN select karein.",
              "Want the Hindi templates? Use the toggle button — bottom-right corner — switch to हिं."
            )}
          </p>
        </div>

        {/* ═══ CTA ═══ */}
        <div style={{ background: C.gray, border: `4px solid ${C.navy}`, padding: "36px 32px", boxShadow: shadow(8, 8, C.teal), marginTop: 48 }}>
          <h2 style={{ fontFamily: FH, fontSize: 24, fontWeight: 900, color: C.navy, marginBottom: 16 }}>
            {t("SellNSettle: reminder message AI se banao, WhatsApp pe share karo", "SellNSettle: generate reminder messages via AI, share on WhatsApp")}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: `${C.navy}bb`, fontWeight: 500, marginBottom: 20 }}>
            {t(
              "Templates copy-paste zyada comfortable nahi lagte? ",
              "If copy-pasting templates feels like too much work, "
            )}
            <Link href="/" style={{ color: C.teal, fontWeight: 700 }}>SellNSettle</Link>
            {t(
              " mein bas poochho — AI client ka naam, invoice number, aur amount automatically include karke reminder message draft kar deta hai. Aap sirf WhatsApp pe share karo.",
              " can do it for you — just ask, and the AI drafts a reminder with the client's name, invoice number, and amount already filled in. You just share it on WhatsApp."
            )}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              t("\"@Rajesh ke liye payment reminder banao\" — AI message draft karta hai", "\"Create a payment reminder for @Rajesh\" — AI drafts the message"),
              t("Invoice number, amount, due date — sab automatically include hota hai", "Invoice number, amount, due date — all included automatically"),
              t("WhatsApp share ek tap mein — wa.me deep link se directly open hota hai", "Share on WhatsApp in one tap — opens directly via wa.me link"),
              t("Automated nahi — aap approve karke bhejte ho, AI draft karta hai", "Not automated — AI drafts, you review and send"),
              t("Hindi, English, Hinglish — jo aap type karo, wahi language mein respond karta hai", "Hindi, English, Hinglish — responds in whatever language you type"),
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "#fff", border: `2px solid ${C.navy}22` }}>
                <span style={{ color: C.teal, fontWeight: 900, fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ color: C.navy, fontSize: 14, fontWeight: 600 }}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/register" style={{ display: "inline-block", background: C.coral, color: "#fff", padding: "16px 32px", fontWeight: 900, fontSize: 18, border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.navy), textDecoration: "none", fontFamily: FH }}>
            {t("Free mein shuru karo →", "Start your early access →")}
          </Link>
        </div>

        {/* ═══ RELATED POSTS ═══ */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `4px solid ${C.gray}` }}>
          <h3 style={{ fontFamily: FH, fontWeight: 900, fontSize: 20, color: C.navy, marginBottom: 16 }}>
            {t("Aur padhein", "Related articles")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { href: "/blog/interior-design-client-management-tips", title: "Interior Design Client Management: 7 Tips That Actually Work", color: C.coral },
              { href: "/blog/how-to-send-professional-invoice-interior-designer", title: "How to Send a Professional Invoice as an Interior Designer", color: C.teal },
              { href: "/blog/freelancer-payment-collection-tips-india", title: "Freelancer Payment Collection Tips — Never Chase Clients Again", color: C.gold },
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
