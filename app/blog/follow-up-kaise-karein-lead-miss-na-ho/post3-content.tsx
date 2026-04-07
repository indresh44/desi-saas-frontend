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

function ThoughtComparison({ lang }: { lang: Lang }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14, margin: "28px 0" }}>
      <div style={{ border: `3px solid ${C.coral}`, padding: 18, background: "#FFF5F5", position: "relative" }}>
        <div style={{ position: "absolute", top: -11, left: 14, background: C.coral, color: "#fff", padding: "2px 12px", fontSize: 10, fontWeight: 900, fontFamily: FH }}>{lang === "hi" ? "🧠 AAPKO LAGTA HAI" : "🧠 WHAT YOU THINK"}</div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginTop: 8, lineHeight: 1.5 }}>{lang === "hi" ? "\"Client ko pasand nahi aaya. Budget nahi hai. Kisi aur ko de diya hoga.\" 😔" : "\"They didn't like it. Budget issue. Must have given it to someone else.\" 😔"}</p>
      </div>
      <div style={{ border: `3px solid ${C.teal}`, padding: 18, background: "#F0FDFA", position: "relative" }}>
        <div style={{ position: "absolute", top: -11, left: 14, background: C.teal, color: "#fff", padding: "2px 12px", fontSize: 10, fontWeight: 900, fontFamily: FH }}>✅ REALITY</div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginTop: 8, lineHeight: 1.5 }}>{lang === "hi" ? "\"Spouse se baat karni hai. Abhi busy hoon. Baad mein dekhta hoon.\" 📱" : "\"Need to discuss with spouse. Super busy right now. Will check later.\" 📱"}</p>
      </div>
    </div>
  );
}

function FollowUpTimeline({ lang }: { lang: Lang }) {
  const steps = lang === "hi"
    ? [{ day: "DAY 3", color: C.teal, text: "Halka, polite. \"Quote dekha? Koi question?\"" }, { day: "DAY 7", color: C.gold, text: "Thoda direct. \"Decide kiya? Budget adjust kar sakte hain.\"" }, { day: "DAY 14", color: C.coral, text: "Last follow-up. \"Assume kar raha hoon explore kar rahe ho.\"" }]
    : [{ day: "DAY 3", color: C.teal, text: "Light, polite. \"Did you see the quote? Any questions?\"" }, { day: "DAY 7", color: C.gold, text: "More direct. \"Have you decided? I can adjust the scope.\"" }, { day: "DAY 14", color: C.coral, text: "Final follow-up. \"Assuming you're exploring options.\"" }];
  return (
    <div style={{ margin: "28px 0", position: "relative", paddingLeft: 28 }}>
      <div aria-hidden="true" style={{ position: "absolute", left: 13, top: 8, bottom: 8, width: 3, background: `${C.navy}22` }} />
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 20, position: "relative" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: s.color, border: `3px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "absolute", left: -28, zIndex: 1 }}><span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{i + 1}</span></div>
          <div style={{ marginLeft: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: s.color, fontFamily: FH, letterSpacing: 1, marginBottom: 4 }}>{s.day}</div>
            <p style={{ fontSize: 14, color: C.navy, fontWeight: 600, lineHeight: 1.5 }}>{s.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function DoVsDont({ lang }: { lang: Lang }) {
  const dos = lang === "hi" ? ["3 din baad polite follow-up", "Specific date set karo", "Client ka time respect karo", "Clear closure message bhejo"] : ["Polite follow-up after 3 days", "Set a specific follow-up date", "Respect the client's time", "Send a clear closure message"];
  const donts = lang === "hi" ? ["Roz call karo", "\"Interested ho?\" baar baar poocho", "\"No\" ke baad bhi push karo", "Guilt-trip messages bhejo"] : ["Call every day", "Keep asking \"are you interested?\"", "Push after client says no", "Send guilt-trip messages"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 14, margin: "28px 0" }}>
      <div style={{ border: `3px solid ${C.teal}`, padding: 20, background: "#F0FDFA" }}>
        <div style={{ fontFamily: FH, fontWeight: 900, fontSize: 14, color: C.teal, marginBottom: 12, letterSpacing: 1 }}>✅ DO</div>
        {dos.map((d, i) => <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, fontSize: 14, color: C.navy, fontWeight: 600 }}><span style={{ color: C.teal }}>✓</span> {d}</div>)}
      </div>
      <div style={{ border: `3px solid ${C.coral}`, padding: 20, background: "#FFF5F5" }}>
        <div style={{ fontFamily: FH, fontWeight: 900, fontSize: 14, color: C.coral, marginBottom: 12, letterSpacing: 1 }}>❌ DON&apos;T</div>
        {donts.map((d, i) => <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8, fontSize: 14, color: C.navy, fontWeight: 600 }}><span style={{ color: C.coral }}>✗</span> {d}</div>)}
      </div>
    </div>
  );
}

function StatusList({ lang }: { lang: Lang }) {
  const items = lang === "hi"
    ? [{ dot: "#EF4444", name: "Rajesh Sharma", note: "Modular Kitchen · 3 din overdue" }, { dot: "#F59E0B", name: "Neha Gupta", note: "Coaching Package · aaj due" }, { dot: "#22C55E", name: "Amit Patel", note: "Wedding Shoot · kal scheduled" }]
    : [{ dot: "#EF4444", name: "Rajesh Sharma", note: "Modular Kitchen · 3 days overdue" }, { dot: "#F59E0B", name: "Neha Gupta", note: "Coaching Package · due today" }, { dot: "#22C55E", name: "Amit Patel", note: "Wedding Shoot · scheduled tomorrow" }];
  return (
    <div style={{ margin: "24px 0", background: "#fff", border: `3px solid ${C.navy}`, boxShadow: shadow(4, 4, C.teal), overflow: "hidden" }}>
      <div style={{ background: C.navy, padding: "10px 18px", fontSize: 11, fontWeight: 900, color: C.teal, letterSpacing: 1.5, fontFamily: FH }}>{lang === "hi" ? "AAJ KE FOLLOW-UPS" : "TODAY'S FOLLOW-UPS"}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < items.length - 1 ? `1px solid ${C.gray}` : "none" }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: item.dot, border: `2px solid ${C.navy}`, boxShadow: `0 0 6px ${item.dot}44`, flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 800, fontSize: 14, color: C.navy, fontFamily: FH }}>{item.name}</p>
            <p style={{ fontSize: 12, color: `${C.navy}88` }}>{item.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════
// MAIN
// ═══════════════════════

export default function Post3Content() {
  const [lang, setLang] = useState<Lang>("hi");
  const t = (hi: string, en: string) => lang === "hi" ? hi : en;

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0" rel="stylesheet" />
      <LangToggle lang={lang} onToggle={() => setLang(l => l === "hi" ? "en" : "hi")} />

      {/* HERO */}
      <div style={{ background: C.navy, padding: "100px 32px 60px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: -50, right: -70, width: 300, height: 300, borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", background: `${C.teal}22` }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -30, left: -50, width: 200, height: 200, borderRadius: "50%", background: `${C.coral}15` }} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <nav className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }} aria-label="Breadcrumb">
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>Home</Link>{" / "}
            <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>Blog</Link>{" / "}
            <span style={{ color: "rgba(255,255,255,0.6)" }}>Follow-up Guide</span>
          </nav>
          <div style={{ display: "inline-block", background: C.teal, color: "#fff", padding: "4px 14px", fontWeight: 900, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", fontFamily: FH, marginBottom: 20, border: `2px solid ${C.navy}` }}>Lead Management</div>
          <h1 style={{ fontFamily: FH, fontSize: "clamp(26px, 5vw, 44px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 12 }}>
            {t("\"Follow-up Kaise Karein, Taaki Lead Miss Na Ho\"", "\"How to Follow Up So You Never Lose a Lead\"")}
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontWeight: 600, marginBottom: 20, maxWidth: 540 }}>
            {t("\"Kal call karunga\" — yeh kal kabhi nahi aata. Yahan seekho kab, kaise, aur kitni baar follow-up karna chahiye.", "\"I'll call tomorrow\" — that tomorrow never comes. Learn when, how, and how many times to follow up.")}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16, color: "rgba(255,255,255,0.35)", fontSize: 14, fontWeight: 600 }}>
            <time dateTime="2026-04-18">April 18, 2026</time><span>·</span><span>7 min read</span>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        <p style={{ fontSize: 17, lineHeight: 1.8, color: `${C.navy}cc`, fontWeight: 500, marginBottom: 16 }}>
          {t("Ek interior designer ne client ka site visit kiya, requirement samjhi, quote bheja — sab sahi kiya. Phir kya hua? Client ne reply nahi diya. Designer ne socha \"interested nahi hoga.\" 2 hafte baad pata chala — client ne doosre designer ko kaam de diya.", "An interior designer did the site visit, understood requirements, sent a quote — everything right. Then the client went silent. The designer assumed they weren't interested. Two weeks later — the client gave the job to another designer.")}
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: `${C.navy}aa`, fontWeight: 500, marginBottom: 32 }}>
          {t("Kyun? Kyunki doosre designer ne 3 din baad ek polite call kiya tha. Bas itna sa fark.", "Why? Because the other designer made one polite call 3 days later. That's the only difference.")}
        </p>

        <PullQuote text={t("Jo designer follow-up karta hai, woh kaam le jaata hai. Skill barabar ho, toh responsiveness decide karta hai.", "The designer who follows up gets the job. When skill is equal, responsiveness decides.")} color={C.teal} />
        <BlobDivider color={C.teal} />

        {/* TIP 1 */}
        <TipCard number="01" title={t("\"Kal karunga\" mindset chhodo — date set karo", "Stop saying \"I'll do it tomorrow\" — set a date")} icon="event" color={C.teal} shadowColor={C.teal}>
          <p>{t("Jab aap quote bhejte ho ya site visit karte ho, us waqt decide karo — follow-up kab karunga. \"Baad mein\" nahi. Ek specific date. \"15 April ko call karunga.\"", "When you send a quote or do a site visit, decide right then — when will I follow up. Not \"later.\" A specific date. \"I'll call on April 15th.\"")}</p>
          <p style={{ marginTop: 12 }}>{t("Yeh date kahi likh lo — phone reminder, diary, ya CRM. Dimag mein mat rakhna, bhool jaoge.", "Write this date somewhere — phone reminder, diary, or CRM. Don't keep it in your head. You'll forget.")}</p>
          <div style={{ margin: "24px 0", background: C.gray, border: `3px solid ${C.navy}`, padding: 20, display: "flex", alignItems: "center", gap: 16, width: "100%", justifyContent: "space-between" }}>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: `${C.navy}88`, letterSpacing: 1, marginBottom: 4 }}>QUOTE SENT</div>
              <div style={{ background: "#fff", border: `2px solid ${C.navy}`, padding: "10px 18px", fontFamily: FH, fontWeight: 900, fontSize: 15 }}>Apr 12</div>
            </div>
            <div style={{ height: 3, background: C.teal, flex: 1, minWidth: 40 }} />
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: C.teal, letterSpacing: 1, marginBottom: 4 }}>FOLLOW-UP SET</div>
              <div style={{ background: `${C.teal}15`, border: `2px solid ${C.teal}`, padding: "10px 18px", fontFamily: FH, fontWeight: 900, fontSize: 15, color: C.teal }}>Apr 15</div>
            </div>
          </div>
        </TipCard>

        {/* TIP 2 */}
        <TipCard number="02" title={t("Client busy hai, not disinterested — yeh samjho", "The client is busy, not disinterested")} icon="psychology" color={C.gold} shadowColor={C.gold}>
          <p>{t("Jab client reply nahi karta, toh humara dimag seedha negative sochta hai. But 80% cases mein client bas busy hai. Aapka quote unke phone mein kahi neeche chala gaya.", "When a client doesn't reply, our brain goes negative. But in 80% of cases, the client is just busy. Your quote got buried in their phone.")}</p>
          <ThoughtComparison lang={lang} />
          <p>{t("Ek polite follow-up unhe yaad dilata hai. Yeh pushy nahi hai — helpful hai.", "A polite follow-up reminds them. It's not pushy — it's helpful.")}</p>
        </TipCard>

        <BlobDivider color={C.gold} flip />

        {/* TIP 3 */}
        <TipCard number="03" title={t("Follow-up ka schedule — Day 3, Day 7, Day 14", "The follow-up schedule — Day 3, Day 7, Day 14")} icon="timeline" color={C.coral} shadowColor={C.coral}>
          <p>{t("Har follow-up ka ek tone hota hai. Pehla halka, doosra direct, teesra closure.", "Each follow-up has a tone. First is light, second is direct, third is closure.")}</p>
          <FollowUpTimeline lang={lang} />
          <div style={{ marginTop: 20 }}>
            <ScriptCard label="DAY 3" color={C.teal} text={t("Hi Rajesh ji, quote dekha? Koi question ho toh batayiye.", "Hi Rajesh ji, did you get a chance to look at the quote? Let me know if you have questions.")} />
            <ScriptCard label="DAY 7" color={C.gold} text={t("Rajesh ji, modular kitchen quote bheja tha. Decide kiya? Budget adjust kar sakte hain.", "Rajesh ji, following up on the modular kitchen quote. Have you decided? I can adjust the scope.")} />
            <ScriptCard label="DAY 14" color={C.coral} text={t("Rajesh ji, reply nahi aaya toh assume kar raha hoon explore kar rahe ho. Jab ready ho, batana.", "Rajesh ji, since I haven't heard back, I'll assume you're exploring options. Reach out when ready.")} />
          </div>
        </TipCard>

        {/* TIP 4 */}
        <TipCard number="04" title={t("5 Ready-Made Scripts — Copy Paste Karo", "5 Ready-Made Scripts — Copy & Paste")} icon="content_copy" color={C.navy} shadowColor={C.navy}>
          <ScriptCard label={t("SITE VISIT KE BAAD", "AFTER SITE VISIT")} color={C.teal} text={t("Site visit achha raha. Quote 2 din mein share karunga. Koi specific requirement yaad aaye toh batayiye.", "The site visit went well. I'll share the quote in 2 days. Let me know if any requirement comes to mind.")} />
          <ScriptCard label={t("QUOTE BHEJNE KE BAAD", "AFTER SENDING QUOTE")} color={C.gold} text={t("Hi, quote share kiya tha [project] ke liye. Changes chahiye toh bataiye, adjust kar dunga.", "Hi, I shared the quote for [project]. Let me know if you need changes, I can adjust.")} />
          <ScriptCard label={t("7 DIN, NO RESPONSE", "7 DAYS, NO RESPONSE")} color={C.coral} text={t("Just checking in — quote dekha? Koi question ho toh happy to discuss.", "Just checking in — did you review the quote? Happy to discuss any questions.")} />
          <ScriptCard label={t("BUDGET CONCERN", "PRICE CONCERN")} color={C.teal} text={t("Samajhta hoon budget tight hai. Scope adjust kar sakte hain — priority items se shuru karein?", "I understand budget is tight. We can adjust scope — start with priority items?")} />
          <ScriptCard label={t("PURANA LEAD (30+ DIN)", "OLD LEAD (30+ DAYS)")} color={C.navy} text={t("Hi [name] ji, humne [month] mein [project] discuss kiya tha. Abhi bhi plan hai? Available hoon.", "Hi [name], we discussed [project] in [month]. Still on your radar? I'm available.")} />
        </TipCard>

        <BlobDivider color={C.navy} />

        {/* TIP 5 */}
        <TipCard number="05" title={t("Pending follow-ups ek jagah dikhne chahiye", "All follow-ups should be visible in one place")} icon="checklist" color={C.teal} shadowColor={C.gold}>
          <p>{t("Agar follow-up alag alag jagah hain — kuch phone mein, kuch diary mein, kuch dimag mein — toh guaranteed kuch miss hoga. Ek list chahiye jo har subah check karo.", "If follow-ups are scattered — phone, diary, head — you'll miss some. You need one list. Check it every morning.")}</p>
          <StatusList lang={lang} />
        </TipCard>

        {/* TIP 6 */}
        <TipCard number="06" title={t("Kab follow-up NAHI karna chahiye", "When NOT to follow up")} icon="do_not_disturb" color={C.coral} shadowColor={C.coral}>
          <p>{t("Har lead pe follow-up zaroori nahi. Zyada = pushy. Kam = careless. Balance chahiye.", "Not every lead needs follow-ups. Too many = pushy. Too few = careless. Find the balance.")}</p>
          <DoVsDont lang={lang} />
        </TipCard>

        <BlobDivider color={C.coral} flip />

        {/* CTA */}
        <div style={{ background: C.gray, border: `4px solid ${C.navy}`, padding: "36px 32px", boxShadow: shadow(8, 8, C.teal), marginTop: 48 }}>
          <h2 style={{ fontFamily: FH, fontSize: 24, fontWeight: 900, color: C.navy, marginBottom: 16 }}>
            {t("SellNSettle mein follow-up kaise kaam karta hai", "How follow-ups work in SellNSettle")}
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: `${C.navy}bb`, fontWeight: 500, marginBottom: 20 }}>
            <Link href="/" style={{ color: C.teal, fontWeight: 700 }}>SellNSettle</Link>{" "}
            {t("mein follow-up set karna aur track karna chat se hota hai:", "lets you set and track follow-ups via chat:")}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {[
              t("Follow-up set karo with specific date — lead create ya update karte waqt", "Set follow-ups with a date — when creating or updating a lead"),
              t("\"Aaj ke follow-ups dikhao\" — pending, today, overdue ek list mein", "\"Show today's follow-ups\" — pending, today's, overdue in one list"),
              t("Complete karo with notes — \"Rajesh se baat hui, next week site visit\"", "Complete with notes — \"Spoke to Rajesh, site visit next week\""),
              t("Reschedule ek line mein — \"Rajesh ka follow-up 20 April ko shift karo\"", "Reschedule in one line — \"Move Rajesh's follow-up to April 20\""),
              t("Bulk update — \"Purane overdue follow-ups band karo\"", "Bulk update — \"Close all old overdue follow-ups\""),
              t("Hindi, English, ya Hinglish — jo comfortable ho", "Hindi, English, or Hinglish — whatever you're comfortable with"),
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: "#fff", border: `2px solid ${C.navy}22` }}>
                <span style={{ color: C.teal, fontWeight: 900, fontSize: 16, flexShrink: 0 }}>✓</span>
                <span style={{ color: C.navy, fontSize: 14, fontWeight: 600 }}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/register" style={{ display: "inline-block", background: C.coral, color: "#fff", padding: "16px 32px", fontWeight: 900, fontSize: 18, border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.navy), textDecoration: "none", fontFamily: FH }}>
            {t("Free try karo — card nahi chahiye →", "Try free — no card needed →")}
          </Link>
        </div>

        {/* RELATED */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `4px solid ${C.gray}` }}>
          <h3 style={{ fontFamily: FH, fontWeight: 900, fontSize: 20, color: C.navy, marginBottom: 16 }}>{t("Aur padhein", "Related articles")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { href: "/blog/interior-design-client-management-tips", title: "Interior Design Client Management: 7 Tips That Actually Work", color: C.coral },
              { href: "/blog/payment-reminder-templates-hindi-english", title: "Payment Reminder Messages — 10 Templates in Hindi & English", color: C.gold },
              { href: "/blog/ai-crm-kya-hai-small-business-hindi", title: "AI CRM Kya Hai? Small Business Ke Liye Simple Explanation", color: C.teal },
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