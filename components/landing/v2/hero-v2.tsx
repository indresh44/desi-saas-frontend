"use client";

import { useState } from "react";
import Link from "next/link";

/* ═══ HERO — headline + "needs you today" dashboard mockup ═══ */
export function HeroV2() {
  // The hero's first enquiry card has a "View context" expander (mirrors
  // the mockup's toggleCard). Only card1 is interactive in the mockup.
  const [openCtx, setOpenCtx] = useState(false);

  return (
    <header className="hero">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="tagpill ld ld-1">
              <span className="sp">✦</span> Effortless enquiry management
            </span>
            <h1 className="ld ld-2">
              You don&apos;t lose enquiries.
              <br />
              You lose <span className="c">track.</span>
              <br />
              <span className="g">Not anymore.</span>
            </h1>
            <p className="lede ld ld-3">
              SellNSettle is the smoothest way to stay on top of every enquiry.
            </p>
            <div className="hero-beats ld ld-3">
              <span className="hb">Take an action</span>
              <span className="hb">Tap what happened</span>
              <span className="hb">See what&apos;s next</span>
            </div>
            <p className="hero-payoff ld ld-3">
              The whole story stays in front of you — <b>nothing left in your head.</b>
            </p>
            <div className="hero-cta ld ld-4">
              <Link href="/register" className="btn btn-coral">
                Start free — no card needed →
              </Link>
              <a href="#loop" className="btn btn-white">
                See how it works
              </a>
            </div>
            <div className="hero-note ld ld-5">
              <span className="dot" /> Built for your phone · Simpler than Zoho · Smarter than
              pen-and-paper
            </div>
          </div>

          <div className="hero-visual ld ld-4">
            <div className="hero-badge">NEEDS YOU TODAY</div>
            <div className="dash">
              <div className="dash-top">
                <div>
                  <div className="greet">Good evening, Vikram</div>
                  <div className="sub">
                    <b>4 enquiries</b> need you today
                  </div>
                </div>
                <div className="ask">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
                  </svg>{" "}
                  Ask AI
                </div>
              </div>
              <div className="dash-body">
                <div className="dash-seclab">Due today</div>

                <div className={`ecard due${openCtx ? " open" : ""}`}>
                  <div className="er1">
                    <div>
                      <div className="et">Kitchen renovation</div>
                      <div className="en">Mohit Gupta</div>
                    </div>
                    <div className="acts">
                      <span className="chip-act wa">WhatsApp</span>
                      <span className="chip-act call">Call</span>
                      <span className="chip-act done">Done</span>
                    </div>
                  </div>
                  <div className="meta">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v4l3 2" />
                    </svg>{" "}
                    Follow up today <span className="vp">₹1.80L</span>
                  </div>
                  <div className="viewctx">
                    <div
                      className="vc-h"
                      onClick={() => setOpenCtx((v) => !v)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") setOpenCtx((v) => !v);
                      }}
                    >
                      <span className="caret">▸</span> View context
                    </div>
                    <div className="vc-body">
                      <div className="ai-sum">
                        <div className="ai-l">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
                          </svg>{" "}
                          AI summary
                        </div>
                        <p>
                          Mohit enquired <b>6 days ago</b> for a full kitchen renovation, ~₹1.8L
                          budget. You sent a mood board Mon; he replied{" "}
                          <b>&ldquo;looks good, share price.&rdquo;</b> Estimate sent Wed —{" "}
                          <b>no reply yet.</b> Last spoke 2 days ago.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ecard due">
                  <div className="er1">
                    <div>
                      <div className="et">Modular kitchen for joint family</div>
                      <div className="en">Danesh</div>
                    </div>
                    <div className="acts">
                      <span className="chip-act wa">WhatsApp</span>
                      <span className="chip-act call">Call</span>
                    </div>
                  </div>
                  <div className="meta">
                    <span className="tg">Called 1× · busy</span> <span className="vp">₹25K</span>
                  </div>
                </div>

                <div className="dash-seclab" style={{ marginTop: 4 }}>
                  No follow-up set
                </div>
                <div className="ecard noset">
                  <div className="er1">
                    <div>
                      <div className="et">Modular kitchen</div>
                      <div className="en">Rohit Tiwari</div>
                    </div>
                    <div className="acts">
                      <span className="chip-act set">Set follow-up</span>
                      <span className="chip-act wa">WhatsApp</span>
                    </div>
                  </div>
                  <div className="meta">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="17" rx="2" />
                      <path d="M3 9h18M8 2v4M16 2v4" />
                    </svg>{" "}
                    Set a follow-up
                  </div>
                </div>

                <div className="dash-seclab" style={{ marginTop: 4 }}>
                  Gone quiet
                </div>
                <div className="ecard quiet">
                  <div className="er1">
                    <div>
                      <div className="et">Office cabin renovation</div>
                      <div className="en">Suresh Agarwal</div>
                    </div>
                    <div className="acts">
                      <span className="chip-act set">Set follow-up</span>
                      <span className="chip-act wa">WhatsApp</span>
                    </div>
                  </div>
                  <div className="meta">
                    Quiet 8 days — nudge? <span className="vp">₹2.80L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="trust ld ld-6">
          <span className="lbl">Built for</span>
          <span className="who">Interior designers</span>
          <span className="who">Photographers</span>
          <span className="who">Coaches</span>
          <span className="who">Contractors</span>
          <span className="who">Tutors</span>
          <span className="who">Freelancers</span>
        </div>
      </div>
    </header>
  );
}
