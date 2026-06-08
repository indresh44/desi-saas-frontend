"use client";

import { Reveal } from "./reveal";

/* ═══ 02 · How it works — Action → Outcome → What's next ═══ */
export function HowLoopSection() {
  return (
    <section id="loop">
      <Reveal>
        <span className="lab">02 · How it works</span>
        <h2>
          Action → outcome → <em>what&apos;s next.</em>
        </h2>
        <p className="sec-lede">
          One natural rhythm. You make the move, tap what happened in a second, and decide the
          next step — never from memory, always with the full picture ready.
        </p>
        <div className="loop">
          <div className="lcard l1">
            <div className="lnum">1</div>
            <div className="ls">Action</div>
            <h3>You make the move</h3>
            <p>
              Call, WhatsApp, meeting, reminder — start an interaction straight from the
              enquiry. One tap, no heavy forms.
            </p>
            <div className="demo">
              📞 Called <b>Mohit Gupta</b>
              <br />
              💬 WhatsApp <b>Danesh</b>
              <br />
              🔔 Reminder <b>Friday 5 PM</b>
            </div>
            <div className="who-acts">
              You act · <b>SellNSettle records</b>
            </div>
          </div>
          <div className="lcard l2">
            <div className="lnum">2</div>
            <div className="ls">Outcome</div>
            <h3>Tap what happened</h3>
            <p>
              No typing. Pick one chip and the enquiry updates itself — that&apos;s the whole
              log. Done in a second, even between meetings.
            </p>
            <div className="ochips">
              <span className="ochip">No response</span>
              <span className="ochip">Busy</span>
              <span className="ochip hot">Interested</span>
              <span className="ochip">Call later</span>
              <span className="ochip">Not interested</span>
              <span className="ochip">Discussed</span>
            </div>
            <div className="who-acts">
              One tap · <b>nothing to write</b>
            </div>
          </div>
          <div className="lcard l3">
            <div className="lnum">3</div>
            <div className="ls">What&apos;s next</div>
            <h3>You decide — fully informed</h3>
            <p>
              The app keeps the next move in clear view and surfaces the full history the moment
              you need it. You stay in charge; you just never start from a blank.
            </p>
            <div className="demo">
              <span className="al">⏰ 2 follow-ups due today</span>
              <br />
              Mohit · estimate pending
              <br />
              Suresh · quiet 8 days
            </div>
            <div className="who-acts">
              You choose · <b>with the story ready</b>
            </div>
          </div>
        </div>
        <div className="loop-foot">
          ↻ &nbsp; action · outcome · next · repeat — without dropping a single one &nbsp; ↻
        </div>
      </Reveal>
    </section>
  );
}
