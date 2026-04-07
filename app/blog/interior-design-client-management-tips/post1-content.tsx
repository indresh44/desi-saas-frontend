"use client";

import Link from "next/link";

/* ═══════════════════════════════════════════
   Blog Post 1 — Visual Design
   Matches the neobrutalist landing page energy
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

// ── Tip card component ──
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
        borderRadius: 0,
        padding: 0,
        boxShadow: shadow(8, 8, shadowColor),
        overflow: "hidden",
        marginBottom: 48,
      }}
    >
      {/* Tip header */}
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
            className="material-symbols-outlined"
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
      {/* Tip body */}
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
        fontSize: "clamp(18px, 2.5vw, 22px)",
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
          fontSize: 60,
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

// ── Visual diagram: stages flow ──
function StagesFlow() {
  const stages = [
    { label: "New Enquiry", emoji: "📋", bg: "#E0F2F1" },
    { label: "Site Visited", emoji: "🏠", bg: "#FFF3E0" },
    { label: "Quote Sent", emoji: "📄", bg: "#F3E5F5" },
    { label: "Approved", emoji: "✅", bg: "#E8F5E9" },
    { label: "Invoiced", emoji: "🧾", bg: "#FFF8E1" },
    { label: "Payment Done", emoji: "💰", bg: "#E1F5FE" },
  ];

  return (
    <div
      style={{
        margin: "36px 0",
        padding: "24px",
        background: "#fff",
        border: `4px solid ${C.navy}`,
        borderRadius: 0,
        boxShadow: shadow(6, 6, C.teal),
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          minWidth: "fit-content",
        }}
      >
        {stages.map((stage, i) => (
          <div key={stage.label} style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                background: stage.bg,
                border: `3px solid ${C.navy}`,
                borderRadius: 0,
                padding: "14px 18px",
                textAlign: "center",
                minWidth: 100,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{stage.emoji}</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: C.navy,
                  fontFamily: FH,
                  whiteSpace: "nowrap",
                }}
              >
                {stage.label}
              </div>
            </div>
            {i < stages.length - 1 && (
              <div
                style={{
                  width: 32,
                  height: 4,
                  background: C.navy,
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Invoice comparison visual ──
function InvoiceComparison() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2"
      style={{ gap: 20, margin: "36px 0" }}
    >
      {/* Bad example */}
      <div
        style={{
          border: `3px solid ${C.coral}`,
          borderRadius: 0,
          padding: 20,
          background: "#FFF5F5",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -12,
            left: 16,
            background: C.coral,
            color: "#fff",
            padding: "3px 12px",
            fontSize: 11,
            fontWeight: 900,
            fontFamily: FH,
          }}
        >
          ❌ UNPROFESSIONAL
        </div>
        <div
          style={{
            background: "#E8F5E9",
            borderRadius: 12,
            padding: "14px 18px",
            marginTop: 8,
            fontSize: 14,
            color: "#333",
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 12, marginBottom: 6, color: "#999" }}>
            WhatsApp message:
          </p>
          Modular kitchen 2.5L + hardware 80K + labour 40K = 3.7L.
          <br />
          30% advance = 1.11L
          <br />
          UPI: xyz@oksbi
        </div>
      </div>

      {/* Good example */}
      <div
        style={{
          border: `3px solid ${C.teal}`,
          borderRadius: 0,
          padding: 20,
          background: "#F0FDFA",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -12,
            left: 16,
            background: C.teal,
            color: "#fff",
            padding: "3px 12px",
            fontSize: 11,
            fontWeight: 900,
            fontFamily: FH,
          }}
        >
          ✅ PROFESSIONAL
        </div>
        <div
          style={{
            background: "#fff",
            border: `2px solid ${C.navy}`,
            borderRadius: 0,
            padding: "14px 18px",
            marginTop: 8,
            fontSize: 13,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
              borderBottom: `1px solid ${C.navy}22`,
              paddingBottom: 6,
            }}
          >
            <span style={{ fontWeight: 900, fontSize: 14, fontFamily: FH }}>
              INVOICE
            </span>
            <span style={{ fontSize: 10, color: "#999" }}>#INV-042</span>
          </div>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 10 }}>
            <strong>Rajesh Kumar</strong> · Due: 15 April
          </div>
          {[
            { item: "Modular Kitchen", qty: "×1", amt: "₹2,50,000" },
            { item: "Hardware (Hettich)", qty: "×set", amt: "₹80,000" },
            { item: "Labour", qty: "", amt: "₹40,000" },
          ].map((line, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                padding: "4px 0",
                borderBottom: i < 2 ? "1px dashed #eee" : "none",
              }}
            >
              <span>
                {line.item}{" "}
                <span style={{ color: "#999" }}>{line.qty}</span>
              </span>
              <span style={{ fontWeight: 700 }}>{line.amt}</span>
            </div>
          ))}
          <div
            style={{
              borderTop: `2px solid ${C.navy}`,
              marginTop: 8,
              paddingTop: 8,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: 1 }}>
              TOTAL
            </span>
            <span
              style={{
                fontWeight: 900,
                fontSize: 18,
                color: C.coral,
                fontFamily: FH,
              }}
            >
              ₹3,70,000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Follow-up script card ──
function ScriptCard({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `3px solid ${color}`,
        borderRadius: 0,
        padding: "18px 22px",
        position: "relative",
        marginBottom: 14,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -10,
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
          lineHeight: 1.6,
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

// ═══════════════════════════════
// MAIN POST COMPONENT
// ═══════════════════════════════
export default function Post1Content() {
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
        {/* Abstract shapes */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -40,
            right: -60,
            width: 300,
            height: 300,
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            background: `${C.coral}22`,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -20,
            left: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: `${C.teal}15`,
          }}
        />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative" }}>
          {/* Breadcrumb */}
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
            <span style={{ color: "rgba(255,255,255,0.6)" }}>
              Client Management
            </span>
          </nav>

          <div
            style={{
              display: "inline-block",
              background: C.gold,
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
            Business Tips
          </div>

          <h1
            style={{
              fontFamily: FH,
              fontSize: "clamp(28px, 5vw, 48px)",
              fontWeight: 900,
              color: "#fff",
              lineHeight: 1.1,
              letterSpacing: -1.5,
              marginBottom: 20,
            }}
          >
            Interior Design Client Management:{" "}
            <span style={{ color: C.coral }}>7 Tips</span> That Actually Work
          </h1>

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
            <time dateTime="2026-04-10">April 10, 2026</time>
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
          If you are an interior designer working in tier1, tier2 or tier3 cities working solo or with a small team of 2-3 people, this post is for you.
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
          Most interior designers today don’t lose clients because they forget details.
        They lose them because everything is scattered — WhatsApp chats, call logs, notes apps, and memory.
        <br />
        The enquiry is there. The intent is there.
        But the response is late, the follow-up is inconsistent, and the experience feels unprofessional.

        And the client simply moves to someone who is faster, clearer, and easier to work with.
        </p>

        <PullQuote
          text="Skill se client aata hai. Management se client tikta hai."
          color={C.coral}
        />

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.8,
            color: `${C.navy}aa`,
            fontWeight: 500,
            marginBottom: 48,
          }}
        >
          Here are 7 things that actually fix this — no fancy software jargon,
          just practical changes that work.
        </p>

        <BlobDivider color={C.coral} />

        {/* ─── TIP 1 ─── */}
        <TipCard
          number="01"
          title="Stop scattering enquiry details across 5 places"
          icon="menu_book"
          color={C.coral}
          shadowColor={C.coral}
        >
          <p>
            Today, enquiry details are not lost —  <strong style={{ color:C.coral }}>they are everywhere.</strong>

            A client messages on WhatsApp. You discuss budget on a call. Measurements are noted in a notes app. 
            Design references are semewhere else. And some details are just in your head.

            When everything is spread across tools, you don’t have a clear picture of the client.
          </p>
          <p style={{ marginTop: 14 }}>
            Two weeks later, the client calls back. You spend 15 minutes finding
            their details. By the time you call back, they&apos;ve already spoken
            to another designer who responded in 5 minutes.
          </p>
          <div
            style={{
              marginTop: 20,
              padding: "16px 20px",
              background: C.gray,
              borderLeft: `4px solid ${C.coral}`,
              fontSize: 14,
              fontWeight: 700,
              color: C.navy,
            }}
          >
            <strong>The fix:</strong> Every enquiry — name, phone, requirement,
            budget, source — should go into one place the moment it comes in.
            Not later. Not &ldquo;jab ghar jaunga.&rdquo; Right then, from your phone.
          </div>
        </TipCard>

        {/* ─── TIP 2 ─── */}
        <TipCard
          number="02"
          title="Track every project by stage — including site visits"
          icon="view_kanban"
          color={C.teal}
          shadowColor={C.teal}
        >
          <p>
            A common mistake: you treat every enquiry the same whether it&apos;s
            brand new or you&apos;ve already done a site visit and sent a quote.
            When everything is a flat list, you don&apos;t know what needs attention.
          </p>
          <p style={{ marginTop: 12 }}>
            Here&apos;s a simple stage flow that works for most interior design businesses:
          </p>
          <StagesFlow />
          <p>
            At any given time, you should be able to answer: &ldquo;I have 5
            new enquiries, 3 site visits done, 2 quotes pending response.&rdquo;
            If you can&apos;t, you&apos;re flying blind.
          </p>
          <p style={{ marginTop: 12, textDecoration: "underline", textDecorationColor: C.teal, textDecorationThickness: 2 }}>
            When 3 leads are stuck at &ldquo;Quote Sent&rdquo; for 10 days —
            that&apos;s your signal to follow up.
          </p>
        </TipCard>

        <BlobDivider color={C.teal} flip />

        {/* ─── TIP 3 ─── */}
        <TipCard
          number="03"
          title="Send professional invoices, not WhatsApp messages"
          icon="receipt_long"
          color={C.gold}
          shadowColor={C.gold}
        >
          <p>
            You&apos;ve done the site visit, finalized the design, the client says
            &ldquo;haan chaliye, shuru karte hain.&rdquo; Now you need to collect
            the advance. What do most designers do?
          </p>
          <InvoiceComparison />
          <p>
            Who looks more professional? Who gets paid faster? The answer is always
            the one who sends a proper PDF with itemized pricing, GST breakdown,
            due date, and UPI QR code.
          </p>
          <div
            style={{
              marginTop: 20,
              padding: "16px 20px",
              background: C.gray,
              borderLeft: `4px solid ${C.gold}`,
              fontSize: 14,
              fontWeight: 700,
              color: C.navy,
            }}
          >
            <strong>The fix:</strong> Create a proper invoice with line items
            (material, labour, hardware — each with quantity and rate), GST if
            applicable, a clear due date, and your payment details. Share it as
            a PDF on WhatsApp.
          </div>
        </TipCard>

        {/* ─── TIP 4 ─── */}
        <TipCard
          number="04"
          title="Follow up — and set a specific date for it"
          icon="event"
          color={C.navy}
          shadowColor={C.navy}
        >
          <p>
            After a site visit, you share a quote. Then you wait. The client
            doesn&apos;t respond. A week passes. You think, &ldquo;maybe
            they&apos;re not interested.&rdquo;
          </p>
          <p style={{ marginTop: 12 }}>
            But the truth is — they&apos;re busy. They meant to reply but forgot.
            They were discussing with their spouse. They had a question they never asked.
          </p>
          <div
            style={{
              marginTop: 20,
              padding: "16px 20px",
              background: C.gray,
              borderLeft: `4px solid ${C.navy}`,
              fontSize: 14,
              fontWeight: 700,
              color: C.navy,
            }}
          >
            <strong>The fix:</strong> When you send a quote, immediately set a
            follow-up for 2-3 days later. Not &ldquo;I&apos;ll remember.&rdquo;
            An actual reminder with a specific date.
          </div>
          <p style={{ marginTop: 16 }}>
            Here&apos;s what a good follow-up sounds like:
          </p>
          <div style={{ marginTop: 14 }}>
            <ScriptCard
              label="DAY 3"
              text="Hi Rajesh ji, just checking — did you get a chance to look at the quote? Koi question ho toh batayiye."
              color={C.teal}
            />
            <ScriptCard
              label="DAY 7"
              text="Rajesh ji, quote bheja tha modular kitchen ke liye. Kya aapne decide kiya? I can adjust the scope agar budget concern hai."
              color={C.gold}
            />
          </div>
          <p style={{ marginTop: 12 }}>
            Most designers stop after sending the quote. The ones who follow up
            — politely, once or twice — close significantly more deals.
          </p>
        </TipCard>

        <BlobDivider color={C.gold} />

        {/* ─── TIP 5 ─── */}
        <TipCard
          number="05"
          title="Keep notes on every client interaction"
          icon="edit_note"
          color={C.teal}
          shadowColor={C.coral}
        >
          <p>
            Six months into a project, the client says: &ldquo;Maine toh walnut
            finish bola tha, yeh teak kaise aa gaya?&rdquo; If you don&apos;t
            have a record, it becomes a he-said-she-said situation. You eat the
            cost or lose the client&apos;s trust.
          </p>
          <div
            style={{
              marginTop: 20,
              padding: "16px 20px",
              background: C.gray,
              borderLeft: `4px solid ${C.teal}`,
              fontSize: 14,
              fontWeight: 700,
              color: C.navy,
            }}
          >
            <strong>The fix:</strong> After every call, site visit, or decision —
            add a quick note. Just: &ldquo;10 April — Client confirmed walnut
            finish for kitchen. Teak for bedroom.&rdquo; Takes 30 seconds,
            saves lakhs in disputes.
          </div>
        </TipCard>

        {/* ─── TIP 6 ─── */}
        <TipCard
          number="06"
          title="Don't delay invoicing — bill the same week"
          icon="speed"
          color={C.coral}
          shadowColor={C.gold}
        >
          <p>
            A common trap: you finish the work (or a milestone), but you delay
            sending the invoice because &ldquo;abhi time nahi hai&rdquo; or
            &ldquo;baad mein bana lunga.&rdquo; Two weeks later you still
            haven&apos;t sent it.
          </p>
          <PullQuote
            text="The closer the invoice is to the completed work, the faster the payment."
            color={C.gold}
          />
          <p>
            If creating an invoice feels tedious (open Excel → format cells →
            calculate GST → export PDF → WhatsApp pe bhejo...), that&apos;s the
            real problem to solve. The easier invoicing is, the faster you&apos;ll
            send it.
          </p>
        </TipCard>

        {/* ─── TIP 7 ─── */}
        <TipCard
          number="07"
          title="Send payment reminders — it's not rude, it's professional"
          icon="notifications_active"
          color={C.gold}
          shadowColor={C.teal}
        >
          <p>
            &ldquo;Client ko baar baar kaise bolu?&rdquo; &ldquo;Paisa maangna
            awkward hai.&rdquo; So you stay quiet, the payment gets delayed 30,
            60, 90 days, and cash flow suffers.
          </p>
          <p style={{ marginTop: 12 }}>
            Here&apos;s the reframe: <strong>sending a payment reminder is not
            asking for a favour. It&apos;s a normal part of running a business.</strong>{" "}
            Your electrician sends reminders. Your CA sends reminders. Your
            internet provider sends reminders. You should too.
          </p>
          <div style={{ marginTop: 16 }}>
            <ScriptCard
              label="DUE DATE"
              text="Hi Rajesh ji, gentle reminder — invoice #042 ka ₹1,50,000 pending hai, due date aaj tha. Invoice attached. UPI details invoice mein hain. Thank you! 🙏"
              color={C.teal}
            />
            <ScriptCard
              label="DAY +7"
              text="Rajesh ji, invoice #042 ka payment abhi tak pending hai (₹1,50,000). Kya koi issue hai? Please let me know. Payment details attached."
              color={C.coral}
            />
          </div>
          <p style={{ marginTop: 14 }}>
            Keep it polite, factual, and easy to act on — include payment
            details in the message or attach the invoice PDF. Most clients pay
            after the first or second reminder. They just needed the nudge.
          </p>
        </TipCard>

        <BlobDivider color={C.navy} flip />

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
              marginBottom: 16,
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
            is a <strong>chat-first CRM</strong> built for small service
            businesses in India. Here&apos;s what it actually does:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {[
              { tip: "One place for enquiries", desc: "Add leads by chatting — \"@Rajesh ka naya enquiry, modular kitchen, budget 3 lakh.\" Everything searchable." },
              { tip: "Stage tracking", desc: "Every lead moves through stages — New Enquiry → Site Visited → Quote Sent → Approved → Invoiced → Paid." },
              { tip: "Professional invoices", desc: "Create invoices by chat with @mentions for items. PDF generated in one tap. Share on WhatsApp in one more." },
              { tip: "Follow-ups with dates", desc: "Set follow-ups with due dates. Ask \"aaj ke follow-ups dikhao\" — AI shows pending and overdue." },
              { tip: "Client notes & activity log", desc: "Add notes by chatting. Full history maintained per lead automatically." },
              { tip: "Fast invoicing", desc: "Invoice creation is a 30-second chat. Create and send while standing on the client's site." },
              { tip: "Payment reminders", desc: "Ask AI to draft a payment reminder with invoice details. Share via WhatsApp. No awkward typing." },
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
                  <span style={{ color: `${C.navy}99`, fontSize: 14 }}>
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              fontSize: 15,
              color: `${C.navy}99`,
              fontWeight: 600,
              marginBottom: 20,
            }}
          >
            Everything works in <strong>Hindi, English, or Hinglish</strong>. No
            forms to fill. No menus to navigate. Just chat.
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
            Try SellNSettle free — no card needed →
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
                href: "/blog/how-to-send-professional-invoice-interior-designer",
                title: "How to Send a Professional Invoice as an Interior Designer",
                color: C.coral,
              },
              {
                href: "/blog/follow-up-kaise-karein-lead-miss-na-ho",
                title: "Follow-up Kaise Karein Taaki Lead Miss Na Ho",
                color: C.teal,
              },
              {
                href: "/blog/payment-reminder-templates-hindi-english",
                title: "Payment Reminder Messages — 10 Templates in Hindi & English",
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
                  transition: "all 0.2s",
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