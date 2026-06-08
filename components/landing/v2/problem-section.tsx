"use client";

import { Reveal } from "./reveal";

/* ═══ 01 · The real problem — "lose track" band ═══ */
export function ProblemSection() {
  const chips = [
    "Forgot to follow up",
    "Missed their reply",
    "Forgot what was last said",
    "WhatsApp scroll chaos",
    "Sticky notes everywhere",
    "It's all in your head",
  ];

  return (
    <section id="track">
      <Reveal>
        <div className="lt-band">
          <span className="lab">01 · The real problem</span>
          <h2>
            Businesses don&apos;t <span className="strike">lose enquiries.</span>
            <br />
            They lose <span className="keep">track.</span>
          </h2>
          <div className="lt-grid">
            {chips.map((c) => (
              <div className="lt-chip" key={c}>
                <span className="x">✕</span> {c}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
