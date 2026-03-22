"use client";

import { useEffect } from "react";
import { DM_Sans, Instrument_Serif } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export default function LandingPageClient() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 10);

    onScroll();
    window.addEventListener("scroll", onScroll);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const revealEls = document.querySelectorAll(".landing-page .reveal");
    revealEls.forEach((el) => io.observe(el));

    const featCards = document.querySelectorAll(".landing-page .feat-card.reveal");
    featCards.forEach((card, i) => {
      (card as HTMLElement).style.transitionDelay = `${(i % 3) * 75}ms`;
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <div className={`landing-page ${dmSans.className} ${instrumentSerif.variable}`}>
      <nav id="nav">
        <a href="#" className="nav-logo">
          <div className="nav-logo-mark">
            <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4C3 3.45 3.45 3 4 3H14C14.55 3 15 3.45 15 4V6C15 6.55 14.55 7 14 7H4C3.45 7 3 6.55 3 6V4Z" />
              <path d="M3 9C3 8.45 3.45 8 4 8H10C10.55 8 11 8.45 11 9V10C11 10.55 10.55 11 10 11H4C3.45 11 3 10.55 3 10V9Z" />
              <circle cx="13.5" cy="13.5" r="2.5" />
            </svg>
          </div>
          <span className="nav-logo-text">SellNSettle</span>
        </a>
        <ul className="nav-links">
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#compare">Why us</a>
          </li>
          <li>
            <a href="#how">How it works</a>
          </li>
          <li>
            <a href="/login">Sign in</a>
          </li>
          <li>
            <a href="/register" className="nav-cta">
              Start free
            </a>
          </li>
        </ul>
      </nav>

      <div className="hero-wrap">
        <div className="hero">
          <div className="hero-copy">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Built for Indian MSMEs
            </div>
            <h1 className="hero-headline">
              From first enquiry
              <br />
              to <em>final payment</em>
            </h1>
            <p className="hero-sub">
              Stop juggling WhatsApp, a diary, and billing apps. SellNSettle tracks every lead, quote, invoice, and payment in one place — made for how Indian small businesses actually work.
            </p>
            <div className="hero-actions">
              <a href="/register" className="btn-primary">
                Start for free →
              </a>
              <a href="#how" className="btn-ghost">
                See how it works
              </a>
            </div>
            <div className="hero-trust">
              <span>✓ No credit card needed</span>
              <span className="trust-sep">·</span>
              <span>✓ Setup in 60 seconds</span>
              <span className="trust-sep">·</span>
              <span>✓ Works on mobile</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="phone-wrap">
              <div className="phone-frame">
                <div className="phone-notch"></div>
                <div className="phone-screen">
                  <div className="app-topbar">
                    <div>
                      <div className="app-topbar-title">SellNSettle</div>
                      <div className="app-topbar-sub">Your workspace</div>
                    </div>
                    <div className="app-topbar-logout">Logout</div>
                  </div>

                  <div className="app-dash-title">
                    <div className="app-dash-h">Dashboard</div>
                    <div className="app-dash-sub">Quick snapshot of what needs attention today.</div>
                  </div>

                  <div className="app-stats">
                    <div className="app-stat-card">
                      <div className="app-stat-label">Follow-ups today</div>
                      <div className="app-stat-value">3</div>
                      <div className="app-stat-note">Don&#39;t miss these</div>
                    </div>
                    <div className="app-stat-card">
                      <div className="app-stat-label">Collections this month</div>
                      <div className="app-stat-value">₹2,18,500</div>
                      <div className="app-stat-note">Current month total</div>
                    </div>
                    <div className="app-stat-card">
                      <div className="app-stat-label">Total outstanding</div>
                      <div className="app-stat-value">₹84,000</div>
                      <div className="app-stat-note">2 invoices pending</div>
                    </div>
                  </div>

                  <div className="app-scroll">
                    <div className="app-sec-title">Overdue Payments</div>
                    <div className="overdue-card">
                      <div className="od-row">
                        <div>
                          <div className="od-name">Suresh Kumar</div>
                          <div className="od-inv">INV-012</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="od-amount">₹42,000</div>
                          <div className="od-days">9 days overdue</div>
                        </div>
                      </div>
                      <div className="od-actions">
                        <span className="oa">View Invoice</span>
                        <span className="oa wa">WhatsApp</span>
                        <span className="oa">Call</span>
                      </div>
                    </div>

                    <div className="app-sec-title">Today&#39;s Follow-ups</div>
                    <div className="fu-card">
                      <div className="fu-row">
                        <span className="fu-label">Lead · Priya Mehta</span>
                        <span className="fu-time">10:00 am</span>
                      </div>
                      <div className="fu-note">Call back about full home quote</div>
                      <span className="fu-done">✓ Done</span>
                    </div>

                    <div className="app-sec-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Recent Leads</span>
                      <span style={{ fontSize: "0.44rem", color: "#0EA5A0", fontWeight: 600 }}>View All →</span>
                    </div>

                    <div className="lead-row">
                      <div className="lr-top">
                        <span className="lr-name">Living room renovation</span>
                        <span className="lr-cust">Priya Mehta</span>
                      </div>
                      <div className="lr-meta">
                        <span className="lr-badge b-enq">Enquiry</span>
                        <span className="lr-amt">₹1,80,000</span>
                        <span className="lr-date">30 Mar</span>
                      </div>
                    </div>
                    <div className="lead-row">
                      <div className="lr-top">
                        <span className="lr-name">Office cabin interior</span>
                        <span className="lr-cust">Amit Rathore</span>
                      </div>
                      <div className="lr-meta">
                        <span className="lr-badge b-won">Won</span>
                        <span className="lr-amt">₹65,000</span>
                        <span className="lr-date">25 Mar</span>
                      </div>
                    </div>
                    <div className="lead-row">
                      <div className="lr-top">
                        <span className="lr-name">Modular kitchen</span>
                        <span className="lr-cust">Neha Joshi</span>
                      </div>
                      <div className="lr-meta">
                        <span className="lr-badge b-enq">Enquiry</span>
                        <span className="lr-amt">₹95,000</span>
                        <span className="lr-date">23 Mar</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="float-pill fp1">
                <span>💰</span> Invoice paid!
              </div>
              <div className="float-pill fp2">
                <span>📲</span> Follow-up sent
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="chaos-section">
        <div className="chaos-inner">
          <div className="reveal">
            <div className="section-label" style={{ color: "#5EEAD4" }}>The problem</div>
            <h2 className="chaos-title">
              Running your business on <em>five different apps</em>
            </h2>
            <p className="chaos-sub">
              Most small business owners lose deals not because they&#39;re bad at selling — but because they lose track. An enquiry slips. An invoice goes unsent for two weeks. A payment reminder never happens.
            </p>
            <div className="chaos-stats">
              <div>
                <div className="cs-num">₹2L+</div>
                <div className="cs-label">avg. revenue lost annually<br />to forgotten follow-ups</div>
              </div>
              <div>
                <div className="cs-num">1 app</div>
                <div className="cs-label">to replace all of<br />them — free to start</div>
              </div>
            </div>
          </div>
          <div className="chaos-tools reveal">
            <div className="chaos-tool">
              <div className="ct-icon" style={{ background: "rgba(37,211,102,0.12)" }}>💬</div>
              <div>
                <div className="ct-name">WhatsApp</div>
                <div className="ct-pain">Customer details buried in 1000 chats. No structure, no history.</div>
              </div>
              <span className="ct-x">✕</span>
            </div>
            <div className="chaos-tool">
              <div className="ct-icon" style={{ background: "rgba(251,191,36,0.12)" }}>📒</div>
              <div>
                <div className="ct-name">Diary / notebook</div>
                <div className="ct-pain">No reminders. Doesn&#39;t ping you to call a customer back.</div>
              </div>
              <span className="ct-x">✕</span>
            </div>
            <div className="chaos-tool">
              <div className="ct-icon" style={{ background: "rgba(96,165,250,0.12)" }}>📊</div>
              <div>
                <div className="ct-name">Excel / Sheets</div>
                <div className="ct-pain">No automation. Breaks on mobile. Doesn&#39;t remind you of anything.</div>
              </div>
              <span className="ct-x">✕</span>
            </div>
            <div className="chaos-tool">
              <div className="ct-icon" style={{ background: "rgba(167,139,250,0.12)" }}>🧾</div>
              <div>
                <div className="ct-name">Billing-only apps</div>
                <div className="ct-pain">Start at the invoice. Miss everything before — lead, follow-up, quote.</div>
              </div>
              <span className="ct-x">✕</span>
            </div>
          </div>
        </div>
      </section>

      <section className="pipeline-section">
        <div className="pipeline-header centered reveal">
          <div className="section-label">The complete journey</div>
          <h2 className="section-title">One app. The whole cycle.</h2>
          <p className="section-sub" style={{ maxWidth: "480px" }}>
            Most tools start at the invoice. SellNSettle starts at the first enquiry and follows through till the payment lands.
          </p>
        </div>
        <div className="pipeline-flow reveal">
          <div className="pipe-step"><div className="pipe-bubble">📥</div><div className="pipe-name">Enquiry</div><div className="pipe-desc">Lead comes in via WhatsApp, referral, or walk-in</div></div>
          <div className="pipe-arrow">→</div>
          <div className="pipe-step"><div className="pipe-bubble">💬</div><div className="pipe-name">Follow-up</div><div className="pipe-desc">Track calls, meetings, notes — full history</div></div>
          <div className="pipe-arrow">→</div>
          <div className="pipe-step"><div className="pipe-bubble">📋</div><div className="pipe-name">Quote</div><div className="pipe-desc">Send professional quotes with line items and GST</div></div>
          <div className="pipe-arrow">→</div>
          <div className="pipe-step"><div className="pipe-bubble">🧾</div><div className="pipe-name">Invoice</div><div className="pipe-desc">One tap: convert quote → GST invoice PDF</div></div>
          <div className="pipe-arrow">→</div>
          <div className="pipe-step"><div className="pipe-bubble">✅</div><div className="pipe-name">Payment</div><div className="pipe-desc">Record UPI, cash, bank — auto-updates status</div></div>
        </div>
      </section>

      <section id="features" className="features-outer">
        <div className="features-inner">
          <div className="features-head">
            <div className="reveal"><div className="section-label">What&#39;s inside</div><h2 className="section-title">Everything a growing business needs</h2></div>
            <p className="section-sub reveal">Not enterprise bloat. Just the features that matter for running 10–30 active deals from your phone, every day.</p>
          </div>
          <div className="features-grid">
            <div className="feat-card reveal"><div className="feat-icon">📊</div><div className="feat-name">Lead Pipeline</div><div className="feat-desc">Visual pipeline with 5 stages. Move leads with one tap. Full activity timeline per lead — calls, notes, stage changes.</div></div>
            <div className="feat-card reveal"><div className="feat-icon">👥</div><div className="feat-name">Customer Profiles</div><div className="feat-desc">Lifetime value, outstanding balance, all leads and invoices for every customer — in one place.</div></div>
            <div className="feat-card reveal"><div className="feat-icon">🧾</div><div className="feat-name">GST Invoices</div><div className="feat-desc">GST-compliant invoice PDFs with your branding, UPI details, and bank account. Share instantly via WhatsApp.</div></div>
            <div className="feat-card reveal"><div className="feat-icon">📦</div><div className="feat-name">Item Catalog</div><div className="feat-desc">Build your product/service library once. Typeahead auto-fills name, rate, unit, and GST% in every invoice.</div></div>
            <div className="feat-card reveal"><div className="feat-icon">🔔</div><div className="feat-name">Follow-up Reminders</div><div className="feat-desc">Schedule follow-ups with notes and due dates. Today&#39;s dashboard shows exactly who to call and when.</div></div>
            <div className="feat-card reveal"><div className="feat-icon">💬</div><div className="feat-name">WhatsApp Integration</div><div className="feat-desc">One-tap templates for payment reminders, meeting confirmations, and quote sharing — from your own number.</div></div>
            <div className="feat-card reveal"><div className="feat-icon">💰</div><div className="feat-name">Payment Tracking</div><div className="feat-desc">Record UPI, cash, or bank payments. Invoice status updates automatically. Outstanding tracked per customer.</div></div>
            <div className="feat-card reveal"><div className="feat-icon">📅</div><div className="feat-name">Meetings</div><div className="feat-desc">Schedule meetings tied to leads. Scheduled, completed, no-show — all in a clean date-grouped list.</div></div>
            <div className="feat-card reveal"><div className="feat-icon">📱</div><div className="feat-name">Mobile-first + Dark Mode</div><div className="feat-desc">Designed for a 6-inch phone screen. Light and dark mode. Fast on slow connections.</div></div>
          </div>
        </div>
      </section>

      <section id="compare" className="compare-section">
        <div className="compare-inner">
          <div className="compare-header reveal">
            <div className="section-label">Why SellNSettle</div>
            <h2 className="section-title" style={{ margin: "0 auto" }}>The only tool that covers<br /><em>the entire business cycle</em></h2>
            <p className="section-sub" style={{ margin: "0.7rem auto 0" }}>Billing apps start too late. Enterprise CRMs are too complex. SellNSettle fills the gap.</p>
          </div>
          <div className="compare-table reveal">
            <div className="compare-head">
              <div className="ch">Capability</div>
              <div className="ch hl">SellNSettle</div>
              <div className="ch">Billing apps</div>
              <div className="ch">Enterprise CRMs</div>
            </div>
            <div className="compare-row"><div className="cc">Lead tracking &amp; pipeline</div><div className="cc hl"><span className="chk">✓</span></div><div className="cc"><span className="crs">✗</span></div><div className="cc"><span className="chk">✓</span></div></div>
            <div className="compare-row"><div className="cc">GST invoice generation</div><div className="cc hl"><span className="chk">✓</span></div><div className="cc"><span className="chk">✓</span></div><div className="cc"><span className="crs">✗</span></div></div>
            <div className="compare-row"><div className="cc">Follow-up reminders</div><div className="cc hl"><span className="chk">✓</span></div><div className="cc"><span className="crs">✗</span></div><div className="cc"><span className="chk">✓</span></div></div>
            <div className="compare-row"><div className="cc">WhatsApp-native workflows</div><div className="cc hl"><span className="chk">✓</span></div><div className="cc"><span className="crs">✗</span></div><div className="cc"><span className="crs">✗</span></div></div>
            <div className="compare-row"><div className="cc">Quote → Invoice in one tap</div><div className="cc hl"><span className="chk">✓</span></div><div className="cc">Partial</div><div className="cc"><span className="crs">✗</span></div></div>
            <div className="compare-row"><div className="cc">Setup time</div><div className="cc hl">60 seconds</div><div className="cc">~30 min</div><div className="cc">Days–weeks</div></div>
            <div className="compare-row"><div className="cc">Built for 1–5 person teams</div><div className="cc hl"><span className="chk">✓</span></div><div className="cc"><span className="chk">✓</span></div><div className="cc"><span className="crs">✗</span></div></div>
            <div className="compare-row"><div className="cc">Works well on mobile</div><div className="cc hl"><span className="chk">✓</span></div><div className="cc">Partial</div><div className="cc"><span className="crs">✗</span></div></div>
          </div>
        </div>
      </section>

      <section id="how" className="how-outer">
        <div className="how-inner">
          <div className="how-header centered reveal">
            <div className="section-label">Getting started</div>
            <h2 className="section-title">Up and running in <em>three steps</em></h2>
            <p className="section-sub">No complex setup. No training required. If it needs a tutorial, the design has failed.</p>
          </div>
          <div className="how-steps">
            <div className="how-step reveal"><div className="how-num">1</div><div className="how-title">Set up your business</div><div className="how-desc">Add your name, logo, GSTIN, and bank/UPI details. 60 seconds. Your invoices look professional from day one.</div></div>
            <div className="how-step reveal"><div className="how-num">2</div><div className="how-title">Add your first lead</div><div className="how-desc">Tap &quot;+ New Lead&quot;, add customer details, and you&#39;re tracking. Log a note, schedule a follow-up, move stages — all on mobile.</div></div>
            <div className="how-step reveal"><div className="how-num">3</div><div className="how-title">Invoice &amp; collect</div><div className="how-desc">When the deal closes, create an invoice in under a minute. Share on WhatsApp. Mark payment received. Done.</div></div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner reveal">
          <h2 className="cta-title">Your business diary,<br />upgraded.</h2>
          <p className="cta-sub">Start managing leads, invoices, and payments in one place — free, no card required.</p>
          <a href="/register" className="btn-white">Start for free — no card needed →</a>
          <p className="cta-note">Already have an account? <a href="/login">Sign in</a></p>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <a href="#" className="footer-logo">
            <div className="footer-logo-mark">
              <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 4C3 3.45 3.45 3 4 3H14C14.55 3 15 3.45 15 4V6C15 6.55 14.55 7 14 7H4C3.45 7 3 6.55 3 6V4Z" />
                <path d="M3 9C3 8.45 3.45 8 4 8H10C10.55 8 11 8.45 11 9V10C11 10.55 10.55 11 10 11H4C3.45 11 3 10.55 3 10V9Z" />
                <circle cx="13.5" cy="13.5" r="2.5" />
              </svg>
            </div>
            <span className="footer-logo-text">SellNSettle</span>
          </a>
          <ul className="footer-links">
            <li><a href="#features">Features</a></li>
            <li><a href="mailto:hello@sellnsettle.com">Contact</a></li>
            <li><a href="#">Privacy</a></li>
            <li><a href="#">Terms</a></li>
          </ul>
          <span className="footer-copy">© 2025 SellNSettle · Made for Indian MSMEs</span>
        </div>
      </footer>
    </div>
  );
}
