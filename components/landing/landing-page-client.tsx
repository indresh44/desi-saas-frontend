"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import sellNSettleIcon from "@/app/sellnsettle-icon.png";

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
   HERO CHAT — Animated with @mention,
   confirmation, invoice card, share chips
   ═══════════════════════════════════════ */

interface HeroChatStep {
  type: "user" | "typing" | "confirm" | "invoice" | "chips";
  delay: number;
}

const HERO_STEPS: HeroChatStep[] = [
  { type: "user", delay: 400 },
  { type: "typing", delay: 1500 },
  { type: "confirm", delay: 2200 },
  { type: "invoice", delay: 3800 },
  { type: "chips", delay: 4200 },
];

function HeroChat() {
  const [v, setV] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    setV(0);
    const timers = HERO_STEPS.map((s, i) =>
      setTimeout(() => setV(i + 1), s.delay)
    );
    const replay = setTimeout(() => setCycle((c) => c + 1), 8500);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(replay);
    };
  }, [cycle]);

  return (
    <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8, overflow: "hidden" }}>
      {/* User message with @mention */}
      {v >= 1 && (
        <div style={{ display: "flex", justifyContent: "flex-end", animation: "popIn 0.3s ease" }}>
          <div style={{
            background: C.navy, color: "#fff",
            padding: "8px 12px", borderRadius: "14px 14px 4px 14px",
            fontSize: 11, lineHeight: 1.45, fontWeight: 500, maxWidth: "88%",
            border: `2px solid ${C.navy}`,
          }}>
            <span style={{ color: C.gold }}>@Rajesh</span> ka invoice banao, modular kitchen ₹2.5L qty 10, due: 28 April
          </div>
        </div>
      )}

      {/* Typing indicator */}
      {v === 2 && (
        <div style={{ display: "flex", gap: 4, paddingLeft: 4, animation: "popIn 0.25s ease" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%", background: "#ccc",
              animation: `dotPulse 1.2s ease ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
      )}

      {/* Confirmation action */}
      {v >= 3 && (
        <div style={{ animation: "popIn 0.3s ease" }}>
          <div style={{
            background: C.gray, border: `2px solid ${C.navy}`,
            borderRadius: "12px 12px 12px 4px", padding: "8px 10px",
            fontSize: 10, lineHeight: 1.4, color: C.navy, fontWeight: 600,
          }}>
            Create invoice for <strong>Rajesh Kumar</strong>?
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              <div style={{
                background: C.teal, color: "#fff", borderRadius: 6,
                padding: "3px 10px", fontSize: 9, fontWeight: 800,
                border: `1.5px solid ${C.navy}`,
              }}>✓ Confirm</div>
              <div style={{
                background: "#fff", borderRadius: 6,
                padding: "3px 10px", fontSize: 9, fontWeight: 700,
                border: `1.5px solid ${C.navy}`, color: C.navy,
              }}>Edit</div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice card with items, qty, total, due date */}
      {v >= 4 && (
        <div style={{ animation: "popIn 0.35s ease" }}>
          <div style={{
            background: "#fff", border: `3px solid ${C.navy}`,
            borderRadius: 12, padding: "10px 12px",
            boxShadow: shadow(3, 3, C.gold),
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 8, fontWeight: 900, color: C.coral, letterSpacing: 1 }}>INVOICE</span>
              <span style={{ fontSize: 8, fontWeight: 900, fontFamily: "monospace", color: C.teal }}>#INV-042</span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.navy, marginBottom: 2 }}>Rajesh Kumar</div>
            <div style={{
              borderTop: `1.5px dashed ${C.navy}33`, marginTop: 4, paddingTop: 4,
              display: "flex", justifyContent: "space-between", fontSize: 9, color: `${C.navy}cc`,
            }}>
              <span>Modular Kitchen × 10</span>
              <span style={{ fontWeight: 800, color: C.navy }}>₹25,00,000</span>
            </div>
            <div style={{
              borderTop: `1.5px solid ${C.navy}`, marginTop: 6, paddingTop: 5,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 8, color: `${C.navy}88` }}>Due: 28 Apr</span>
              <span style={{ fontSize: 14, fontWeight: 900, color: C.navy }}>₹25,00,000</span>
            </div>
          </div>
        </div>
      )}

      {/* Share + WhatsApp chips */}
      {v >= 5 && (
        <div style={{ display: "flex", gap: 5, animation: "popIn 0.3s ease" }}>
          <div style={{
            background: "#fff", border: `2px solid ${C.navy}`,
            borderRadius: 100, padding: "4px 12px",
            fontSize: 10, fontWeight: 800, color: C.navy,
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <Icon name="share" style={{ fontSize: 12 }} /> Share
          </div>
          <div style={{
            background: "#25D366", border: `2px solid ${C.navy}`,
            borderRadius: 100, padding: "4px 12px",
            fontSize: 10, fontWeight: 800, color: "#fff",
            display: "flex", alignItems: "center", gap: 4,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492l4.624-1.467A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.168 0-4.19-.588-5.932-1.61l-.424-.253-2.744.871.882-2.68-.278-.442A9.77 9.77 0 012.182 12c0-5.423 4.395-9.818 9.818-9.818 5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818z"/></svg>
            WhatsApp
          </div>
        </div>
      )}
    </div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {messages.map((m, i) => {
        if (m.from === "user") return (
          <div key={i} style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{
              background: C.gray, border: `3px solid ${C.navy}`,
              padding: "12px 18px", borderRadius: "20px 20px 4px 20px",
              fontWeight: 700, fontSize: 14, fontStyle: "italic", maxWidth: "82%",
            }}>&ldquo;{m.text}&rdquo;</div>
          </div>
        );
        if (m.from === "ai") return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: C.coral, border: `3px solid ${C.navy}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, boxShadow: shadow(3, 3, C.navy),
            }}><Icon name="smart_toy" style={{ color: "#fff", fontSize: 20 }} /></div>
            <p style={{ fontSize: 17, fontWeight: 900, fontFamily: FH, paddingTop: 6 }}>{m.text}</p>
          </div>
        );
        if (m.from === "card" && m.card) {
          const card = m.card;

          return (
          <div key={i} className="demo-card-ml">
            <div style={{
              background: "#fff", border: `3px solid ${C.navy}`,
              padding: "clamp(16px, 2.5vw, 28px)", borderRadius: 20,
              boxShadow: shadow(5, 5, C.gold),
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 16, borderBottom: `2px solid ${C.navy}`, paddingBottom: 10,
              }}>
                <span style={{ fontSize: 20, fontWeight: 900, fontStyle: "italic", fontFamily: FH, letterSpacing: -1 }}>{card.label}</span>
                <span style={{ fontSize: 11, fontWeight: 900, background: C.navy, color: "#fff", padding: "4px 10px" }}>{card.id}</span>
              </div>
              {card.lines.map((line, j) => (
                <div key={j} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: j < card.lines.length - 1 ? `1px dashed ${C.navy}44` : `2px dashed ${C.navy}`,
                }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{line.item} {line.qty && <span style={{ color: `${C.navy}88` }}>{line.qty}</span>}</span>
                  <span style={{ fontWeight: 900, fontFamily: FH }}>{line.amt}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14 }}>
                <span style={{ fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: `${C.navy}88` }}>
                  {card.due ? `Due: ${card.due}` : "Total"}
                </span>
                <span style={{ fontWeight: 900, fontSize: "clamp(22px, 3.5vw, 36px)", color: C.coral, fontFamily: FH }}>{card.total}</span>
              </div>
            </div>
          </div>
          );
        }
        if (m.from === "card" && m.list) {
          const list = m.list;

          return (
          <div key={i} className="demo-card-ml">
            <div style={{
              background: "#fff", border: `3px solid ${C.navy}`,
              borderRadius: 20, boxShadow: shadow(5, 5, C.teal), overflow: "hidden",
            }}>
              {list.map((item, j) => (
                <div key={j} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 18px",
                  borderBottom: j < list.length - 1 ? `2px solid ${C.gray}` : "none",
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    background: item.dot, border: `2px solid ${C.navy}`,
                    boxShadow: `0 0 8px ${item.dot}44`, flexShrink: 0,
                  }} />
                  <div>
                    <p style={{ fontWeight: 900, fontSize: 15, fontFamily: FH }}>{item.name}</p>
                    <p style={{ fontSize: 13, color: `${C.navy}88`, fontWeight: 600 }}>{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          );
        }
        if (m.from === "chips") return (
          <div key={i} className="demo-card-ml" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {m.chips!.map((c, j) => (
              <button key={j} style={{
                background: j === 0 ? C.teal : "#fff",
                color: j === 0 ? "#fff" : C.navy,
                padding: "10px 18px", borderRadius: 100,
                fontWeight: 900, border: `3px solid ${C.navy}`,
                boxShadow: j === 0 ? shadow(3, 3, C.navy) : "none",
                fontSize: 13, cursor: "pointer", fontFamily: FH,
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
  const active = DEMO_TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="flex flex-col lg:flex-row" style={{ maxWidth: 1000, margin: "0 auto", alignItems: "flex-start", gap: 40 }}>
      <div className="w-full lg:w-1/3">
        <h2 style={{ fontFamily: FH, fontSize: 40, fontWeight: 900, color: C.navy, marginBottom: 32, lineHeight: 1 }}>
          See It <br /><span style={{ color: C.coral, fontStyle: "italic", fontSize: 30 }}>IN ACTION</span>
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {DEMO_TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
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
      <div className="w-full lg:w-2/3" style={{ position: "relative" }}>
        <div aria-hidden="true" style={{
          position: "absolute", inset: -40,
          background: `${C.coral}15`,
          borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
          zIndex: 0, transform: "rotate(12deg)",
        }} />
        <div style={{
          position: "relative", zIndex: 1,
          background: "#fff", border: `4px solid ${C.navy}`,
          padding: "clamp(30px, 3vw, 36px)", borderRadius: 32,
          boxShadow: shadow(10, 10, C.teal), minHeight: 360,
        }}>
          <DemoChat messages={active.messages} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */

export default function LandingPageClient() {
  return (
    <div style={{ background: "#fff", color: C.navy, overflowX: "hidden", minHeight: "100vh" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0" rel="stylesheet" />
      <style>{`
        @keyframes popIn { from{opacity:0;transform:translateY(8px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes dotPulse { 0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1} }
        @keyframes blobPulse { 0%,100%{transform:scale(1);opacity:.2}50%{transform:scale(1.05);opacity:.3} }
        .persona-stagger:nth-child(2) { margin-top: 0; }
        .persona-stagger:nth-child(3) { margin-top: 0; }
        @media (min-width: 768px) {
          .persona-stagger:nth-child(2) { margin-top: 36px; }
          .persona-stagger:nth-child(3) { margin-top: 72px; }
        }
        .demo-card-ml { margin-left: 16px; }
        @media (min-width: 768px) { .demo-card-ml { margin-left: 48px; } }
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

      {/* ═══ NAV ═══ */}
      <nav style={{
        position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
        width: "90%", maxWidth: 1100, zIndex: 50,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
        border: `3px solid ${C.navy}`, borderRadius: 100,
        boxShadow: shadow(5, 5, C.coral), padding: "12px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Link href="/" style={{ fontSize: 18, fontWeight: 900, color:'#E8862E', display: "flex", alignItems: "center", gap: 6, fontFamily: FH, textDecoration: "none", flexShrink: 0 }}>
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

      <main style={{ paddingTop: 140 }}>

        {/* ═══ HERO ═══ */}
        <section style={{ padding: "0 24px 72px", position: "relative" }} aria-label="Hero">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16" style={{ maxWidth: 1000, margin: "0 auto" }}>
            <div className="w-full lg:w-3/5" style={{ zIndex: 20 }}>
              {/* CHANGED #7: no "first" claim */}
              <div style={{
                display: "inline-block", padding: "6px 14px", marginBottom: 20,
                fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase",
                color: "#fff", background: C.teal,
                border: `2px solid ${C.navy}`, boxShadow: shadow(4, 4, C.navy), fontFamily: FH,
              }}>🤖 AI-Powered Business Diary for Bharat</div>

              <h1 style={{
                fontFamily: FH, fontSize: "clamp(32px, 5.5vw, 72px)",
                fontWeight: 900, letterSpacing: -2, lineHeight: 0.95, marginBottom: 24, color: C.navy,
              }}>
                Apni business diary, <span style={{ color: C.coral }}>ab AI</span>{" "}
                <span style={{ color: C.gold, fontStyle: "italic" }}>ke saath</span>
              </h1>

              <p style={{ fontSize: 15, color: `${C.navy}cc`, marginBottom: 24, maxWidth: 440, lineHeight: 1.6, fontWeight: 500 }}>
                Track enquiries, send invoices, collect payments — just by chatting. In{" "}
                <span style={{ textDecoration: "underline", textDecorationColor: C.teal, textDecorationThickness: 4, textUnderlineOffset: 4 }}>Hindi, English, ya Hinglish.</span>
              </p>

              <Link href="/register" style={{
                background: C.coral, color: "#fff", padding: "14px 28px", borderRadius: 12,
                fontWeight: 900, fontSize: 16, border: `3px solid ${C.navy}`,
                boxShadow: shadow(6, 6, C.navy), fontFamily: FH,
                display: "inline-block", textDecoration: "none",
              }}>Start free — no card needed</Link>
            </div>

            {/* Phone with animated chat */}
            <div className="w-full lg:w-2/5" style={{ position: "relative", zIndex: 10 }}>
              <div aria-hidden="true" className="hidden lg:block" style={{
                position: "absolute", top: -60, right: -60, width: 280, height: 280,
                background: `${C.gold}33`,
                borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
                zIndex: 0, animation: "blobPulse 4s ease infinite",
              }} />
              <div className="hero-phone mx-auto lg:mx-0" style={{
                position: "relative", zIndex: 1, width: "100%", maxWidth: 240,
                aspectRatio: "9/19", background: C.navy, borderRadius: 36, padding: 7,
                boxShadow: shadow(10, 10, C.teal), border: `3px solid ${C.navy}`,
                transform: "rotate(-4deg) scale(1.05)",
              }}>
                <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 36, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{
                    padding: "24px 16px 12px", borderBottom: `4px solid ${C.navy}`,
                    display: "flex", alignItems: "center", gap: 10, background: C.gray,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", background: C.coral,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: `2px solid ${C.navy}`, boxShadow: shadow(2, 2, C.navy),
                    }}><Icon name="smart_toy" style={{ color: "#fff", fontSize: 18 }} /></div>
                    <div>
                      <p style={{ fontWeight: 900, fontSize: 13, color: C.navy, fontFamily: FH }}>AI Assistant</p>
                      <p style={{ fontSize: 8, color: C.teal, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase" }}>Active Now</p>
                    </div>
                  </div>
                  <HeroChat />
                </div>
              </div>
            </div>
          </div>
        </section>

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

        {/* ═══ COMPARISON — no Vyapar name (#4), with skew ═══ */}
        <section id="comparison" aria-label="Comparison" className="skew-section" style={{ padding: "72px 24px", background: C.navy, color: "#fff", transform: "skewY(2deg)" }}>
          <div style={{ transform: "skewY(-2deg)", maxWidth: 960, margin: "0 auto", padding: "24px 0" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 style={{ fontFamily: FH, fontSize: "clamp(28px, 5vw, 56px)", fontWeight: 900, letterSpacing: -2, marginBottom: 12 }}>
                Billing app se <span style={{ color: C.gold, fontStyle: "italic", textDecoration: "underline", textDecorationColor: C.coral }}>kaise alag?</span>
              </h2>
              <p style={{ fontSize: 16, fontWeight: 600, opacity: 0.5 }}>SellNSettle isn&apos;t just for billing; it&apos;s for managing your whole day.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 28 }}>
              <div style={{ padding: 32, border: "3px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.03)", transform: "rotate(-0.5deg)" }}>
                <h3 style={{ fontSize: 26, fontWeight: 900, marginBottom: 36, display: "flex", alignItems: "center", gap: 12, fontFamily: FH }}>
                  <Icon name="description" style={{ opacity: 0.4 }} /> Generic Billing Apps
                </h3>
                {[
                  { t: "Starts at Billing", d: "You have to wait until the deal is closed." },
                  { t: "Manual Data Entry", d: "Tapping through 20 menus just to add one item." },
                ].map((item) => (
                  <div key={item.t} style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
                    <Icon name="close" style={{ color: C.coral }} />
                    <div>
                      <p style={{ fontWeight: 900, fontSize: 20, marginBottom: 4, fontFamily: FH }}>{item.t}</p>
                      <p style={{ opacity: 0.5, fontSize: 14 }}>{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: 32, border: `3px solid ${C.gold}`, background: "#fff", color: C.navy, transform: "rotate(0.5deg)", boxShadow: shadow(8, 8, C.gold) }}>
                <h3 style={{ fontSize: 26, fontWeight: 900, marginBottom: 36, color: C.coral, display: "flex", alignItems: "center", gap: 12, fontFamily: FH }}>
                  <Icon name="stars" /> SellNSettle
                </h3>
                {[
                  { t: "Starts at Hello", d: "Track from first enquiry to final settlement." },
                  { t: "Chat-based Workflow", d: "Zero forms. Just tell the AI what to do." },
                  { t: "End-to-End Automation", d: "Enquiry → Follow-up → Quote → Invoice." },
                ].map((item) => (
                  <div key={item.t} style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
                    <Icon name="check_circle" style={{ color: C.teal, fontSize: 28 }} />
                    <div>
                      <p style={{ fontWeight: 900, fontSize: 20, marginBottom: 4, fontFamily: FH }}>{item.t}</p>
                      <p style={{ color: `${C.navy}aa`, fontWeight: 700, fontSize: 14 }}>{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PERSONAS — with hover animation (#5) ═══ */}
        <section aria-label="Target audience" style={{ padding: "72px 24px", background: "#fff" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ marginBottom: 48 }}>
              <h2 style={{ fontFamily: FH, fontSize: "clamp(32px, 5vw, 64px)", fontWeight: 900, color: C.navy, letterSpacing: -3, marginBottom: 8 }}>
                Yeh <span style={{ color: C.coral }}>Kiske</span> Liye Hai?
              </h2>
              <p style={{ fontSize: 18, fontWeight: 700, color: `${C.navy}55` }}>Tailored for the modern Indian entrepreneur.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 32 }}>
              {[
                { emoji: "🏠", bg: "#fce4ec", title: "Interior Designers", desc: "Manage multiple site enquiries, send quotes on-site, track material orders.", sc: C.coral, rot: 0.5, mt: 0 },
                { emoji: "📸", bg: "#e0f2f1", title: "Photographers", desc: "Track shoot dates, send booking confirmations, collect advances automatically.", sc: C.teal, rot: -0.5, mt: 36 },
                { emoji: "🎯", bg: "#fff8e1", title: "Freelancers & Coaches", desc: "Record payments instantly, send professional invoices, automate follow-ups.", sc: C.gold, rot: 1, mt: 72 },
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
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64,
                      }}
                      role="img" aria-label={p.title}
                    >{p.emoji}</div>
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
                  Notebook <span style={{ color: C.navy }}>band</span> karo.<br />
                  Chat <span style={{ fontStyle: "italic", fontWeight: 300, opacity: 0.8, textDecoration: "underline" }}>shuru</span> karo.
                </h2>
                <div className="flex flex-col sm:flex-row" style={{ justifyContent: "center", gap: 20 }}>
                  <Link href="/register" style={{
                    background: C.gold, color: C.navy, padding: "18px 32px", borderRadius: 14,
                    fontWeight: 900, fontSize: "clamp(16px, 2.5vw, 20px)",
                    border: `3px solid ${C.navy}`, boxShadow: shadow(6, 6, C.navy),
                    fontFamily: FH, textDecoration: "none", display: "inline-block",
                  }}>Start free — no card needed</Link>
                  <button style={{
                    background: "#fff", color: C.navy, padding: "18px 32px", borderRadius: 14,
                    fontWeight: 900, fontSize: "clamp(16px, 2.5vw, 20px)",
                    border: `3px solid ${C.navy}`, boxShadow: shadow(6, 6, C.navy),
                    fontFamily: FH, cursor: "pointer",
                  }}>Watch Video Demo</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

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
              Empowering India&apos;s small businesses with intelligent conversation-first technology.
            </p>
            <p style={{ fontSize: 11, color: `${C.navy}55`, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase" }}>© 2026 SellNSettle. Made in India with ❤️</p>
          </div>
          <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3" style={{ gap: 32 }}>
            <div>
              <h4 style={{ fontWeight: 900, marginBottom: 20, letterSpacing: 2, textTransform: "uppercase", fontSize: 15, borderBottom: `4px solid ${C.coral}`, display: "inline-block", paddingBottom: 4, fontFamily: FH }}>Company</h4>
              {["Privacy Policy", "Terms of Service"].map((l) => (
                <p key={l} style={{ color: `${C.navy}99`, fontWeight: 700, marginBottom: 12, cursor: "pointer", fontSize: 14 }}>{l}</p>
              ))}
            </div>
            <div>
              <h4 style={{ fontWeight: 900, marginBottom: 20, letterSpacing: 2, textTransform: "uppercase", fontSize: 15, borderBottom: `4px solid ${C.teal}`, display: "inline-block", paddingBottom: 4, fontFamily: FH }}>Support</h4>
              {["Contact Us", "Help Center"].map((l) => (
                <p key={l} style={{ color: `${C.navy}99`, fontWeight: 700, marginBottom: 12, cursor: "pointer", fontSize: 14 }}>{l}</p>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}