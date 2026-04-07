"use client";

import Link from "next/link";

/* ═══════════════════════════════════════════
   Blog Post 8 — Freelancer Payment Collection Tips India
   Design: Neobrutalist — thick borders, offset shadows, coral/teal/gold/navy
   Language: English (no toggle)
   ═══════════════════════════════════════════ */

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

// ── Decorative SVG blobs ──
function BlobDivider({ color, flip }: { color: string; flip?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: "100%",
        height: 120,
        display: "flex",
        justifyContent: flip ? "flex-end" : "flex-start",
        alignItems: "center",
        overflow: "hidden",
        opacity: 0.12,
      }}
    >
      <svg width="400" height="120" viewBox="0 0 400 120" fill="none">
        <ellipse
          cx={flip ? 300 : 100}
          cy="60"
          rx="200"
          ry="60"
          fill={color}
          style={{ transform: flip ? "rotate(-8deg)" : "rotate(8deg)" }}
        />
        <circle cx={flip ? 150 : 280} cy="40" r="30" fill={color} opacity="0.5" />
        <circle cx={flip ? 80 : 340} cy="80" r="18" fill={color} opacity="0.3" />
      </svg>
    </div>
  );
}

// ── Tip card ──
function TipCard({
  number,
  title,
  icon,
  color,
  shadowColor,
  children,
}: {
  number: string;
  title: string;
  icon: string;
  color: string;
  shadowColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `4px solid ${C.navy}`,
        padding: 0,
        boxShadow: shadow(8, 8, shadowColor),
        overflow: "hidden",
        marginBottom: 48,
      }}
    >
      <div
        style={{
          background: color,
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          borderBottom: `4px solid ${C.navy}`,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "#fff",
            border: `3px solid ${C.navy}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FH,
            fontSize: 24,
            fontWeight: 900,
            color: C.navy,
            flexShrink: 0,
            boxShadow: shadow(3, 3, C.navy),
          }}
        >
          {number}
        </div>
        <div>
          <span
            style={{
              fontFamily: "'Material Symbols Outlined'",
              fontSize: 18,
              color: color === C.navy ? "#fff" : C.navy,
              opacity: 0.5,
              display: "block",
              marginBottom: 2,
            }}
          >
            {icon}
          </span>
          <h2
            style={{
              fontFamily: FH,
              fontSize: "clamp(18px, 3vw, 24px)",
              fontWeight: 900,
              color: color === C.navy ? "#fff" : C.navy,
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>
      </div>
      <div
        style={{
          padding: "24px 28px",
          fontSize: 16,
          lineHeight: 1.75,
          color: `${C.navy}dd`,
          fontWeight: 500,
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Pull quote ──
function PullQuote({ text, color }: { text: string; color: string }) {
  return (
    <div
      style={{
        margin: "48px 0",
        padding: "28px 32px",
        borderLeft: `8px solid ${color}`,
        background: C.gray,
        fontSize: "clamp(17px, 2.5vw, 21px)",
        fontWeight: 800,
        fontFamily: FH,
        color: C.navy,
        lineHeight: 1.4,
        fontStyle: "italic",
        position: "relative",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -8,
          left: 16,
          fontSize: 56,
          color,
          opacity: 0.15,
          lineHeight: 1,
          fontStyle: "normal",
        }}
      >
        &ldquo;
      </span>
      {text}
    </div>
  );
}

// ── Script card ──
function ScriptCard({
  label,
  text,
  color,
}: {
  label: string;
  text: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `3px solid ${color}`,
        padding: "18px 22px",
        position: "relative",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -11,
          left: 14,
          background: color,
          color: "#fff",
          padding: "2px 10px",
          fontSize: 10,
          fontWeight: 900,
          fontFamily: FH,
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.65,
          color: C.navy,
          fontWeight: 500,
          fontStyle: "italic",
          marginTop: 4,
        }}
      >
        &ldquo;{text}&rdquo;
      </p>
    </div>
  );
}

// ── Do / Don't card ──
function DoDontCard({
  dos,
  donts,
}: {
  dos: string[];
  donts: string[];
}) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2"
      style={{ gap: 0, margin: "28px 0", border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.gold) }}
    >
      {/* DO */}
      <div style={{ background: "#F0FDF4", padding: "20px 22px", borderRight: `2px solid ${C.navy}` }}>
        <div
          style={{
            fontFamily: FH,
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: 2,
            color: "#16a34a",
            marginBottom: 14,
          }}
        >
          ✓ DO
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {dos.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: C.navy, fontWeight: 500 }}>
              <span style={{ color: "#16a34a", fontWeight: 900, flexShrink: 0 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      {/* DON'T */}
      <div style={{ background: "#FFF5F5", padding: "20px 22px", borderLeft: `2px solid ${C.navy}` }}>
        <div
          style={{
            fontFamily: FH,
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: 2,
            color: C.coral,
            marginBottom: 14,
          }}
        >
          ✗ DON&apos;T
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {donts.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14, color: C.navy, fontWeight: 500 }}>
              <span style={{ color: C.coral, fontWeight: 900, flexShrink: 0 }}>✗</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Milestone bar ──
function MilestoneBar() {
  const milestones = [
    { label: "Project Start", pct: "30%", emoji: "🚀", color: C.coral, desc: "Advance before work begins" },
    { label: "Mid-delivery", pct: "40%", emoji: "🏗️", color: C.gold, desc: "On client approval of first draft" },
    { label: "Final delivery", pct: "30%", emoji: "✅", color: C.teal, desc: "On handover / completion" },
  ];
  return (
    <div
      style={{
        margin: "28px 0",
        border: `4px solid ${C.navy}`,
        background: "#fff",
        boxShadow: shadow(6, 6, C.coral),
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: C.navy,
          padding: "12px 20px",
          fontFamily: FH,
          fontWeight: 900,
          fontSize: 13,
          color: "#fff",
          letterSpacing: 1,
        }}
      >
        MILESTONE BILLING — EXAMPLE
      </div>
      <div style={{ padding: "20px 20px 16px" }}>
        {/* Progress bar */}
        <div
          style={{
            display: "flex",
            height: 20,
            border: `3px solid ${C.navy}`,
            overflow: "hidden",
            marginBottom: 18,
          }}
        >
          {milestones.map((m) => (
            <div
              key={m.label}
              style={{
                flex: parseInt(m.pct),
                background: m.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 900,
                color: m.color === C.gold ? C.navy : "#fff",
                fontFamily: FH,
                borderRight: `2px solid ${C.navy}`,
              }}
            >
              {m.pct}
            </div>
          ))}
        </div>
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 12 }}>
          {milestones.map((m) => (
            <div
              key={m.label}
              style={{
                border: `3px solid ${m.color}`,
                padding: "12px 14px",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -11,
                  left: 10,
                  background: m.color,
                  color: m.color === C.gold ? C.navy : "#fff",
                  padding: "1px 8px",
                  fontSize: 10,
                  fontWeight: 900,
                  fontFamily: FH,
                }}
              >
                {m.pct}
              </div>
              <div style={{ fontSize: 20, marginBottom: 4, marginTop: 4 }}>{m.emoji}</div>
              <div style={{ fontFamily: FH, fontWeight: 800, fontSize: 13, color: C.navy, marginBottom: 4 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 12, color: `${C.navy}88`, fontWeight: 500 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Escalation timeline ──
function EscalationTimeline() {
  const steps = [
    {
      range: "Day 1–7",
      color: C.teal,
      dot: "#22c55e",
      title: "Polite reminders",
      desc: "Send 2–3 gentle reminders with the invoice attached. Assume good faith — they may just be busy.",
    },
    {
      range: "Day 7–14",
      color: C.gold,
      dot: "#eab308",
      title: "Direct message",
      desc: "Ask directly: \"Is there an issue with the payment? Happy to discuss if needed.\" This opens the door without confrontation.",
    },
    {
      range: "Day 14–30",
      color: C.coral,
      dot: "#ef4444",
      title: "Written notice",
      desc: "Send a formal notice via email. Subject: \"Outstanding Payment — Invoice #[N].\" Creates a paper trail if things escalate.",
    },
    {
      range: "Day 30+",
      color: C.navy,
      dot: C.navy,
      title: "Evaluate the relationship",
      desc: "Decide whether to continue working with this client. For future projects, require full advance from clients with poor payment history.",
    },
  ];
  return (
    <div
      style={{
        margin: "28px 0",
        border: `4px solid ${C.navy}`,
        background: "#fff",
        boxShadow: shadow(6, 6, C.navy),
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: C.navy,
          padding: "12px 20px",
          fontFamily: FH,
          fontWeight: 900,
          fontSize: 13,
          color: "#fff",
          letterSpacing: 1,
        }}
      >
        WHEN A CLIENT GHOSTS — ESCALATION PLAYBOOK
      </div>
      <div style={{ padding: "20px" }}>
        {steps.map((s, i) => (
          <div
            key={s.range}
            style={{
              display: "flex",
              gap: 16,
              marginBottom: i < steps.length - 1 ? 20 : 0,
              alignItems: "flex-start",
            }}
          >
            {/* Timeline line + dot */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: s.dot,
                  border: `2px solid ${C.navy}`,
                  marginTop: 3,
                }}
              />
              {i < steps.length - 1 && (
                <div style={{ width: 2, flex: 1, background: `${C.navy}22`, minHeight: 32, marginTop: 2 }} />
              )}
            </div>
            {/* Content */}
            <div style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 8 : 0 }}>
              <div
                style={{
                  display: "inline-block",
                  background: s.color,
                  color: s.color === C.gold ? C.navy : "#fff",
                  padding: "2px 10px",
                  fontSize: 10,
                  fontWeight: 900,
                  fontFamily: FH,
                  marginBottom: 6,
                }}
              >
                {s.range}
              </div>
              <div style={{ fontFamily: FH, fontWeight: 800, fontSize: 15, color: C.navy, marginBottom: 4 }}>
                {s.title}
              </div>
              <div style={{ fontSize: 13, color: `${C.navy}99`, fontWeight: 500, lineHeight: 1.6 }}>
                {s.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mini dashboard mockup ──
function OutstandingDashboard() {
  const clients = [
    { name: "Anjali Mehta", amount: "₹75,000", days: "12 days overdue", bar: 75, color: C.coral },
    { name: "Vikram Constructions", amount: "₹1,20,000", days: "5 days overdue", bar: 100, color: C.gold },
    { name: "Neha Photography", amount: "₹18,000", days: "Due today", bar: 18, color: C.teal },
    { name: "Amit Coaching", amount: "₹9,500", days: "Due in 3 days", bar: 10, color: `${C.teal}88` },
  ];
  return (
    <div
      style={{
        margin: "28px 0",
        border: `4px solid ${C.navy}`,
        background: "#fff",
        boxShadow: shadow(6, 6, C.teal),
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: C.navy,
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 13, color: "#fff", letterSpacing: 1 }}>
          OUTSTANDING BY CLIENT
        </span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
          Total: ₹2,22,500
        </span>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
        {clients.map((c) => (
          <div key={c.name}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <span style={{ fontFamily: FH, fontWeight: 800, fontSize: 14, color: C.navy }}>{c.name}</span>
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 11,
                    color: c.days.includes("overdue") ? C.coral : `${C.navy}66`,
                    fontWeight: 700,
                  }}
                >
                  {c.days}
                </span>
              </div>
              <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 15, color: C.navy }}>{c.amount}</span>
            </div>
            <div
              style={{
                height: 6,
                background: `${C.navy}10`,
                border: `1px solid ${C.navy}22`,
              }}
            >
              <div
                style={{
                  width: `${c.bar}%`,
                  height: "100%",
                  background: c.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "10px 20px",
          borderTop: `2px solid ${C.navy}15`,
          fontSize: 11,
          color: `${C.navy}55`,
          fontStyle: "italic",
        }}
      >
        Ask your AI: &ldquo;Kitna outstanding hai?&rdquo; — instant answer, no spreadsheet needed.
      </div>
    </div>
  );
}

// ── Before / After comparison card ──
function BeforeAfterCard({
  beforeTitle,
  beforeItems,
  afterTitle,
  afterItems,
}: {
  beforeTitle: string;
  beforeItems: string[];
  afterTitle: string;
  afterItems: string[];
}) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2"
      style={{ gap: 0, margin: "28px 0", border: `4px solid ${C.navy}`, boxShadow: shadow(6, 6, C.coral) }}
    >
      <div style={{ background: "#FFF5F5", padding: "20px 22px", borderRight: `2px solid ${C.navy}` }}>
        <div
          style={{
            fontFamily: FH,
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: 2,
            color: C.coral,
            marginBottom: 12,
          }}
        >
          ❌ {beforeTitle}
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {beforeItems.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: C.navy, fontWeight: 500 }}>
              <span style={{ color: C.coral, flexShrink: 0 }}>✗</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ background: "#F0FDF4", padding: "20px 22px", borderLeft: `2px solid ${C.navy}` }}>
        <div
          style={{
            fontFamily: FH,
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: 2,
            color: "#16a34a",
            marginBottom: 12,
          }}
        >
          ✅ {afterTitle}
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {afterItems.map((item, i) => (
            <li key={i} style={{ display: "flex", gap: 8, fontSize: 13, color: C.navy, fontWeight: 500 }}>
              <span style={{ color: "#16a34a", flexShrink: 0 }}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── Payment methods card ──
function PaymentMethodsCard() {
  const methods = [
    { icon: "📱", name: "UPI", speed: "Instant", note: "Include your UPI ID on every invoice. Add QR code if possible.", color: C.teal },
    { icon: "🏦", name: "Bank Transfer (NEFT/IMPS)", speed: "Same day", note: "For large amounts — add account details to invoice footer.", color: C.gold },
    { icon: "💵", name: "Cash", speed: "Instant", note: "Fine for local work. Always issue a receipt.", color: C.coral },
  ];
  return (
    <div
      style={{
        margin: "28px 0",
        border: `4px solid ${C.navy}`,
        background: "#fff",
        boxShadow: shadow(6, 6, C.teal),
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: C.navy,
          padding: "12px 20px",
          fontFamily: FH,
          fontWeight: 900,
          fontSize: 13,
          color: "#fff",
          letterSpacing: 1,
        }}
      >
        PAYMENT METHODS — INCLUDE ALL ON YOUR INVOICE
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {methods.map((m) => (
          <div
            key={m.name}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              padding: "12px 14px",
              border: `3px solid ${m.color}`,
              position: "relative",
            }}
          >
            <span style={{ fontSize: 24, flexShrink: 0 }}>{m.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontFamily: FH, fontWeight: 900, fontSize: 14, color: C.navy }}>{m.name}</span>
                <span
                  style={{
                    background: m.color,
                    color: m.color === C.gold ? C.navy : "#fff",
                    padding: "1px 8px",
                    fontSize: 10,
                    fontWeight: 900,
                    fontFamily: FH,
                  }}
                >
                  {m.speed}
                </span>
              </div>
              <div style={{ fontSize: 13, color: `${C.navy}88`, fontWeight: 500 }}>{m.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════
// MAIN POST COMPONENT
// ═══════════════════════════════
export default function Post8Content() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@400,0"
        rel="stylesheet"
      />

      {/* ═══ HERO BANNER ═══ */}
      <div
        style={{
          background: C.navy,
          padding: "100px 32px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -60,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            background: `${C.teal}1a`,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -30,
            left: -50,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: `${C.coral}15`,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 40,
            left: "40%",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: `${C.gold}12`,
          }}
        />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          <nav
            className="text-sm mb-6"
            style={{ color: "rgba(255,255,255,0.4)" }}
            aria-label="Breadcrumb"
          >
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
              Home
            </Link>
            {" / "}
            <Link href="/blog" style={{ color: "inherit", textDecoration: "none" }}>
              Blog
            </Link>
            {" / "}
            <span style={{ color: "rgba(255,255,255,0.6)" }}>Payment Collection</span>
          </nav>

          <div
            style={{
              display: "inline-block",
              background: C.teal,
              color: C.navy,
              padding: "4px 14px",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: FH,
              marginBottom: 20,
              border: `2px solid ${C.navy}`,
            }}
          >
            Payments
          </div>

          <h1
            style={{
              fontFamily: FH,
              fontSize: "clamp(26px, 5vw, 46px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: -1.5,
              marginBottom: 20,
            }}
          >
            Freelancer Payment Collection Tips —{" "}
            <span style={{ color: C.coral }}>Never Chase Clients Again</span>
          </h1>

          <p
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 500,
              marginBottom: 20,
              lineHeight: 1.6,
              maxWidth: 560,
            }}
          >
            7 practical tips for Indian freelancers and small service businesses to get paid
            on time — without awkward conversations or endless follow-ups.
          </p>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <time dateTime="2026-04-25">April 25, 2026</time>
            <span>·</span>
            <span>6 min read</span>
          </div>
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Intro */}
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.8,
            color: `${C.navy}cc`,
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          Ask any freelancer in India what their biggest problem is, and nine out of ten will
          say the same thing: <strong>collecting payment.</strong>
        </p>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.8,
            color: `${C.navy}aa`,
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          The project is done. The client loved it. But the money? Still pending. You send a
          reminder — awkward. You follow up again — feels desperate. You wait — the invoice is
          now 45 days overdue and the client has gone silent.
        </p>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.8,
            color: `${C.navy}aa`,
            fontWeight: 500,
            marginBottom: 32,
          }}
        >
          Here&apos;s the thing: late payments are rarely about clients being bad people.
          They happen because the payment process wasn&apos;t structured from the start. These
          7 tips fix that — systematically.
        </p>

        <PullQuote
          text="You don't chase clients who owe you money. You set up systems that make not paying awkward for them."
          color={C.coral}
        />

        <BlobDivider color={C.coral} />

        {/* ─── TIP 1 ─── */}
        <TipCard
          number="01"
          title="Set payment expectations before the project starts"
          icon="handshake"
          color={C.coral}
          shadowColor={C.coral}
        >
          <p>
            The #1 reason freelancers struggle to collect payment: they never formally
            agreed to payment terms. The conversation was verbal, vague, or happened
            after the work was delivered. By then, the client has all the leverage.
          </p>

          <BeforeAfterCard
            beforeTitle="NO TERMS DISCUSSED"
            beforeItems={[
              "Project discussed over WhatsApp, payment never mentioned",
              "Work delivered, then awkwardly asked for payment",
              "Client says \"send me the bill\" — you scramble to create one",
              "30 days later, still following up",
            ]}
            afterTitle="CLEAR TERMS FROM DAY 1"
            afterItems={[
              "Payment terms in your proposal/quote: advance %, due date, method",
              "Work begins only after advance is received",
              "Invoice sent within 24 hours of delivery",
              "Client knows the due date — and so do you",
            ]}
          />

          <p>
            Discuss payment in the <strong>first meeting</strong>, not after delivery. Include
            it in your proposal or quote document. Something as simple as: &ldquo;My terms
            are 50% advance before I start, remaining on delivery within 7 days.&rdquo;
          </p>
          <p style={{ marginTop: 12 }}>
            Said upfront, it sounds professional. Said after delivery, it sounds desperate.
            The words are identical — the timing changes everything.
          </p>
        </TipCard>

        {/* ─── TIP 2 ─── */}
        <TipCard
          number="02"
          title="Send your invoice immediately — delay = delayed payment"
          icon="bolt"
          color={C.teal}
          shadowColor={C.teal}
        >
          <p>
            You wrap up a project on Friday. You think, &ldquo;invoice banaunga weekend
            ke baad.&rdquo; Monday is busy. Tuesday too. By Thursday, a week has passed
            and you still haven&apos;t sent the invoice.
          </p>
          <p style={{ marginTop: 12 }}>
            Meanwhile, the client has moved on mentally. The excitement of the project
            is gone. Payment feels like an afterthought — to both of you.
          </p>

          <PullQuote
            text="The closer the invoice is to the completed work, the faster the payment. Every day of delay gives the client one more day to forget."
            color={C.teal}
          />

          <p>
            Invoice on the same day as delivery. If the project is large, invoice at each
            milestone (more on this in Tip 4). The invoice shouldn&apos;t be something
            you build in Excel for 30 minutes — it should take 30 seconds so there&apos;s
            no reason to delay.
          </p>
          <div
            style={{
              marginTop: 20,
              padding: "14px 18px",
              background: C.gray,
              borderLeft: `4px solid ${C.teal}`,
              fontSize: 14,
              fontWeight: 700,
              color: C.navy,
            }}
          >
            <strong>Rule:</strong> Never sleep on an uninvoiced delivery. If the work is done,
            the invoice goes out today.
          </div>
        </TipCard>

        <BlobDivider color={C.teal} flip />

        {/* ─── TIP 3 ─── */}
        <TipCard
          number="03"
          title="Offer multiple payment methods — remove all friction"
          icon="payments"
          color={C.gold}
          shadowColor={C.gold}
        >
          <p>
            &ldquo;Client ne bola next week karenge&rdquo; — sometimes this is genuine delay.
            Sometimes it&apos;s because you only have one payment option and it&apos;s not
            convenient for them. Remove every possible excuse.
          </p>

          <PaymentMethodsCard />

          <p>
            Put <strong>all your payment details on every invoice</strong> — not just in a
            message. UPI ID, account number, IFSC. Never assume the client has saved your
            details from a previous project. Make it so easy that the only reason not to
            pay is not wanting to pay.
          </p>
        </TipCard>

        {/* ─── TIP 4 ─── */}
        <TipCard
          number="04"
          title="Use milestone billing for large projects"
          icon="stairs"
          color={C.navy}
          shadowColor={C.navy}
        >
          <p>
            For a ₹1.5L interior design project or a 3-month coaching engagement, waiting
            for full payment at the end is risky — and puts unnecessary pressure on the
            client at once. Break it up.
          </p>

          <MilestoneBar />

          <p>
            This approach works for most service businesses: designers, photographers,
            coaches, developers, content creators. The exact percentages can vary —
            the principle is the same: <strong>don&apos;t do work you haven&apos;t been paid for yet.</strong>
          </p>
          <p style={{ marginTop: 12 }}>
            Milestone billing also makes disputes smaller. If a client is unhappy at
            delivery, the only outstanding amount is 30% — not 100%. You&apos;ve already
            collected 70% for work that was accepted.
          </p>
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              background: C.gray,
              borderLeft: `4px solid ${C.navy}`,
              fontSize: 13,
              fontWeight: 600,
              color: `${C.navy}bb`,
            }}
          >
            <strong style={{ color: C.navy }}>Note:</strong> SellNSettle doesn&apos;t have
            built-in milestone billing — but you can create a separate invoice per milestone,
            each with its own due date. Same result, just manual.
          </div>
        </TipCard>

        <BlobDivider color={C.gold} />

        {/* ─── TIP 5 ─── */}
        <TipCard
          number="05"
          title="Send payment reminders — take the awkwardness out"
          icon="notifications_active"
          color={C.coral}
          shadowColor={C.teal}
        >
          <p>
            &ldquo;Paisa maangna bura lagta hai.&rdquo; This is the most common reason
            freelancers don&apos;t follow up. But here&apos;s the reframe:{" "}
            <strong>you&apos;re not asking for a favour. You&apos;re collecting what was agreed.</strong>
          </p>
          <p style={{ marginTop: 12 }}>
            Your electrician sends reminders. Your gym sends reminders. Your phone
            company sends reminders. It&apos;s not rude — it&apos;s professional.
            The right message, sent at the right time, gets paid without drama.
          </p>

          <div style={{ marginTop: 20 }}>
            <ScriptCard
              label="ON THE DUE DATE"
              text="Hi Anjali ji, just a gentle reminder — Invoice #INV-021 of ₹35,000 is due today for the brand shoot. Payment details are on the invoice. UPI: yourname@okaxis. Thank you! 🙏"
              color={C.teal}
            />
            <ScriptCard
              label="3 DAYS AFTER DUE DATE"
              text="Anjali ji, the payment of ₹35,000 (Invoice #021) is 3 days overdue. Could you let me know when to expect it? Happy to answer any questions."
              color={C.gold}
            />
            <ScriptCard
              label="7 DAYS AFTER DUE DATE"
              text="Anjali ji, Invoice #021 (₹35,000) is now 7 days past due. Please process the payment at your earliest. I&apos;ve reattached the invoice for reference."
              color={C.coral}
            />
          </div>

          <p style={{ marginTop: 12 }}>
            For more templates in Hindi and English, see{" "}
            <Link href="/blog/payment-reminder-templates-hindi-english" style={{ color: C.teal, fontWeight: 700 }}>
              Payment Reminder Messages — 10 Templates
            </Link>.
          </p>
        </TipCard>

        {/* ─── TIP 6 ─── */}
        <TipCard
          number="06"
          title="What to do when a client ghosts on payment"
          icon="do_not_disturb"
          color={C.teal}
          shadowColor={C.gold}
        >
          <p>
            You&apos;ve sent three reminders. No response. The client has read your
            messages (blue ticks) but hasn&apos;t replied. This situation is stressful —
            but panicking or going silent both make it worse. Here&apos;s the playbook:
          </p>

          <EscalationTimeline />

          <p>
            The written notice at Day 14–30 is important even if you never intend to
            take legal action. It signals seriousness and creates a record. Many clients
            who ghost on payment respond once they receive a formal email — because it
            feels real in a way WhatsApp messages don&apos;t.
          </p>
          <p style={{ marginTop: 12 }}>
            And if you reach Day 30+ with no resolution — at minimum, this client goes on
            your &ldquo;advance required&rdquo; list. Don&apos;t start new work until the
            previous payment is cleared.
          </p>
        </TipCard>

        <BlobDivider color={C.navy} flip />

        {/* ─── TIP 7 ─── */}
        <TipCard
          number="07"
          title="Track everything — so you always know who owes what"
          icon="bar_chart"
          color={C.gold}
          shadowColor={C.coral}
        >
          <p>
            If you asked right now: &ldquo;How much is outstanding across all your clients?&rdquo;
            — could you answer in 10 seconds? For most freelancers, it&apos;s a 15-minute
            exercise involving Excel, WhatsApp scroll, and a memory check.
          </p>
          <p style={{ marginTop: 12 }}>
            That blind spot is expensive. You don&apos;t follow up on what you can&apos;t see.
            Invoices that aren&apos;t tracked become invoices that aren&apos;t paid.
          </p>

          <OutstandingDashboard />

          <p>
            When you can see at a glance who owes what and for how long, you know exactly
            who to follow up with today. No mental gymnastics. No checking three apps.
            Just act on what you see.
          </p>
          <div
            style={{
              marginTop: 16,
              padding: "14px 18px",
              background: C.gray,
              borderLeft: `4px solid ${C.gold}`,
              fontSize: 14,
              fontWeight: 700,
              color: C.navy,
            }}
          >
            <strong>Also track:</strong> Which clients consistently pay late? After 2–3 incidents,
            adjust your terms for them — higher advance, shorter payment window, or simply
            don&apos;t take on new work until the old invoice clears.
          </div>
        </TipCard>

        {/* ═══ CTA SECTION ═══ */}
        <div
          style={{
            background: C.gray,
            border: `4px solid ${C.navy}`,
            padding: "36px 32px",
            boxShadow: shadow(8, 8, C.teal),
            marginTop: 48,
          }}
        >
          <h2
            style={{
              fontFamily: FH,
              fontSize: 26,
              fontWeight: 900,
              color: C.navy,
              marginBottom: 8,
            }}
          >
            How SellNSettle helps with this
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: `${C.navy}bb`,
              fontWeight: 500,
              marginBottom: 20,
            }}
          >
            <Link href="/" style={{ color: C.teal, fontWeight: 700 }}>
              SellNSettle
            </Link>{" "}
            is a chat-first CRM for Indian freelancers and small service businesses.
            Here&apos;s how it maps to what we covered:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {[
              {
                tip: "Fast invoicing (Tip 2)",
                desc: "Create invoices by chatting — \"Invoice banao @Anjali ke liye brand shoot 35K.\" PDF in one tap. No Excel, no forms.",
              },
              {
                tip: "WhatsApp sharing (Tip 3)",
                desc: "Share the actual PDF invoice on WhatsApp in one tap via the Web Share API. Not a link — the file itself.",
              },
              {
                tip: "Outstanding tracking (Tip 7)",
                desc: "Ask \"Kitna outstanding hai?\" — AI shows all unpaid invoices with amounts and days overdue. No spreadsheet needed.",
              },
              {
                tip: "Payment reminders (Tip 5)",
                desc: "Ask AI to draft a polite reminder with invoice details. You share it via WhatsApp. Not automated — but takes 10 seconds.",
              },
              {
                tip: "Payment recording",
                desc: "Record a payment by chat — \"Payment mili ₹35K UPI se @Anjali ki.\" History maintained per client automatically.",
              },
              {
                tip: "Revenue summary",
                desc: "Month-over-month billing summary, outstanding by client, and pipeline view — all available via chat or dashboard.",
              },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "10px 14px",
                  background: "#fff",
                  border: `2px solid ${C.navy}22`,
                }}
              >
                <span
                  style={{
                    color: C.teal,
                    fontWeight: 900,
                    fontSize: 16,
                    lineHeight: 1.5,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                <div>
                  <strong style={{ color: C.navy, fontSize: 14 }}>{item.tip}:</strong>{" "}
                  <span style={{ color: `${C.navy}99`, fontSize: 14 }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 14,
              color: `${C.navy}88`,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            Works in <strong>Hindi, English, or Hinglish</strong>. No card required during early access.
          </p>

          <Link
            href="/register"
            style={{
              display: "inline-block",
              background: C.coral,
              color: "#fff",
              padding: "16px 32px",
              fontWeight: 900,
              fontSize: 18,
              border: `4px solid ${C.navy}`,
              boxShadow: shadow(6, 6, C.navy),
              textDecoration: "none",
              fontFamily: FH,
            }}
          >
            Start your early access — free →
          </Link>
        </div>

        {/* ═══ RELATED POSTS ═══ */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `4px solid ${C.gray}` }}>
          <h3
            style={{
              fontFamily: FH,
              fontWeight: 900,
              fontSize: 20,
              color: C.navy,
              marginBottom: 16,
            }}
          >
            Related articles
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                href: "/blog/payment-reminder-templates-hindi-english",
                title: "Payment Reminder Messages — 10 Templates in Hindi & English",
                color: C.coral,
              },
              {
                href: "/blog/how-to-send-professional-invoice-interior-designer",
                title: "How to Send a Professional Invoice as an Interior Designer",
                color: C.teal,
              },
              {
                href: "/blog/interior-design-client-management-tips",
                title: "Interior Design Client Management: 7 Tips That Actually Work",
                color: C.gold,
              },
            ].map((post) => (
              <Link
                key={post.href}
                href={post.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 18px",
                  border: `3px solid ${C.navy}22`,
                  textDecoration: "none",
                  color: C.navy,
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: post.color,
                    flexShrink: 0,
                  }}
                />
                {post.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
