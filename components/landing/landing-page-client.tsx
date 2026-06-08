"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import sellNSettleIcon from "@/app/sellnsettle-icon.png";
import { HeroV2 } from "./v2/hero-v2";
import { ProblemSection } from "./v2/problem-section";
import { HowLoopSection } from "./v2/how-loop-section";
import { CaptureSection } from "./v2/capture-section";
import { AISection } from "./v2/ai-section";
import { LV2_CSS, THEME_VARS } from "./v2/styles";

/* ═══════════════════════════════════════════════════════
   SellNSettle Landing Page — v2
   Neobrutalist: thick borders, offset shadows,
   coral + teal + gold + navy
   ═══════════════════════════════════════════════════════ */

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

// ── Icon helper ──
function Icon({ name, style }: { name: string; style?: React.CSSProperties }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 24, ...style }}
    >
      {name}
    </span>
  );
}

/* ═══════════════════════════════════════
   DEMO SECTION — 3 Functional Tabs
   ═══════════════════════════════════════ */

interface DemoMsg {
  from: "user" | "ai" | "card" | "chips";
  text?: string;
  card?: { label: string; id: string; lines: { item: string; qty: string; amt: string }[]; total: string; due?: string };
  chips?: string[];
  list?: { dot: string; name: string; note: string }[];
}

const DEMO_TABS: { key: string; label: string; messages: DemoMsg[] }[] = [
  {
    key: "invoice",
    label: "Invoice banao",
    messages: [
      { from: "user", text: "@Anjali ke liye invoice banao — @Modular Kitchen ×2, @Hettich Hardware ×4" },
      { from: "ai", text: "Invoice #043 ready! GST included 👇" },
      {
        from: "card",
        card: {
          label: "INVOICE", id: "#INV-043",
          lines: [
            { item: "Modular Kitchen", qty: "×2", amt: "₹2,50,000" },
            { item: "Hettich Hardware", qty: "×4", amt: "₹92,000" },
          ],
          total: "₹3,42,000", due: "30 Apr 2026",
        },
      },
      { from: "chips", chips: ["✓ Confirm", "Edit items", "PDF →", "WhatsApp"] },
    ],
  },
  {
    key: "followup",
    label: "Aaj ke follow-ups",
    messages: [
      { from: "user", text: "Aaj ke pending follow-ups dikhao" },
      { from: "ai", text: "Today's 3 follow-ups:" },
      {
        from: "card",
        list: [
          { dot: "#EF4444", name: "Rajesh Sharma", note: "Modular Kitchen · 2 days overdue" },
          { dot: "#F59E0B", name: "Neha Gupta", note: "Coaching Package · due today" },
          { dot: "#22C55E", name: "Amit Patel", note: "Wedding Shoot · on track" },
        ],
      },
      { from: "chips", chips: ["Mark Rajesh done", "Reschedule Neha", "View all"] },
    ],
  },
  {
    key: "payment",
    label: "₹50,000 payment record",
    messages: [
      { from: "user", text: "₹50,000 payment aaya @Rajesh se, UPI pe, INV-042 ke liye" },
      { from: "ai", text: "Payment recorded! ✅ Invoice status updated." },
      {
        from: "card",
        card: {
          label: "PAYMENT", id: "INV-042",
          lines: [{ item: "UPI · Rajesh Sharma", qty: "", amt: "₹50,000" }],
          total: "₹50,000",
        },
      },
      { from: "chips", chips: ["Send receipt", "Outstanding check", "History"] },
    ],
  },
];

function DemoChat({ messages }: { messages: DemoMsg[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {messages.map((m, i) => {
        if (m.from === "user") return (
          <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{
              background: C.navy, color: "#fff",
              padding: "8px 12px", borderRadius: "14px 14px 4px 14px",
              fontWeight: 500, fontSize: 11, lineHeight: 1.45, maxWidth: "88%",
              border: `2px solid ${C.navy}`,
            }}>{m.text}</div>
          </div>
        );
        if (m.from === "ai") return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
            <p style={{ fontSize: 11, fontWeight: 800, fontFamily: FH, lineHeight: 1.4 }}>{m.text}</p>
          </div>
        );
        if (m.from === "card" && m.card) {
          const card = m.card;
          return (
          <div key={i}>
            <div style={{
              background: "#fff", border: `2.5px solid ${C.navy}`,
              padding: "8px 10px", borderRadius: 12,
              boxShadow: shadow(3, 3, C.gold),
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 6, borderBottom: `1.5px solid ${C.navy}`, paddingBottom: 6,
              }}>
                <span style={{ fontSize: 8, fontWeight: 900, fontFamily: FH, letterSpacing: 1, color: C.coral }}>{card.label}</span>
                <span style={{ fontSize: 7, fontWeight: 900, background: C.navy, color: "#fff", padding: "2px 6px" }}>{card.id}</span>
              </div>
              {card.lines.map((line, j) => (
                <div key={j} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "4px 0", fontSize: 9,
                  borderBottom: j < card.lines.length - 1 ? `1px dashed ${C.navy}44` : `1.5px dashed ${C.navy}`,
                }}>
                  <span style={{ fontWeight: 700 }}>{line.item} {line.qty && <span style={{ color: `${C.navy}88` }}>{line.qty}</span>}</span>
                  <span style={{ fontWeight: 900, fontFamily: FH }}>{line.amt}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6 }}>
                <span style={{ fontWeight: 900, fontSize: 7, textTransform: "uppercase", letterSpacing: 1, color: `${C.navy}88` }}>
                  {card.due ? `Due: ${card.due}` : "Total"}
                </span>
                <span style={{ fontWeight: 900, fontSize: 14, color: C.coral, fontFamily: FH }}>{card.total}</span>
              </div>
            </div>
          </div>
          );
        }
        if (m.from === "card" && m.list) {
          const list = m.list;
          return (
          <div key={i}>
            <div style={{
              background: "#fff", border: `2.5px solid ${C.navy}`,
              borderRadius: 12, boxShadow: shadow(3, 3, C.teal), overflow: "hidden",
            }}>
              {list.map((item, j) => (
                <div key={j} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                  borderBottom: j < list.length - 1 ? `1.5px solid ${C.gray}` : "none",
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: item.dot, border: `1.5px solid ${C.navy}`,
                    boxShadow: `0 0 6px ${item.dot}44`, flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ fontWeight: 900, fontSize: 10, fontFamily: FH }}>{item.name}</p>
                    <p style={{ fontSize: 8, color: `${C.navy}88`, fontWeight: 600 }}>{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          );
        }
        if (m.from === "chips") return (
          <div key={i} style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {m.chips!.map((c, j) => (
              <button key={j} style={{
                background: j === 0 ? C.teal : "#fff",
                color: j === 0 ? "#fff" : C.navy,
                padding: "4px 10px", borderRadius: 100,
                fontWeight: 900, border: `2px solid ${C.navy}`,
                boxShadow: j === 0 ? shadow(2, 2, C.navy) : "none",
                fontSize: 9, cursor: "pointer", fontFamily: FH,
              }}>{c}</button>
            ))}
          </div>
        );
        return null;
      })}
    </div>
  );
}

function DemoSection() {
  const [activeTab, setActiveTab] = useState("invoice");
  const [paused, setPaused] = useState(false);
  const active = DEMO_TABS.find((t) => t.key === activeTab)!;

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        const idx = DEMO_TABS.findIndex((t) => t.key === prev);
        return DEMO_TABS[(idx + 1) % DEMO_TABS.length].key;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div className="flex flex-col lg:flex-row" style={{ maxWidth: 1000, margin: "0 auto", alignItems: "center", gap: 40 }}>
      <div className="w-full lg:w-1/3">
        <h2 style={{ fontFamily: FH, fontSize: 40, fontWeight: 900, color: C.navy, marginBottom: 32, lineHeight: 1 }}>
          See It <br /><span style={{ color: C.coral, fontStyle: "italic", fontSize: 30 }}>IN ACTION</span>
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DEMO_TABS.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPaused(true); }} style={{
              width: "100%", textAlign: "left", padding: "14px 18px",
              border: `3px solid ${C.navy}`,
              background: activeTab === tab.key ? C.gold : "#fff",
              fontWeight: 900, fontSize: 16, fontFamily: FH, cursor: "pointer",
              boxShadow: activeTab === tab.key ? shadow(4, 4, C.navy) : "none",
              transition: "all 0.2s ease",
              transform: activeTab === tab.key ? "translate(-2px, -2px)" : "none",
            }}>{tab.label}</button>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-2/3" style={{ position: "relative", display: "flex", justifyContent: "center" }}>
        <div aria-hidden="true" className="hidden lg:block" style={{
          position: "absolute", top: -60, right: -20, width: 280, height: 280,
          background: `${C.gold}33`,
          borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
          zIndex: 0, animation: "blobPulse 4s ease infinite",
        }} />
        <div className="demo-phone" style={{
          position: "relative", zIndex: 1, width: "100%", maxWidth: 280, minHeight: 460,
          background: C.navy, borderRadius: 36, padding: 7,
          boxShadow: shadow(10, 10, C.teal), border: `3px solid ${C.navy}`,
          transform: "rotate(2deg)",
        }}>
          <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 30, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{
              padding: "20px 14px 10px", borderBottom: `3px solid ${C.navy}`,
              display: "flex", alignItems: "center", gap: 8, background: C.gray,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", background: C.coral,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${C.navy}`, boxShadow: shadow(2, 2, C.navy),
              }}><Icon name="smart_toy" style={{ color: "#fff", fontSize: 16 }} /></div>
              <div>
                <p style={{ fontWeight: 900, fontSize: 12, color: C.navy, fontFamily: FH }}>AI Assistant</p>
                <p style={{ fontSize: 7, color: C.teal, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase" }}>Active Now</p>
              </div>
            </div>
            <div style={{ flex: 1, padding: "12px 12px" }}>
              <DemoChat messages={active.messages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */

const DEMO_VIDEO_ID = "AgvNQAbc4ss";

export function LandingChrome() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0" rel="stylesheet" />
      <style>{`
        @keyframes popIn { from{opacity:0;transform:translateY(8px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes dotPulse { 0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1} }
        @keyframes blobPulse { 0%,100%{transform:scale(1);opacity:.2}50%{transform:scale(1.05);opacity:.3} }
        @keyframes lampSwing { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes lampGlow { 0%,100% { opacity: 0.25; } 50% { opacity: 0.5; } }
        @keyframes sofaCushion { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(0.95); } }
        @keyframes frameTilt { 0%,100% { transform: rotate(0deg); } 30% { transform: rotate(2deg); } 70% { transform: rotate(-1.5deg); } }
        @keyframes plantSway { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(3deg); } 75% { transform: rotate(-3deg); } }
        @keyframes swatchPop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }
        @keyframes pencilDraw { 0%,100% { transform: rotate(-40deg) translateX(0); } 50% { transform: rotate(-40deg) translateX(4px); } }
        @keyframes rugPattern { 0%,100% { opacity: 0.5; } 50% { opacity: 0.8; } }
        @keyframes bookSlide { 0%,80% { transform: translateX(0); } 90% { transform: translateX(3px); } 100% { transform: translateX(0); } }
        @keyframes camShutter { 0%,85% { transform: scale(1); } 90% { transform: scale(0.7); } 95% { transform: scale(1.1); } 100% { transform: scale(1); } }
        @keyframes camFlash { 0%,84% { opacity: 0; } 90% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes camBody { 0%,100% { transform: translateY(0); } 90% { transform: translateY(-3px); } 95% { transform: translateY(1px); } }
        @keyframes camStar1 { 0%,80% { opacity: 0; transform: scale(0); } 88% { opacity: 1; transform: scale(1.2); } 100% { opacity: 0; transform: scale(0); } }
        @keyframes camHeart { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes arrowFly { 0% { transform: translate(50px, -35px); opacity: 0; } 40% { opacity: 1; } 70%,100% { transform: translate(0, 0); opacity: 1; } }
        @keyframes targetRipple { 0% { r: 8; opacity: 0.6; } 100% { r: 30; opacity: 0; } }
        @keyframes coinBounce { 0%,100% { transform: translateY(0); } 30% { transform: translateY(-10px); } 60% { transform: translateY(-3px); } }
        @keyframes checkPop { 0%,60% { transform: scale(0); } 75% { transform: scale(1.2); } 100% { transform: scale(1); } }
        .persona-stagger:nth-child(2) { margin-top: 0; }
        .persona-stagger:nth-child(3) { margin-top: 0; }
        @media (min-width: 768px) {
          .persona-stagger:nth-child(2) { margin-top: 36px; }
          .persona-stagger:nth-child(3) { margin-top: 72px; }
        }
        .demo-card-ml { margin-left: 16px; }
        @media (min-width: 768px) { .demo-card-ml { margin-left: 48px; } }
        .demo-phone { transform: rotate(2deg) scale(1); }
        @media (max-width: 767px) { .demo-phone { transform: rotate(-2deg) scale(0.9) !important; max-width: 240px !important; } }
        @media (max-width: 767px) {
          .pain-card { margin-top: 0 !important; transform: none !important; }
          .persona-stagger { margin-top: 0 !important; }
          .persona-stagger [role="img"] { height: 160px !important; font-size: 48px !important; }
          section[aria-label] { padding-left: 20px !important; padding-right: 20px !important; }
          nav { padding: 10px 16px !important; }
          .hero-phone { transform: rotate(-2deg) scale(0.85) !important; max-width: 200px !important; }
          .skew-section { transform: none !important; }
          .skew-section > div:first-child { transform: none !important; }
          .demo-card-ml { margin-left: 12px !important; }
        }
      `}</style>
    </>
  );
}

export function LandingNav() {
  return (
    <nav style={{
      position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
      width: "90%", maxWidth: 1100, zIndex: 50,
      background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
      border: `3px solid ${C.navy}`, borderRadius: 100,
      boxShadow: shadow(5, 5, C.coral), padding: "12px 24px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <Link href="/" style={{ fontSize: 18, fontWeight: 900, color: '#E8862E', display: "flex", alignItems: "center", gap: 6, fontFamily: FH, textDecoration: "none", flexShrink: 0 }}>
        <Image
          src={sellNSettleIcon}
          alt="SellNSettle"
          width={26}
          height={26}
          style={{ flexShrink: 0 }}
        />
        SellNSettle
      </Link>
      <div className="hidden md:flex" style={{ gap: 28, alignItems: "center" }}>
        {["Features", "Comparison", "Pricing"].map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{ color: C.navy, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>{l}</a>
        ))}
        <Link href="/blog" style={{ color: C.navy, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>Blog</Link>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link href="/login" style={{ fontWeight: 700, color: C.navy, fontSize: 13, textDecoration: "none" }}>Login</Link>
        <Link href="/register" style={{
          background: C.gold, color: C.navy, padding: "8px 16px", borderRadius: 100,
          fontWeight: 900, fontSize: 13, border: `2px solid ${C.navy}`,
          boxShadow: shadow(3, 3, C.navy), fontFamily: FH, textDecoration: "none", whiteSpace: "nowrap",
        }}>Start Free</Link>
      </div>
    </nav>
  );
}

export default function LandingPageClient() {
  return (
    <div style={{ background: "#fff", color: C.navy, overflowX: "hidden", minHeight: "100vh" }}>
      <LandingChrome />

      <LandingNav />

      <div className="lv2-root" style={{ ...THEME_VARS.neo, paddingTop: 80 }}>
        <style>{LV2_CSS}</style>
        <main>
          <HeroV2 />
          <ProblemSection />
          <HowLoopSection />
          <CaptureSection />
          <AISection />
        </main>
      </div>

      <LandingLowerSections v2 />
    </div>
  );
}

export function LandingLowerSections({ v2 = false }: { v2?: boolean } = {}) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    if (!isVideoOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsVideoOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isVideoOpen]);

  return (
    <>
        {!v2 && (
        <>
        {/* ═══ PAIN — with skew (#2) ═══ */}
        <section aria-label="Common problems" className="skew-section" style={{ padding: "72px 24px", background: C.gray, transform: "skewY(-2deg)" }}>
          <div style={{ transform: "skewY(2deg)", maxWidth: 1000, margin: "0 auto", padding: "24px 0" }}>
            <div style={{ marginBottom: 48 }}>
              <h2 style={{ fontFamily: FH, fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, color: C.navy, letterSpacing: -2, marginBottom: 16, lineHeight: 1 }}>
                Sound <span style={{ color: C.teal, fontStyle: "italic" }}>Familiar?</span>
              </h2>
              <p style={{ fontSize: 18, color: `${C.navy}99`, fontWeight: 600, maxWidth: 520 }}>The daily chaos of manual management is holding your business back.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4" style={{ gap: 24 }}>
              {[
                { icon: "menu_book", color: C.coral, sc: C.coral, title: "Notebook mein likha par dhundna mushkil...", desc: "Enquiry details scattered across 10 pages. Never there when you need them.", mt: 0 , rot: "0.75deg"},
                { icon: "event_busy", color: C.teal, sc: C.teal, title: "Follow-up bhool gaye, lead chala gaya...", desc: "Missed a ₹2 lakh lead because you forgot to check your diary.", mt: 32 , rot: "0.75deg"},
                { icon: "timer", color: C.gold, sc: C.gold, title: "Invoice banane mein itna time lagta hai...", desc: "Manually calculating totals and taxes when you could be working.", mt: 0 , rot: "0.75deg"},
                { icon: "volunteer_activism", color: C.navy, sc: C.navy, title: "Payment yaad dilana awkward...", desc: "Asking for money feels difficult. Let our AI handle the reminders.", mt: 32 , rot: "0.75deg"},
              ].map((p, i) => (
                <div key={i} className="pain-card hover:-translate-y-2 transition-transform" style={{
                  background: "#fff", padding: 28, border: `3px solid ${C.navy}`,
                  boxShadow: shadow(5, 5, p.sc), marginTop: p.mt,
                  transform: `rotate(${p.rot})`,
                }}>
                  <Icon name={p.icon} style={{ color: p.color, fontSize: 40, marginBottom: 16, display: "block" }} />
                  <h3 style={{ fontWeight: 900, fontSize: 20, marginBottom: 12, lineHeight: 1.2, fontFamily: FH }}>{p.title}</h3>
                  <p style={{ color: `${C.navy}aa`, fontWeight: 500, fontSize: 14, lineHeight: 1.5 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DEMO — 3 functional tabs (#3) ═══ */}
        <section aria-label="Product demo" style={{ padding: "72px 24px", overflow: "hidden" }}>
          <DemoSection />
        </section>

        {/* ═══ FEATURES — collage ═══ */}
        <section id="features" aria-label="Features" style={{ padding: "72px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 1000, margin: "0 auto",padding: "24px 0"  }}>
            <div style={{ marginBottom: 48, position: "relative", display: "inline-block" }}>
              <h2 style={{ fontFamily: FH, fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, color: C.navy, letterSpacing: -2, lineHeight: 1 }}>
                Sab kuch ek <br />
                <span style={{ color: C.gold, fontStyle: "italic", textDecoration: "underline", textDecorationColor: C.coral, textDecorationThickness: 6, textUnderlineOffset: 6 }}>conversation</span> mein
              </h2>
              <div aria-hidden="true" className="hidden md:block" style={{
                position: "absolute", top: -28, right: -80, transform: "rotate(12deg)",
                background: C.coral, color: "#fff", padding: "8px 20px",
                fontWeight: 900, fontSize: 16, border: `4px solid ${C.navy}`, fontFamily: FH,
              }}>KYA MILEGA</div>
            </div>
            <div className="flex flex-col lg:grid" style={{ gridTemplateColumns: "repeat(12, 1fr)", gap: 20, alignItems: "start" }}>
              <div className="lg:col-span-5" style={{ background: "#fff", border: `3px solid ${C.navy}`, padding: 28, boxShadow: shadow(6, 6, C.coral), transform: "rotate(-0.5deg)" }}>
                <Icon name="chat_bubble" style={{ color: C.coral, fontSize: 48, marginBottom: 16, display: "block" }} />
                <h3 style={{ fontWeight: 900, fontSize: 26, marginBottom: 10, fontFamily: FH }}>Bolo, ho jaayega</h3>
                <p style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.5 }}>&ldquo;Rajesh ka invoice banao&rdquo; — Hindi mein bolo, AI samjhega.</p>
              </div>
              <div className="lg:col-span-7" style={{ background: C.navy, color: "#fff", border: `3px solid ${C.navy}`, padding: 32, boxShadow: shadow(7, 7, C.teal), transform: "rotate(0.75deg) translateY(-8px)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                  <Icon name="assignment" style={{ color: C.teal, fontSize: 56 }} />
                  <div>
                    <h3 style={{ fontWeight: 900, fontSize: 24, marginBottom: 10, fontFamily: FH }}>Pura business cycle</h3>
                    <p style={{ fontSize: 15, fontWeight: 500, opacity: 0.8 }}>Enquiry → follow-up → quote → invoice → payment → reminder. <span style={{ color: C.gold, fontWeight: 900, fontStyle: "italic" }}>End to end.</span></p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-6" style={{ background: "#fff", border: `3px solid ${C.navy}`, padding: 28, boxShadow: shadow(6, 6, C.gold), transform: "rotate(-1deg)" }}>
                <Icon name="smartphone" style={{ color: C.gold, fontSize: 48, marginBottom: 16, display: "block" }} />
                <h3 style={{ fontWeight: 900, fontSize: 26, marginBottom: 10, fontFamily: FH }}>WhatsApp pe instant share</h3>
                <p style={{ fontWeight: 500, fontSize: 14 }}>PDF invoice ek tap mein generate. Seedha WhatsApp pe bhej do — <span style={{ color: C.coral }}>professional lage.</span></p>
              </div>
              <div className="lg:col-span-6" style={{ background: C.gray, border: `3px solid ${C.navy}`, padding: 24, boxShadow: shadow(6, 6, C.navy), transform: "rotate(0.5deg) translateX(4px)" }}>
                <Icon name="notifications_active" style={{ color: C.navy, fontSize: 42, marginBottom: 16, display: "block" }} />
                <h3 style={{ fontWeight: 900, fontSize: 22, marginBottom: 10, fontFamily: FH }}>Kabhi bhoologe nahi</h3>
                <p style={{ fontWeight: 500, fontSize: 14 }}>AI follow-up yaad dilata hai. Overdue dikhaata hai. Payment pending toh alert.</p>
              </div>
              <div className="lg:col-span-4" style={{ background: C.teal, color: "#fff", border: `3px solid ${C.navy}`, padding: 24, boxShadow: shadow(5, 5, C.coral), transform: "rotate(-0.75deg)" }}>
                <Icon name="alternate_email" style={{ color: "#fff", fontSize: 42, marginBottom: 10, display: "block" }} />
                <h3 style={{ fontWeight: 900, fontSize: 20, marginBottom: 8, fontFamily: FH }}>@Mention se speed</h3>
                <p style={{ fontWeight: 500, fontSize: 14 }}>@Rajesh @ModularKitchen type karo — AI turant samajh jayega.</p>
              </div>
              <div className="lg:col-span-8" style={{ background: C.gold, border: `3px solid ${C.navy}`, padding: 28, display: "flex", alignItems: "center", gap: 24, boxShadow: shadow(6, 6, C.navy), transform: "rotate(0.25deg) translateY(-4px)" }}>
                <Icon name="bar_chart" style={{ color: C.navy, fontSize: 56, opacity: 0.3 }} />
                <div>
                  <h3 style={{ fontWeight: 900, fontSize: 26, marginBottom: 8, fontFamily: FH }}>Ek line mein hisaab</h3>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>&ldquo;Outstanding kitna hai?&rdquo; &ldquo;Last month se compare karo&rdquo; — poocho, AI bata dega.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FEATURES GRID — replaces comparison section ═══ */}
        <section id="features-grid" aria-label="Features grid" className="skew-section" style={{ padding: "72px 24px", background: C.navy, color: "#fff", transform: "skewY(2deg)" }}>
          <div style={{ transform: "skewY(-2deg)", maxWidth: 960, margin: "0 auto", padding: "24px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontFamily: FH, fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 900, letterSpacing: -2, marginBottom: 12 }}>
                Sab kuch <span style={{ color: C.coral, fontStyle: "italic", textDecoration: "underline", textDecorationColor: C.gold }}>ek jagah.</span>
              </h2>
              <p style={{ fontSize: 16, fontWeight: 600, opacity: 0.5 }}>Everything your business needs, in one smart diary.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
                {[
                { icon: "chat", color: C.coral, title: "AI chat", desc: "Hindi, English, Hinglish — just type what you need." },
                { icon: "people", color: C.teal, title: "Lead tracking", desc: "Every enquiry tracked from hello to closed deal." },
                { icon: "receipt_long", color: C.coral, title: "Invoices & quotes", desc: "Generate, send, and track — all from chat." },
                { icon: "whatsapp", color: C.teal, title: "WhatsApp share", desc: "Send invoices directly to clients via WhatsApp.", customSvg: true },
                { icon: "notifications_active", color: C.teal, title: "Follow-up reminders", desc: "Never forget a callback. AI reminds you on time." },
                { icon: "currency_rupee", color: C.gold, title: "Payment tracking", desc: "Record payments, track outstanding, see who owes what." },
                { icon: "bar_chart", color: C.coral, title: "Business analytics", desc: "Revenue, overdue, pipeline — ask and AI answers." },
                { icon: "devices", color: C.gold, title: "Web + mobile + dark mode", desc: "Works on any device, any screen, day or night." },
                { icon: "layers", color: C.coral, title: "40+ AI tools", desc: "From reminders to reports — your AI assistant handles it all." },
                ].map((f, i) => (
                <div key={i} style={{
                background: "rgba(255,255,255,0.04)",
                border: `3px solid rgba(255,255,255,0.12)`,
                padding: "24px 20px",
                boxShadow: shadow(4, 4, C.gold),
                }}>
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 mb-4 sm:mb-0">
                <div style={{
                  width: 40, height: 40, background: f.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 0, border: `2px solid ${C.navy}`, flexShrink: 0,
                }}>
                  {f.customSvg ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="22" height="22">
                    <path fill="#fff" d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z"/>
                  </svg>
                  ) : (
                  <Icon name={f.icon} style={{ color: f.color === C.gold ? C.navy : "#fff", fontSize: 22 }} />
                  )}
                </div>
                <h3 style={{ fontWeight: 900, fontSize: 18, marginBottom: 0, fontFamily: FH }}>{f.title}</h3>
                </div>
                <p style={{ opacity: 0.55, fontWeight: 600, fontSize: 13, lineHeight: 1.5, marginTop: 12 }}>{f.desc}</p>
                </div>
                ))}
            </div>
            <div style={{
              textAlign: "center", marginTop: 28,
              padding: "14px 24px",
              border: "2px dashed rgba(255,255,255,0.2)",
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, opacity: 0.5, margin: 0 }}>
                <span style={{ color: C.gold, fontWeight: 900, opacity: 1 }}>Coming soon</span>
                {" — "}WhatsApp integration, voice input, aur bahut kuch ✦
              </p>
            </div>
          </div>
        </section>
        </>
        )}

        {/* ═══ PERSONAS — with hover animation (#5) ═══ */}
        <section aria-label="Target audience" style={{ padding: "72px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ marginBottom: 48 }}>
              {v2 ? (
                <span style={{ display: "inline-block", fontFamily: FH, fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.teal, marginBottom: 12 }}>
                  05 · Who it&apos;s for
                </span>
              ) : (
                <h2 style={{ fontFamily: FH, fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, color: C.navy, letterSpacing: -3, marginBottom: 8 }}>
                  Yeh <span style={{ color: C.coral }}>Kiske</span> Liye Hai?
                </h2>
              )}
              <p style={{ fontSize: 18, fontWeight: 700, color: `${C.navy}55` }}>Tailored for the modern Indian entrepreneur.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 32 }}>
              {[
                {
                  bg: "#fce4ec", title: "Interior Designers",
                  desc: "Manage multiple site enquiries, send quotes on-site, track material orders.",
                  sc: C.coral, rot: 0.5, mt: 0,
                  illustration: (
                    <svg width="180" height="130" viewBox="0 0 200 170" role="img" aria-label="Room interior">
                      <rect x="10" y="10" width="180" height="130" fill="#fff" stroke="#0a192f" strokeWidth="3" />
                      <line x1="10" y1="10" x2="10" y2="140" stroke="#0a192f" strokeWidth="4" />
                      <line x1="10" y1="140" x2="190" y2="140" stroke="#0a192f" strokeWidth="4" />
                      <rect x="16" y="120" width="168" height="20" fill="#d4af37" stroke="#0a192f" strokeWidth="2.5" opacity="0.3" />
                      <g style={{ animation: "rugPattern 4s ease-in-out infinite" }}>
                        <line x1="40" y1="124" x2="40" y2="136" stroke="#0a192f" strokeWidth="1" opacity="0.3" />
                        <line x1="60" y1="124" x2="60" y2="136" stroke="#0a192f" strokeWidth="1" opacity="0.3" />
                        <line x1="80" y1="124" x2="80" y2="136" stroke="#0a192f" strokeWidth="1" opacity="0.3" />
                        <line x1="100" y1="124" x2="100" y2="136" stroke="#0a192f" strokeWidth="1" opacity="0.3" />
                        <line x1="120" y1="124" x2="120" y2="136" stroke="#0a192f" strokeWidth="1" opacity="0.3" />
                        <line x1="140" y1="124" x2="140" y2="136" stroke="#0a192f" strokeWidth="1" opacity="0.3" />
                        <line x1="160" y1="124" x2="160" y2="136" stroke="#0a192f" strokeWidth="1" opacity="0.3" />
                      </g>
                      <g style={{ animation: "sofaCushion 4s ease-in-out infinite" }}>
                        <rect x="22" y="88" width="80" height="32" fill="#FF6B6B" stroke="#0a192f" strokeWidth="3" />
                        <rect x="22" y="72" width="80" height="20" fill="#FF6B6B" stroke="#0a192f" strokeWidth="2.5" />
                        <line x1="49" y1="72" x2="49" y2="92" stroke="#0a192f" strokeWidth="2" />
                        <line x1="75" y1="72" x2="75" y2="92" stroke="#0a192f" strokeWidth="2" />
                        <rect x="22" y="72" width="10" height="48" fill="#c0392b" stroke="#0a192f" strokeWidth="2" />
                        <rect x="92" y="72" width="10" height="48" fill="#c0392b" stroke="#0a192f" strokeWidth="2" />
                      </g>
                      <rect x="34" y="78" width="16" height="12" fill="#2EC4B6" stroke="#0a192f" strokeWidth="2" />
                      <rect x="74" y="80" width="14" height="10" fill="#d4af37" stroke="#0a192f" strokeWidth="2" />
                      <g style={{ animation: "lampSwing 3.5s ease-in-out infinite", transformOrigin: "145px 10px" }}>
                        <line x1="145" y1="10" x2="145" y2="42" stroke="#0a192f" strokeWidth="2.5" />
                        <polygon points="133,42 157,42 152,60 138,60" fill="#d4af37" stroke="#0a192f" strokeWidth="2.5" />
                        <g style={{ animation: "lampGlow 3.5s ease-in-out infinite" }}>
                          <polygon points="136,60 154,60 162,88 128,88" fill="#d4af37" opacity="0.2" stroke="none" />
                        </g>
                      </g>
                      <g transform="translate(118, 88)">
                        <rect x="0" y="0" width="14" height="32" fill="#fff" stroke="#0a192f" strokeWidth="2" />
                        <g style={{ animation: "bookSlide 5s ease-in-out infinite" }}>
                          <rect x="2" y="2" width="4" height="28" fill="#2EC4B6" stroke="#0a192f" strokeWidth="1" />
                        </g>
                        <rect x="7" y="4" width="3" height="24" fill="#FF6B6B" stroke="#0a192f" strokeWidth="1" />
                        <rect x="10" y="6" width="3" height="22" fill="#d4af37" stroke="#0a192f" strokeWidth="1" />
                      </g>
                      <g style={{ animation: "frameTilt 5s ease-in-out infinite", transformOrigin: "50px 36px" }}>
                        <rect x="30" y="22" width="40" height="30" fill="#e0f2f1" stroke="#0a192f" strokeWidth="3" />
                        <line x1="38" y1="44" x2="45" y2="36" stroke="#2EC4B6" strokeWidth="2" />
                        <line x1="45" y1="36" x2="52" y2="40" stroke="#2EC4B6" strokeWidth="2" />
                        <line x1="52" y1="40" x2="62" y2="30" stroke="#2EC4B6" strokeWidth="2" />
                        <circle cx="58" cy="28" r="3" fill="#d4af37" stroke="#0a192f" strokeWidth="1.5" />
                      </g>
                      <g style={{ animation: "frameTilt 5s ease-in-out 1s infinite", transformOrigin: "95px 30px" }}>
                        <rect x="78" y="20" width="22" height="26" fill="#fff8e1" stroke="#0a192f" strokeWidth="2.5" />
                        <rect x="82" y="24" width="14" height="18" fill="#FF6B6B" opacity="0.3" />
                        <rect x="84" y="28" width="10" height="10" fill="#2EC4B6" opacity="0.4" />
                      </g>
                      <g style={{ animation: "plantSway 3s ease-in-out infinite", transformOrigin: "174px 120px" }}>
                        <rect x="168" y="104" width="12" height="16" fill="#FF6B6B" stroke="#0a192f" strokeWidth="2" />
                        <line x1="174" y1="104" x2="174" y2="86" stroke="#0a192f" strokeWidth="2" />
                        <ellipse cx="168" cy="86" rx="8" ry="10" fill="#2EC4B6" stroke="#0a192f" strokeWidth="2" />
                        <ellipse cx="180" cy="88" rx="7" ry="8" fill="#2EC4B6" stroke="#0a192f" strokeWidth="2" />
                        <ellipse cx="174" cy="80" rx="6" ry="9" fill="#2EC4B6" stroke="#0a192f" strokeWidth="2" />
                      </g>
                      <g style={{ animation: "swatchPop 3s ease-in-out infinite" }} transform="translate(164, 18)">
                        <rect x="0" y="0" width="12" height="10" fill="#FF6B6B" stroke="#0a192f" strokeWidth="1.5" />
                        <rect x="0" y="10" width="12" height="10" fill="#2EC4B6" stroke="#0a192f" strokeWidth="1.5" />
                        <rect x="0" y="20" width="12" height="10" fill="#d4af37" stroke="#0a192f" strokeWidth="1.5" />
                      </g>
                      <g style={{ animation: "pencilDraw 3s ease-in-out infinite", transformOrigin: "16px 155px" }} transform="translate(10, 148)">
                        <rect x="0" y="0" width="28" height="6" fill="#d4af37" stroke="#0a192f" strokeWidth="1.5" />
                        <polygon points="28,0 34,3 28,6" fill="#0a192f" />
                        <rect x="0" y="0" width="6" height="6" fill="#FF6B6B" stroke="#0a192f" strokeWidth="1" />
                      </g>
                    </svg>
                  ),
                },
                {
                  bg: "#e0f2f1", title: "Photographers",
                  desc: "Track shoot dates, send booking confirmations, collect advances automatically.",
                  sc: C.teal, rot: -0.5, mt: 36,
                  illustration: (
                    <svg width="180" height="130" viewBox="0 0 160 140" role="img" aria-label="Camera with flash">
                      <g style={{ animation: "camBody 3.5s ease-in-out infinite" }}>
                        <rect x="28" y="42" width="104" height="72" fill="#0a192f" stroke="#0a192f" strokeWidth="4" />
                        <rect x="50" y="30" width="36" height="16" fill="#0a192f" stroke="#0a192f" strokeWidth="3" />
                        <polygon points="86,38 96,30 96,46" fill="#0a192f" />
                        <circle cx="80" cy="78" r="26" fill="#2EC4B6" stroke="#d4af37" strokeWidth="4" />
                        <g style={{ animation: "camShutter 3.5s ease-in-out infinite" }}>
                          <circle cx="80" cy="78" r="16" fill="#fff" stroke="#0a192f" strokeWidth="3" />
                          <circle cx="80" cy="78" r="8" fill="#0a192f" />
                          <circle cx="76" cy="74" r="3" fill="#fff" opacity="0.7" />
                        </g>
                        <rect x="102" y="48" width="14" height="10" fill="#FF6B6B" stroke="#0a192f" strokeWidth="2" />
                        <circle cx="46" cy="50" r="5" fill="#d4af37" stroke="#0a192f" strokeWidth="2" />
                      </g>
                      <g style={{ animation: "camFlash 3.5s ease-in-out infinite" }}>
                        <polygon points="80,8 76,26 84,26" fill="#d4af37" stroke="#0a192f" strokeWidth="2" />
                        <polygon points="60,14 68,28 56,24" fill="#d4af37" stroke="#0a192f" strokeWidth="1.5" />
                        <polygon points="100,14 92,28 104,24" fill="#d4af37" stroke="#0a192f" strokeWidth="1.5" />
                      </g>
                      <g style={{ animation: "camStar1 3.5s ease-in-out infinite" }} transform="translate(130,24)">
                        <polygon points="0,-8 2,-2 8,-2 3,2 5,8 0,4 -5,8 -3,2 -8,-2 -2,-2" fill="#FF6B6B" stroke="#0a192f" strokeWidth="1.5" />
                      </g>
                      <g style={{ animation: "camHeart 2s ease-in-out infinite" }} transform="translate(140,60)">
                        <path d="M0,4 C0,0 -6,-4 -6,0 C-6,4 0,10 0,10 C0,10 6,4 6,0 C6,-4 0,0 0,4Z" fill="#FF6B6B" stroke="#0a192f" strokeWidth="1.5" />
                      </g>
                    </svg>
                  ),
                },
                {
                  bg: "#fff8e1", title: "Freelancers & Coaches",
                  desc: "Record payments instantly, send professional invoices, automate follow-ups.",
                  sc: C.gold, rot: 1, mt: 72,
                  illustration: (
                    <svg width="180" height="130" viewBox="0 0 160 140" role="img" aria-label="Target with arrow">
                      <circle cx="80" cy="70" r="44" fill="#fff" stroke="#0a192f" strokeWidth="4" />
                      <circle cx="80" cy="70" r="32" fill="#FF6B6B" stroke="#0a192f" strokeWidth="3" />
                      <circle cx="80" cy="70" r="20" fill="#fff" stroke="#0a192f" strokeWidth="3" />
                      <circle cx="80" cy="70" r="10" fill="#FF6B6B" stroke="#0a192f" strokeWidth="2.5" />
                      <circle cx="80" cy="70" r="3" fill="#0a192f" />
                      <circle cx="80" cy="70" r="8" fill="none" stroke="#d4af37" strokeWidth="2" style={{ animation: "targetRipple 3s ease-out 0.8s infinite" }} />
                      <g style={{ animation: "arrowFly 3s ease-out infinite" }}>
                        <line x1="42" y1="86" x2="78" y2="72" stroke="#0a192f" strokeWidth="3.5" />
                        <polygon points="80,70 74,66 74,74" fill="#d4af37" stroke="#0a192f" strokeWidth="2" />
                        <polygon points="40,88 34,82 34,92" fill="#FF6B6B" stroke="#0a192f" strokeWidth="1.5" />
                        <line x1="34" y1="84" x2="30" y2="82" stroke="#0a192f" strokeWidth="2" />
                        <line x1="34" y1="90" x2="30" y2="92" stroke="#0a192f" strokeWidth="2" />
                      </g>
                      <g style={{ animation: "coinBounce 3s ease-in-out 0.4s infinite", transformOrigin: "138px 20px" }}>
                        <circle cx="138" cy="20" r="12" fill="#d4af37" stroke="#0a192f" strokeWidth="3" />
                        <text x="138" y="25" textAnchor="middle" fill="#0a192f" fontSize="14" fontWeight="900">₹</text>
                      </g>
                      <g style={{ animation: "checkPop 3s ease-out infinite", transformOrigin: "22px 20px" }}>
                        <rect x="10" y="8" width="24" height="24" fill="#2EC4B6" stroke="#0a192f" strokeWidth="3" />
                        <polyline points="16,20 20,26 30,14" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="square" />
                      </g>
                    </svg>
                  ),
                },
              ].map((p) => (
                <div key={p.title} className="group persona-stagger">
                  <div
                    className="transition-all duration-500 ease-out group-hover:!rotate-0 group-hover:scale-[1.03] group-hover:shadow-2xl"
                    style={{
                      border: `4px solid ${C.navy}`,
                      boxShadow: shadow(7, 7, p.sc),
                      transform: `rotate(${p.rot}deg)`,
                      overflow: "hidden", cursor: "default",
                    }}
                  >
                    <div
                      className="transition-transform duration-500 group-hover:scale-110"
                      style={{
                        height: 200, background: p.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                      role="img" aria-label={p.title}
                    >
                      {p.illustration}
                    </div>
                    <div style={{ padding: "20px 24px", background: "#fff", borderTop: `4px solid ${C.navy}` }}>
                      <h3 style={{ fontSize: 24, fontWeight: 900, fontStyle: "italic", fontFamily: FH, marginBottom: 8 }}>{p.title}</h3>
                      <p style={{ color: `${C.navy}aa`, fontWeight: 600, fontSize: 13, lineHeight: 1.4 }}>{p.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        {!v2 && (
        <section aria-label="How it works" style={{ padding: "72px 24px", background: `${C.teal}18` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontFamily: FH, fontSize: 42, fontWeight: 900, fontStyle: "italic", color: C.navy, marginBottom: 8 }}>How It Works</h2>
              <p style={{ fontSize: 18, fontWeight: 600, color: `${C.navy}99` }}>Three steps to a more organized business life.</p>
            </div>
            <div className="flex flex-col lg:flex-row" style={{ gap: 24 }}>
              {[
                { n: "1", icon: "how_to_reg", title: "Sign up", desc: "Zero paperwork. Register with your phone number in 30 seconds.", color: C.coral, sc: C.navy, rot: "-0.5deg" },
                { n: "2", icon: "add_comment", title: "Add enquiry", desc: "Just chat. \"Rajesh met me for kitchen work today.\" Done.", color: C.gold, sc: C.coral, rot: "0.5deg" },
                { n: "3", icon: "send_to_mobile", title: "Send invoices", desc: "Ask AI to generate and send invoices directly to WhatsApp.", color: C.teal, sc: C.teal, rot: "-1deg" },
              ].map((s) => (
                <div key={s.n} style={{
                  flex: 1, background: "#fff", border: `3px solid ${C.navy}`,
                  padding: 32, boxShadow: shadow(7, 7, s.sc), transform: `rotate(${s.rot})`,
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: s.color, color: "#fff", border: `3px solid ${C.navy}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 24, boxShadow: shadow(4, 4, C.navy),
                  }}><Icon name={s.icon} style={{ fontSize: 30 }} /></div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, fontFamily: FH, marginBottom: 10 }}>{s.n}. {s.title}</h3>
                  <p style={{ fontSize: 15, fontWeight: 600, color: `${C.navy}99`, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ═══ CTA — removed "Join 5000+" (#6) ═══ */}
        <section aria-label="Call to action" style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{
              background: C.coral, border: `6px solid ${C.navy}`, borderRadius: 40,
              padding: "clamp(36px, 6vw, 72px)", textAlign: "center",
              position: "relative", overflow: "hidden", boxShadow: shadow(14, 14, C.gold),
            }}>
              <div aria-hidden="true" style={{
                position: "absolute", top: -80, left: -80, width: 300, height: 300,
                background: "rgba(255,255,255,0.1)",
                borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%", transform: "rotate(45deg)",
              }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{
                  fontFamily: FH, fontSize: "clamp(32px, 6vw, 72px)",
                  fontWeight: 900, color: "#fff", letterSpacing: -3, lineHeight: 0.95, marginBottom: 48,
                }}>
                  {v2 ? (
                    <>
                      Stop <span style={{ color: C.navy }}>remembering.</span><br />
                      Start <span style={{ fontStyle: "italic", fontWeight: 300, opacity: 0.8, textDecoration: "underline" }}>closing.</span>
                    </>
                  ) : (
                    <>
                      Notebook <span style={{ color: C.navy }}>band</span> karo.<br />
                      Chat <span style={{ fontStyle: "italic", fontWeight: 300, opacity: 0.8, textDecoration: "underline" }}>shuru</span> karo.
                    </>
                  )}
                </h2>
                <div className="flex flex-col sm:flex-row" style={{ justifyContent: "center", gap: 20 }}>
                  <Link href="/register" style={{
                    background: C.gold, color: C.navy, padding: "18px 32px", borderRadius: 14,
                    fontWeight: 900, fontSize: "clamp(16px, 2.5vw, 20px)",
                    border: `3px solid ${C.navy}`, boxShadow: shadow(6, 6, C.navy),
                    fontFamily: FH, textDecoration: "none", display: "inline-block",
                  }}>Start free — no card needed</Link>
                  <button
                    type="button"
                    onClick={() => setIsVideoOpen(true)}
                    style={{
                      background: "#fff", color: C.navy, padding: "18px 32px", borderRadius: 14,
                      fontWeight: 900, fontSize: "clamp(16px, 2.5vw, 20px)",
                      border: `3px solid ${C.navy}`, boxShadow: shadow(6, 6, C.navy),
                      fontFamily: FH, cursor: "pointer",
                    }}
                  >
                    Watch Video Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ padding: "56px 24px", borderTop: `4px solid ${C.navy}`, background: C.gray }}>
        <div className="grid grid-cols-1 md:grid-cols-12" style={{ maxWidth: 1100, margin: "0 auto", gap: 36 }}>
          <div className="md:col-span-5">
            <div style={{ fontSize: 26, fontWeight: 900, color: '#E8862E', marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontFamily: FH }}>
              <Image
                src={sellNSettleIcon}
                alt="SellNSettle"
                width={40}
                height={40}
                style={{ flexShrink: 0 }}
              />
              SellNSettle
            </div>
            <p style={{ fontSize: 15, color: `${C.navy}aa`, fontWeight: 600, maxWidth: 320, marginBottom: 28, lineHeight: 1.5 }}>
              Empowering India&apos;s growing businesses with intelligent conversation-led technology.
            </p>
            <p style={{ fontSize: 11, color: `${C.navy}55`, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>© 2026 SellNSettle. Made in India with ❤️</p>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3" style={{ gap: 32 }}>
            <div>
              <h4 style={{ fontWeight: 900, marginBottom: 20, letterSpacing: 2, textTransform: "uppercase", fontSize: 15, borderBottom: `4px solid ${C.coral}`, display: "inline-block", paddingBottom: 4, fontFamily: FH }}>Company</h4>
              <Link href="/privacy-policy" style={{ display: "block", color: `${C.navy}99`, fontWeight: 700, marginBottom: 12, cursor: "pointer", fontSize: 14, textDecoration: "none" }}>Privacy Policy</Link>
              <Link href="/terms-and-conditions" style={{ display: "block", color: `${C.navy}99`, fontWeight: 700, marginBottom: 12, cursor: "pointer", fontSize: 14, textDecoration: "none" }}>Terms of Service</Link>
            </div>
            <div>
              <h4 style={{ fontWeight: 900, marginBottom: 20, letterSpacing: 2, textTransform: "uppercase", fontSize: 15, borderBottom: `4px solid ${C.teal}`, display: "inline-block", paddingBottom: 4, fontFamily: FH }}>Support</h4>
              <a href="mailto:support@sellnsettle.com" style={{ display: "block", color: `${C.navy}99`, fontWeight: 700, marginBottom: 12, cursor: "pointer", fontSize: 14, textDecoration: "none" }}>Contact Us</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ DEMO VIDEO MODAL ═══ */}
      {isVideoOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product demo video"
          onClick={() => setIsVideoOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(10, 25, 47, 0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative", width: "100%", maxWidth: 960,
              background: "#000", border: `4px solid ${C.navy}`,
              borderRadius: 16, boxShadow: shadow(10, 10, C.gold),
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              aria-label="Close video"
              style={{
                position: "absolute", top: 12, right: 12, zIndex: 2,
                width: 40, height: 40, borderRadius: 999,
                background: "#fff", color: C.navy,
                border: `3px solid ${C.navy}`, boxShadow: shadow(3, 3, C.navy),
                fontSize: 20, fontWeight: 900, cursor: "pointer", lineHeight: 1,
                fontFamily: FH,
              }}
            >
              ×
            </button>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${DEMO_VIDEO_ID}?autoplay=1&rel=0`}
                title="SellNSettle product demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute", top: 0, left: 0,
                  width: "100%", height: "100%", border: 0,
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}