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

// ── Decorative SVG blobs ──
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

// ── Before/After comparison ──
function BeforeAfterCRM({ lang }: { lang: Lang }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14, margin: "28px 0" }}>
      <div style={{ border: `3px solid ${C.coral}`, padding: 18, background: "#FFF5F5", position: "relative" }}>
        <div style={{ position: "absolute", top: -11, left: 14, background: C.coral, color: "#fff", padding: "2px 12px", fontSize: 10, fontWeight: 900, fontFamily: FH }}>
          {lang === "hi" ? "❌ CRM KE BINA" : "❌ WITHOUT CRM"}
        </div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {(lang === "hi"
            ? ["📓 Notebook mein client ka naam", "📱 WhatsApp mein budget discuss", "🧠 Dimag mein last baat kya hui", "📋 Notes app mein measurements", "❓ Kya pending hai — yaad nahi"]
            : ["📓 Client name in a notebook", "📱 Budget discussed on WhatsApp", "🧠 Last conversation — in your head", "📋 Measurements in a notes app", "❓ What's pending — no idea"]
          ).map((item, i) => (
            <div key={i} style={{ fontSize: 14, fontWeight: 600, color: C.navy, lineHeight: 1.5 }}>{item}</div>
          ))}
        </div>
      </div>
      <div style={{ border: `3px solid ${C.teal}`, padding: 18, background: "#F0FDFA", position: "relative" }}>
        <div style={{ position: "absolute", top: -11, left: 14, background: C.teal, color: "#fff", padding: "2px 12px", fontSize: 10, fontWeight: 900, fontFamily: FH }}>
          {lang === "hi" ? "✅ CRM KE SAATH" : "✅ WITH CRM"}
        </div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {(lang === "hi"
            ? ["🔍 Ek jagah search karo — sab mil jaaye", "📊 Har client ka stage pata hai", "📝 Notes, calls, invoices — sab ek timeline mein", "🧾 Invoice bhi wahi se bana do", "✅ Follow-up set hai, bhoolna possible nahi"]
            : ["🔍 One search — find everything", "📊 Every client's stage is clear", "📝 Notes, calls, invoices — all in one timeline", "🧾 Create invoices from the same place", "✅ Follow-ups are set, forgetting is impossible"]
          ).map((item, i) => (
            <div key={i} style={{ fontSize: 14, fontWeight: 600, color: C.navy, lineHeight: 1.5 }}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Normal CRM vs AI CRM side-by-side ──
function CRMComparison({ lang }: { lang: Lang }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14, margin: "28px 0" }}>
      {/* Normal CRM — frustration side */}
      <div style={{ border: `3px solid ${C.gold}`, padding: 18, background: "#FFFDF5", position: "relative" }}>
        <div style={{ position: "absolute", top: -11, left: 14, background: C.gold, color: "#fff", padding: "2px 12px", fontSize: 10, fontWeight: 900, fontFamily: FH }}>NORMAL CRM</div>
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
          {(lang === "hi"
            ? [
                { step: "1", text: "Menu khoolo → Contacts → Add New → ek alag page khulega" },
                { step: "2", text: "10 fields bharo: naam, phone, email, address, source, budget… ek bhi miss hua toh save nahi hoga" },
                { step: "3", text: "Save karo → Invoice section dhoodho → phir se ek aur form → line items add karo → GST calculate karo → export karo → PDF kahan gaya?" },
              ]
            : [
                { step: "1", text: "Open Menu → Contacts → Add New → a new page loads" },
                { step: "2", text: "Fill 10 fields: name, phone, email, address, source, budget… miss one and it won't save" },
                { step: "3", text: "Save → find Invoice section → another form → add line items → calculate GST → export → where did the PDF go?" },
              ]
          ).map(({ step, text }) => (
            <div key={step} style={{ background: "#fff", border: `2px solid ${C.navy}15`, padding: "10px 14px", fontSize: 13, color: C.navy, lineHeight: 1.5 }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: `${C.navy}55`, fontFamily: FH, marginRight: 6 }}>STEP {step} →</span>
              {text}
            </div>
          ))}
          <div style={{ padding: "10px 14px", background: `${C.coral}10`, border: `2px solid ${C.coral}33`, fontSize: 13, fontWeight: 800, color: C.coral, lineHeight: 1.4, marginTop: 4 }}>
            😩 {lang === "hi"
              ? "Ek invoice banane mein 5 minute — aur mood 10 minute kharab"
              : "5 minutes to create one invoice — and your mood's ruined for 10"}
          </div>
        </div>
      </div>

      {/* AI CRM — relief side */}
      <div style={{ border: `3px solid ${C.teal}`, padding: 18, background: "#F0FDFA", position: "relative" }}>
        <div style={{ position: "absolute", top: -11, left: 14, background: C.teal, color: "#fff", padding: "2px 12px", fontSize: 10, fontWeight: 900, fontFamily: FH }}>AI CRM</div>
        <div style={{ marginTop: 14 }}>
          <div style={{ background: `${C.navy}08`, borderRadius: 12, padding: "14px 18px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.teal, marginBottom: 6, fontFamily: FH }}>{lang === "hi" ? "AAP BOLTE HO" : "YOU SAY"}</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.navy, fontStyle: "italic", lineHeight: 1.5 }}>
              &ldquo;{lang === "hi"
                ? "Invoice banao @Rajesh — modular kitchen 2.5L, hardware 80K"
                : "Create invoice for @Rajesh — modular kitchen 2.5L, hardware 80K"}&rdquo;
            </p>
          </div>
          <div style={{ background: `${C.teal}10`, borderRadius: 12, padding: "14px 18px", border: `2px solid ${C.teal}33` }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.teal, marginBottom: 6, fontFamily: FH }}>{lang === "hi" ? "AI KARTA HAI" : "AI DOES IT"}</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: C.navy, lineHeight: 1.5 }}>
              ✅ {lang === "hi"
                ? "Invoice #047 ready — ₹3,30,000. PDF bhi. WhatsApp pe bhejein?"
                : "Invoice #047 ready — ₹3,30,000. PDF too. Share on WhatsApp?"}
            </p>
          </div>
          <div style={{ padding: "10px 14px", background: `${C.teal}10`, border: `2px solid ${C.teal}33`, fontSize: 13, fontWeight: 800, color: C.teal, marginTop: 6, textAlign: "center" }}>
            ⚡ {lang === "hi" ? "Bolo 'invoice banao' — 5 second mein done." : "Say 'create invoice' — done in 5 seconds."}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Mini chat mockup card ──
function ChatExample({ command, response, color }: { command: string; response: string; color: string }) {
  return (
    <div style={{ background: "#fff", border: `3px solid ${color}`, overflow: "hidden", marginBottom: 12 }}>
      <div style={{ background: `${C.navy}08`, padding: "12px 16px", borderBottom: `2px solid ${color}33` }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.navy, fontStyle: "italic" }}>💬 &ldquo;{command}&rdquo;</p>
      </div>
      <div style={{ padding: "12px 16px", background: `${color}08` }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>✅ {response}</p>
      </div>
    </div>
  );
}

// ── Phone share mockup — for the WhatsApp share example ──
function WhatsAppShareMockup({ lang }: { lang: Lang }) {
  return (
    <div style={{ background: "#fff", border: `3px solid ${C.teal}`, overflow: "hidden", marginBottom: 12 }}>
      {/* Command row */}
      <div style={{ background: `${C.navy}08`, padding: "12px 16px", borderBottom: `2px solid ${C.teal}33` }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.navy, fontStyle: "italic" }}>
          💬 &ldquo;{lang === "hi"
            ? "Rajesh ka invoice PDF banao aur WhatsApp pe bhejo"
            : "Generate Rajesh's invoice PDF and send on WhatsApp"}&rdquo;
        </p>
      </div>
      {/* Phone mockup area */}
      <div style={{ padding: "16px", background: "#F0FDFA", display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Mini phone */}
        <div style={{ width: 90, flexShrink: 0, background: C.navy, borderRadius: 12, padding: "8px 6px", border: `3px solid ${C.navy}` }}>
          <div style={{ background: "#128C7E", borderRadius: 6, padding: "6px 8px", marginBottom: 6 }}>
            <div style={{ fontSize: 8, fontWeight: 900, color: "#fff", fontFamily: FH, letterSpacing: 0.5 }}>WhatsApp</div>
          </div>
          <div style={{ background: "#fff", borderRadius: 4, padding: "4px 6px", marginBottom: 5 }}>
            <div style={{ fontSize: 7, fontWeight: 700, color: C.navy, marginBottom: 2 }}>📄 Invoice_Rajesh_047.pdf</div>
            <div style={{ fontSize: 6, color: `${C.navy}88` }}>₹3,30,000 · Due Apr 25</div>
          </div>
          <div style={{ background: "#128C7E", borderRadius: 4, padding: "4px 6px", textAlign: "center" }}>
            <div style={{ fontSize: 7, fontWeight: 900, color: "#fff", fontFamily: FH }}>SEND ✓</div>
          </div>
        </div>
        {/* Text */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, color: C.teal, fontFamily: FH, letterSpacing: 0.5, marginBottom: 6 }}>✅ PDF READY</div>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.navy, lineHeight: 1.5, marginBottom: 6 }}>
            {lang === "hi"
              ? "Invoice PDF generate hua. WhatsApp share button ready — ek tap mein Rajesh ko bhej do."
              : "Invoice PDF generated. WhatsApp share ready — one tap to send to Rajesh."}
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ background: "#128C7E", color: "#fff", padding: "4px 10px", fontSize: 11, fontWeight: 900, borderRadius: 4, fontFamily: FH }}>
              📤 {lang === "hi" ? "WhatsApp" : "WhatsApp"}
            </div>
            <div style={{ background: `${C.navy}15`, color: C.navy, padding: "4px 10px", fontSize: 11, fontWeight: 700, borderRadius: 4 }}>
              {lang === "hi" ? "Download" : "Download"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Price comparison ──
function PriceComparison({ lang }: { lang: Lang }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14, margin: "28px 0" }}>
      <div style={{ border: `3px solid ${C.coral}`, padding: 20, background: "#FFF5F5", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: C.coral, fontFamily: FH, letterSpacing: 1, marginBottom: 10 }}>
          {lang === "hi" ? "BADE CRMs" : "BIG CRMs"}
        </div>
        <div style={{ fontFamily: FH, fontSize: 28, fontWeight: 900, color: C.navy, marginBottom: 4 }}>₹2,000–5,000</div>
        <div style={{ fontSize: 13, color: `${C.navy}88`, fontWeight: 600 }}>/month per user</div>
        <div style={{ marginTop: 12, fontSize: 12, color: `${C.navy}88`, lineHeight: 1.5 }}>
          {lang === "hi"
            ? "Training chahiye. Setup mein hafte lagte hain. Chhoti team ke liye overkill."
            : "Requires training. Setup takes weeks. Overkill for small teams."}
        </div>
      </div>
      <div style={{ border: `3px solid ${C.teal}`, padding: 20, background: "#F0FDFA", textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: -11, right: 14, background: C.teal, color: "#fff", padding: "2px 10px", fontSize: 10, fontWeight: 900, fontFamily: FH }}>
          EARLY ACCESS
        </div>
        <div style={{ fontSize: 12, fontWeight: 900, color: C.teal, fontFamily: FH, letterSpacing: 1, marginBottom: 10 }}>SellNSettle</div>
        <div style={{ fontFamily: FH, fontSize: 28, fontWeight: 900, color: C.navy, marginBottom: 4 }}>
          {lang === "hi" ? "Abhi free hai" : "Free to start"}
        </div>
        <div style={{ fontSize: 13, color: `${C.navy}88`, fontWeight: 600 }}>
          {lang === "hi" ? "Early access pe koi charge nahi" : "No charges during early access"}
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: `${C.navy}88`, lineHeight: 1.5 }}>
          {lang === "hi"
            ? "Sign up karo. Chat karo. Kaam shuru. Training ki zaroorat nahi."
            : "Sign up. Chat. Start working. No training needed."}
        </div>
      </div>
    </div>
  );
}

// ── Checklist card ──
function SignsChecklist({ lang }: { lang: Lang }) {
  const signs = lang === "hi"
    ? [
        "Pichle month ek client ne doosre designer ko kaam de diya — kyunki aapne callback nahi kiya waqt pe",
        "Invoice banana itna tedious lagta hai ki soch lete ho 'chhod do, baad mein banaunga' — phir woh baad kabhi aata hi nahi",
        "Subah uthke suddenly yaad aata hai — 'arre, Anjali ka follow-up toh reh gaya!'",
        "Paisa maangne mein dar lagta hai — 'kya sochega client' — aur outstanding badhta jaata hai",
        "WhatsApp pe client ka enquiry dhoodh rahe ho aur beech mein ghar ke messages aa jaate hain",
      ]
    : [
        "A client gave the job to another designer last month because you didn't call back in time",
        "Creating an invoice feels like such a chore that you tell yourself 'I'll do it later' — and later never comes",
        "You wake up in the morning and suddenly realize — 'Oh no, Anjali's follow-up!'",
        "Asking for payment feels embarrassing — so outstanding keeps piling up",
        "You're scrolling WhatsApp looking for a client's enquiry and keep hitting personal messages instead",
      ];

  return (
    <div style={{ margin: "28px 0", background: "#fff", border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.gold), overflow: "hidden" }}>
      <div style={{ background: C.navy, padding: "12px 20px", fontSize: 11, fontWeight: 900, color: C.gold, letterSpacing: 1.5, fontFamily: FH }}>
        {lang === "hi" ? "KYA AAPKO AI CRM CHAHIYE?" : "DO YOU NEED AN AI CRM?"}
      </div>
      <div style={{ padding: "18px 20px" }}>
        {signs.map((sign, i) => (
          <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14, cursor: "pointer" }}>
            <div style={{ width: 22, height: 22, border: `3px solid ${C.navy}`, borderRadius: 4, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
              <span style={{ fontSize: 14, color: C.teal, fontWeight: 900 }}>✓</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.navy, lineHeight: 1.5 }}>{sign}</span>
          </label>
        ))}
        <div style={{ marginTop: 16, padding: "12px 16px", background: `${C.gold}15`, border: `2px solid ${C.gold}44`, fontSize: 14, fontWeight: 800, color: C.navy, textAlign: "center" }}>
          {lang === "hi"
            ? "Agar 3 ya zyada match karte hain → aapko AI CRM chahiye 💡"
            : "If 3 or more match → you need an AI CRM 💡"}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════
// MAIN
// ═══════════════════════

export default function Post4Content() {
  const [lang, setLang] = useState<Lang>("hi");
  const t = (hi: string, en: string) => lang === "hi" ? hi : en;

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0" rel="stylesheet" />
      <LangToggle lang={lang} onToggle={() => setLang(l => l === "hi" ? "en" : "hi")} />

      {/* ═══ HERO BANNER ═══ */}
      <div style={{ background: C.navy, padding: "100px 32px 60px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: -50, right: -70, width: 300, height: 300, borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", background: `${C.gold}22` }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -30, left: -50, width: 200, height: 200, borderRadius: "50%", background: `${C.teal}15` }} />
        <div aria-hidden="true" style={{ position: "absolute", top: "40%", left: "60%", width: 120, height: 120, borderRadius: "50%", background: `${C.coral}10` }} />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <nav className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>{" / "}
            <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>Blog</Link>{" / "}
            <span style={{ color: "rgba(255,255,255,0.6)" }}>AI CRM</span>
          </nav>

          <div style={{ display: "inline-block", background: C.teal, color: "#fff", padding: "4px 14px", fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: FH, marginBottom: 20, border: `2px solid ${C.navy}` }}>
            AI & Tech
          </div>

          <h1 style={{ fontFamily: FH, fontSize: "clamp(26px, 5vw, 46px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 12 }}>
            {t(
              "AI CRM Kya Hai? Small Business Ke Liye ",
              "What is an AI CRM? A Simple Explanation for "
            )}
            <span style={{ color: C.gold }}>
              {t("Simple Explanation", "Small Businesses")}
            </span>
          </h1>

          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 20, maxWidth: 540 }}>
            {t(
              "CRM ka naam suna hai but samajh nahi aata kya karta hai? Aur AI CRM toh aur confusing lagta hai? Yahan simple Hindi mein samjhiye.",
              "Heard of CRM but not sure what it does? And AI CRM sounds even more confusing? Here's a simple explanation."
            )}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600 }}>
            <time dateTime="2026-04-22">April 22, 2026</time><span>·</span><span>6 min read</span>
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Intro */}
        <p style={{ fontSize: 17, lineHeight: 1.8, color: `${C.navy}cc`, fontWeight: 500, marginBottom: 16 }}>
          {t(
            "Agar aap interior designer ho, photographer ho, coach ho, ya koi bhi chhoti service business chalate ho — toh chances hain ki aapne \"CRM\" word suna hai. Shayad kisi ne bola hoga \"bhai CRM use karo, organized rahoge.\"",
            "If you're an interior designer, photographer, coach, or run any small service business — chances are you've heard the word \"CRM.\" Someone probably told you \"use a CRM, it'll keep you organized.\""
          )}
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: `${C.navy}aa`, fontWeight: 500, marginBottom: 32 }}>
          {t(
            "Par phir aapne Google kiya, kisi bade CRM ka pricing dekha, aur band kar diya. \"Yeh toh badi companies ke liye hai.\" Sahi socha. Lekin ek nayi cheez aayi hai — AI CRM — jo bilkul alag kaam karti hai.",
            "Then you Googled it, saw some big CRM's pricing, and closed the tab. \"This is for big companies.\" You were right. But there's something new — AI CRM — that works completely differently."
          )}
        </p>

        <PullQuote text={t("CRM ka matlab sirf itna hai — apne clients ko organize karna taaki koi bhi cheez miss na ho.", "CRM simply means — organizing your clients so nothing falls through the cracks.")} color={C.gold} />

        <BlobDivider color={C.gold} />

        {/* ─── TIP 1 ─── */}
        <TipCard number="01" title={t("CRM ka matlab kya hai?", "What does CRM actually mean?")} icon="menu_book" color={C.teal} shadowColor={C.teal}>
          <p>
            {t(
              "CRM ka full form hai — Customer Relationship Management. Sunne mein fancy lagta hai, but simple language mein: ek jagah jahan aap apne saare clients ki details, unse kya baat hui, kya pending hai — sab rakh sako.",
              "CRM stands for Customer Relationship Management. Sounds fancy, but in simple terms: one place where you store all your client details, conversation history, and pending work."
            )}
          </p>
          <p style={{ marginTop: 12 }}>
            {t(
              "Abhi aap yeh kaam karte ho — lekin 5 alag jagah. Client ka naam diary mein. Budget ki baat WhatsApp pe. Measurements notes app mein. Aur kab follow-up karna hai — woh dimag mein.",
              "You're already doing this — just across 5 different places. Client name in a diary. Budget discussed on WhatsApp. Measurements in a notes app. And follow-up dates — in your head."
            )}
          </p>
          <BeforeAfterCRM lang={lang} />
          <p>
            {t(
              "CRM bas yeh sab ek jagah le aata hai. Itna simple hai concept.",
              "A CRM just brings all of this into one place. That's really all it is."
            )}
          </p>
        </TipCard>

        {/* ─── TIP 2 ─── */}
        <TipCard number="02" title={t("Normal CRM vs AI CRM — fark kya hai?", "Normal CRM vs AI CRM — what's the difference?")} icon="compare" color={C.gold} shadowColor={C.gold}>
          <p>
            {t(
              "Normal CRM mein aap forms bharte ho. Buttons click karte ho. Menus navigate karte ho. Har cheez ke liye ek alag page hai, alag form hai. Training chahiye sikhne mein.",
              "In a normal CRM, you fill forms. Click buttons. Navigate menus. Every action has a different page and a different form. You need training just to learn it."
            )}
          </p>
          <p style={{ marginTop: 12 }}>
            {t(
              "AI CRM mein? Aap baat karte ho. Jaise WhatsApp pe kisi ko message karte ho, waise hi. \"Rajesh ka invoice banao\" — aur kaam ho jaata hai.",
              "In an AI CRM? You just talk to it. Like messaging someone on WhatsApp. \"Create Rajesh's invoice\" — and it's done."
            )}
          </p>
          <CRMComparison lang={lang} />
          <p>
            {t(
              "Fark sirf speed ka nahi hai. Fark yeh hai ki AI CRM mein aapko software sikhna nahi padta. Aap already jaante ho kaise baat karni hai.",
              "The difference isn't just speed. It's that you don't need to learn the software. You already know how to talk."
            )}
          </p>
        </TipCard>

        <BlobDivider color={C.teal} flip />

        {/* ─── TIP 3 ─── */}
        <TipCard number="03" title={t("AI CRM kya kya kar sakta hai? — 5 real examples", "What can an AI CRM do? — 5 real examples")} icon="smart_toy" color={C.coral} shadowColor={C.coral}>
          <p>
            {t(
              "Bahut log sochte hain CRM sirf contacts save karne ke liye hota hai. AI CRM isse kaafi aage hai. Yeh raha ek din mein aap kya kya kar sakte ho:",
              "Many people think CRM is just for saving contacts. An AI CRM goes much further. Here's what you can do in a single day:"
            )}
          </p>
          <div style={{ marginTop: 20 }}>
            <ChatExample
              command={t("Invoice banao @Rajesh, modular kitchen 2.5L + hardware 80K", "Create invoice for @Rajesh, modular kitchen 2.5L + hardware 80K")}
              response={t("Invoice #047 created — ₹3,30,000. PDF ready. Share karein?", "Invoice #047 created — ₹3,30,000. PDF ready. Share it?")}
              color={C.teal}
            />
            <ChatExample
              command={t("Aaj ke follow-ups dikhao", "Show today's follow-ups")}
              response={t("3 follow-ups: Rajesh (overdue), Neha (aaj), Amit (aaj)", "3 follow-ups: Rajesh (overdue), Neha (today), Amit (today)")}
              color={C.gold}
            />
            <ChatExample
              command={t("Kitna outstanding hai total?", "What's the total outstanding?")}
              response={t("₹4,70,000 outstanding — 3 clients se. Sabse zyada: Rajesh ₹2,80,000", "₹4,70,000 outstanding — from 3 clients. Highest: Rajesh ₹2,80,000")}
              color={C.coral}
            />
            <ChatExample
              command={t("@Rajesh ka payment record karo 50K UPI", "Record @Rajesh's payment 50K UPI")}
              response={t("₹50,000 payment recorded. Remaining: ₹2,30,000", "₹50,000 payment recorded. Remaining: ₹2,30,000")}
              color={C.teal}
            />
            <WhatsAppShareMockup lang={lang} />
          </div>
          <p style={{ marginTop: 16 }}>
            {t(
              "Har cheez chat se. Forms nahi. Menus nahi. Sirf baat karo, kaam ho jaaye.",
              "Everything through chat. No forms. No menus. Just talk and get it done."
            )}
          </p>
          {/* Reassurance block */}
          <div style={{ marginTop: 20, padding: "16px 20px", background: `${C.teal}10`, border: `3px solid ${C.teal}`, display: "flex", alignItems: "flex-start", gap: 14 }}>
            <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>💬</span>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, lineHeight: 1.6, margin: 0 }}>
              {t(
                "\"Agar aap WhatsApp use kar sakte ho, toh aap yeh use kar sakte ho. Seriously, that's it.\" — koi training nahi, koi manual nahi, koi YouTube tutorial nahi.",
                "\"If you can use WhatsApp, you can use this. Seriously, that's it.\" — no training, no manual, no YouTube tutorial needed."
              )}
            </p>
          </div>
        </TipCard>

        <PullQuote text={t("AI CRM mein software sikhna nahi padta. Aap already jaante ho kaise baat karni hai — Hindi mein, English mein, ya Hinglish mein.", "You don't need to learn an AI CRM. You already know how to talk — in Hindi, English, or Hinglish.")} color={C.teal} />

        <BlobDivider color={C.coral} />

        {/* ─── TIP 4 ─── */}
        <TipCard number="04" title={t("Kya AI CRM mehenga hota hai?", "Is an AI CRM expensive?")} icon="payments" color={C.navy} shadowColor={C.navy}>
          <p>
            {t(
              "Yeh sabse common misconception hai. Log sochte hain AI matlab expensive. Bade enterprise CRMs ₹2,000 se ₹10,000 per month per user charge karte hain. Chhoti team ke liye yeh budget ke bahar hai.",
              "This is the most common misconception. People think AI means expensive. Big enterprise CRMs charge ₹2,000 to ₹10,000 per month per user. That's out of budget for a small team."
            )}
          </p>
          <p style={{ marginTop: 12 }}>
            {t(
              "Lekin nayi generation ke AI CRMs — jaise SellNSettle — free tier dete hain. Card nahi chahiye. Sign up karo aur shuru ho jaao.",
              "But the new generation of AI CRMs — like SellNSettle — offer a free tier. No card needed. Just sign up and start."
            )}
          </p>
          <PriceComparison lang={lang} />
          <p>
            {t(
              "Badi companies ke CRMs bade problems solve karte hain — 500 salespeople ka pipeline manage karna, marketing automation, enterprise workflows. Aapko woh nahi chahiye. Aapko chahiye ek simple tool jo aapke 20-50 clients ko manage kare, invoices banaye, aur follow-ups yaad dilaye.",
              "Enterprise CRMs solve enterprise problems — managing pipelines for 500 salespeople, marketing automation, complex workflows. You don't need that. You need a simple tool that manages your 20-50 clients, creates invoices, and reminds you about follow-ups."
            )}
          </p>
        </TipCard>

        <BlobDivider color={C.navy} flip />

        {/* ─── TIP 5 ─── */}
        <TipCard number="05" title={t("Kya aapko AI CRM chahiye? — 5 signs", "Do you need an AI CRM? — 5 signs")} icon="checklist" color={C.gold} shadowColor={C.teal}>
          <p>
            {t(
              "Har chhoti business ko CRM nahi chahiye. Agar aapke 2-3 clients hain aur sab yaad rehta hai, toh diary kaafi hai. Lekin agar neeche waali cheezein hone lagi hain, toh time aa gaya hai:",
              "Not every small business needs a CRM. If you have 2-3 clients and remember everything, a diary works fine. But if these things are happening, it's time:"
            )}
          </p>
          <SignsChecklist lang={lang} />
          <p style={{ marginTop: 12 }}>
            {t(
              "Yeh sab signs hain ki aapka current system (notebook + WhatsApp + dimag) ab kaam nahi kar raha. Aur yeh normal hai — jab business badhti hai toh systems bhi badhne chahiye.",
              "These are signs that your current system (notebook + WhatsApp + memory) isn't working anymore. And that's normal — when business grows, your systems need to grow too."
            )}
          </p>
        </TipCard>

        <BlobDivider color={C.gold} />

        {/* ═══ CTA SECTION ═══ */}
        <div style={{ background: C.gray, border: `4px solid ${C.navy}`, padding: "36px 32px", boxShadow: shadow(8, 8, C.teal), marginTop: 48 }}>
          <h2 style={{ fontFamily: FH, fontSize: 24, fontWeight: 900, color: C.navy, marginBottom: 16 }}>
            {t("SellNSettle — ek AI CRM jo chat se chalta hai", "SellNSettle — an AI CRM that runs on chat")}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: `${C.navy}bb`, fontWeight: 500, marginBottom: 20 }}>
            <Link href="/" style={{ color: C.teal, fontWeight: 700 }}>SellNSettle</Link>{" "}
            {t(
              "mein har kaam chat se hota hai. Yeh raha kaise upar ke examples real mein kaam karte hain:",
              "runs everything through chat. Here's how the examples above work in real life:"
            )}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              t("Enquiry create karo chat mein — \"@Rajesh ka naya enquiry\" bolke", "Create enquiries via chat — just say \"new enquiry for @Rajesh\""),
              t("Invoice banao @mentions se — items, quantity, rate sab chat mein", "Create invoices with @mentions — items, quantity, rate all in chat"),
              t("PDF ek tap mein generate karo, WhatsApp pe ek tap mein share karo", "Generate PDF in one tap, share on WhatsApp in one more"),
              t("Follow-up set karo with date — \"3 din baad follow-up karo Rajesh ka\"", "Set follow-ups with dates — \"follow up with Rajesh in 3 days\""),
              t("Outstanding tracking — \"kitna paisa aana baaki hai\" poochho", "Outstanding tracking — ask \"how much payment is pending\""),
              t("Payment reminders — AI message draft karta hai, aap WhatsApp pe share karo", "Payment reminders — AI drafts the message, you share on WhatsApp"),
              t("Hindi, English, ya Hinglish — jo aapko comfortable lage", "Hindi, English, or Hinglish — whatever you're comfortable with"),
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "#fff", border: `2px solid ${C.navy}22` }}>
                <span style={{ color: C.teal, fontWeight: 900, fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ color: C.navy, fontSize: 14, fontWeight: 600 }}>{item}</span>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 15, color: `${C.navy}99`, fontWeight: 600, marginBottom: 20 }}>
            {t(
              "Koi training nahi. Koi setup nahi. Sign up karo aur chat karo.",
              "No training. No setup. Sign up and start chatting."
            )}
          </p>

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
              { href: "/blog/follow-up-kaise-karein-lead-miss-na-ho", title: "Follow-up Kaise Karein Taaki Lead Miss Na Ho", color: C.teal },
              { href: "/blog/payment-reminder-templates-hindi-english", title: "Payment Reminder Messages — 10 Templates in Hindi & English", color: C.gold },
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
