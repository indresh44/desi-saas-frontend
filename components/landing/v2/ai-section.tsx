"use client";

import { Reveal } from "./reveal";

/* ═══ 04 · The intelligence — "It hands you the facts. You make the call." ═══
   Framed variant from the mockup (the founder-only Framed/Quiet preview
   toggle is intentionally dropped). */
export function AISection() {
  return (
    <section id="ai" className="ai-sec">
      <Reveal>
        <span className="lab">04 · The intelligence</span>
        <div className="ai-head">
          <div>
            <h2>
              It hands you the facts.
              <br />
              <em>You make the call.</em>
            </h2>
            <div className="ai-stance">
              <div className="q">
                &ldquo;There when you need it. Invisible when you don&apos;t.&rdquo;
              </div>
              <p>
                The moment you&apos;re about to follow up, you see the whole story of that
                enquiry.
              </p>
              <div className="stance-points">
                <span className="sp-pt">what was said</span>
                <span className="sp-pt">what was promised</span>
                <span className="sp-pt">how long it&apos;s been</span>
              </div>
              <div className="stance-payoff">
                It informs. <span>You decide.</span>
              </div>
              <div className="split">
                <div className="half does">
                  <div className="ht">✓ What it does</div>
                  <p>
                    Summarises the history. Pulls out what they asked for. Puts the facts in
                    front of you.
                  </p>
                </div>
                <div className="half dont">
                  <div className="ht">✕ What it won&apos;t</div>
                  <p>
                    Tell you who to call or what to send. The decision — and the relationship —
                    stays yours.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="expand-mock">
            <div className="em-card">
              <div className="em-top">
                <div>
                  <div className="em-t">Kitchen renovation</div>
                  <div className="em-n">Mohit Gupta · ₹1.80L</div>
                </div>
                <div className="em-acts">
                  <span className="chip-act wa">WhatsApp</span>
                  <span className="chip-act call">Call</span>
                </div>
              </div>
              <div className="em-meta">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4l3 2" />
                </svg>{" "}
                Follow up today
              </div>
            </div>
            <div className="em-expand">
              <div className="vc-h">
                <span style={{ color: "var(--teal)" }}>▾</span> View context
              </div>
              <div className="em-ai">
                <div className="ai-l">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z" />
                  </svg>{" "}
                  AI summary
                </div>
                <p>
                  Enquired <b>6 days ago</b> for a full kitchen renovation. You shared a mood
                  board on Mon — he replied <b>&ldquo;looks good, share price.&rdquo;</b>{" "}
                  Estimate sent Wed, <b>no reply since.</b>
                </p>
                <div className="req">
                  <span className="r">Kitchen · full</span>
                  <span className="r">~₹1.8L</span>
                  <span className="r">Whitefield</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="ai-abil">
          <div className="acard k1">
            <div className="ai-ic">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            </div>
            <h4>Activity summary, on tap</h4>
            <p>
              Expand any enquiry — on the dashboard, the list, or the detail page — and read the
              whole story in a sentence or two. The fact-check you&apos;d otherwise do by
              scrolling.
            </p>
          </div>
          <div className="acard k2">
            <div className="ai-ic">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M8 9h8M8 13h5" />
              </svg>
            </div>
            <h4>Requirements, pulled from your notes</h4>
            <p>
              Just jot down what matters from a customer interaction, in your own words.
              SellNSettle reads your notes and activity log and turns them into clean tags — what
              they want, scope, location.
            </p>
          </div>
        </div>

        <div className="auto-note">
          <span className="ic">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l3 2" />
            </svg>
          </span>
          <div>
            <b>And the watching happens on its own.</b> Due-today, no-follow-up, and gone-quiet
            aren&apos;t AI guesses — they&apos;re tracked automatically from your dates and
            outcomes, so nothing slips while you&apos;re busy.
          </div>
        </div>
      </Reveal>
    </section>
  );
}
