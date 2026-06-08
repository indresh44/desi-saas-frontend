"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "./reveal";

/* ═══ 03 · Capture — animated "quick add" enquiry demo ═══
   Faithful port of the mockup's vanilla-JS loop into an imperative
   useEffect (refs + class/textContent toggles — animation-heavy, so we
   drive the DOM directly rather than through render state). Starts on
   scroll-into-view; honors prefers-reduced-motion with a static final state. */

const NOTE =
  "Priya from JustDial needs full living room makeover, approx 2,50,000, 98200 11220";
const FILL: Record<string, string> = {
  name: "Priya",
  phone: "98200 11220",
  source: "JustDial",
  req: "Full living room makeover",
  value: "₹2,50,000",
};
const ORDER = ["name", "phone", "source", "req", "value"];

export function CaptureSection() {
  const screenRef = useRef<HTMLDivElement>(null);
  const newBtnRef = useRef<HTMLSpanElement>(null);
  const typedRef = useRef<HTMLSpanElement>(null);
  const phRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const statusTextRef = useRef<HTMLSpanElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const saveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const screen = screenRef.current;
    const newBtn = newBtnRef.current;
    const typed = typedRef.current;
    const ph = phRef.current;
    const caret = caretRef.current;
    const box = boxRef.current;
    const status = statusRef.current;
    const statusText = statusTextRef.current;
    const form = formRef.current;
    const cap = capRef.current;
    const save = saveRef.current;
    if (
      !screen || !newBtn || !typed || !ph || !caret || !box || !status ||
      !statusText || !form || !cap || !save
    ) {
      return;
    }

    const fields = [...form.querySelectorAll<HTMLElement>(".qa-field")];
    const vals: Record<string, HTMLElement> = {};
    fields.forEach((f) => {
      const k = f.dataset.k;
      const v = f.querySelector<HTMLElement>(".qa-val");
      if (k && v) vals[k] = v;
    });

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        timer = setTimeout(res, ms);
      });
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function reset() {
      screen!.classList.remove("sheet-open");
      newBtn!.classList.remove("tap");
      save!.classList.remove("tap");
      typed!.textContent = "";
      ph!.style.display = "";
      caret!.style.display = "none";
      status!.classList.remove("working");
      statusText!.textContent = "";
      form!.classList.remove("locked");
      box!.classList.remove("scanning");
      cap!.classList.remove("show");
      fields.forEach((f) => {
        f.classList.remove("flash");
        const v = f.querySelector<HTMLElement>(".qa-val");
        if (v) v.textContent = "";
      });
    }

    function showFinal() {
      screen!.classList.add("sheet-open");
      typed!.textContent = NOTE;
      ph!.style.display = "none";
      ORDER.forEach((k) => {
        vals[k].textContent = FILL[k];
      });
      cap!.classList.add("show");
    }

    async function run() {
      while (!cancelled) {
        reset();
        await wait(900);
        if (cancelled) return;
        newBtn!.classList.add("tap");
        await wait(160);
        newBtn!.classList.remove("tap");
        screen!.classList.add("sheet-open");
        await wait(560);
        if (cancelled) return;
        ph!.style.display = "none";
        caret!.style.display = "inline-block";
        form!.classList.add("locked");
        statusText!.textContent = "Filling from your note…";
        for (let i = 0; i < NOTE.length; i++) {
          if (cancelled) return;
          typed!.textContent = NOTE.slice(0, i + 1);
          await wait(28);
        }
        await wait(420);
        if (cancelled) return;
        caret!.style.display = "none";
        status!.classList.add("working");
        statusText!.textContent = "Reading your note…";
        box!.classList.add("scanning");
        await wait(1050);
        if (cancelled) return;
        status!.classList.remove("working");
        statusText!.textContent = "";
        box!.classList.remove("scanning");
        for (const k of ORDER) {
          if (cancelled) return;
          const f = fields.find((x) => x.dataset.k === k);
          vals[k].textContent = FILL[k];
          f?.classList.add("flash");
          await wait(190);
        }
        form!.classList.remove("locked");
        await wait(120);
        fields.forEach((f) => f.classList.remove("flash"));
        cap!.classList.add("show");
        await wait(700);
        if (cancelled) return;
        save!.classList.add("tap");
        await wait(160);
        save!.classList.remove("tap");
        await wait(2400);
        if (cancelled) return;
        screen!.classList.remove("sheet-open");
        await wait(650);
      }
    }

    let started = false;
    const startObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started) {
            started = true;
            if (reduce) showFinal();
            else void run();
            startObs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    startObs.observe(screen);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      startObs.disconnect();
    };
  }, []);

  return (
    <section id="capture">
      <Reveal>
        <span className="lab">03 · Capture</span>
        <h2>
          Adding an enquiry? <em>Seconds.</em>
        </h2>
        <p className="sec-lede">
          Tap New Enquiry and do it your way — type the fields in a few taps, or drop in a note
          and let it fill itself.
        </p>
        <div className="cap-grid">
          <div className="cap-copy">
            <div className="ways">
              <span className="way">✍ Type it in yourself</span>
              <span className="way ai">
                <span className="sp">✦</span> Or paste a quick note
              </span>
            </div>
            <p style={{ color: "var(--ink-soft)", fontSize: "1rem", margin: "0 0 16px" }}>
              Caught an enquiry mid-call? Jot it the way you&apos;d say it — a name, what they
              want, a number — and SellNSettle drops it into the right fields. No rigid form to
              wrestle with.
            </p>
            <div className="ctrl">
              <span style={{ color: "var(--teal)", fontWeight: 800 }}>✓</span>
              <div>
                <b>You stay in control.</b> The note fills the form; you glance, fix anything, and
                save. Nothing is added behind your back.
              </div>
            </div>
          </div>

          <div className="cap-phone-wrap">
            <div className="cap-phone">
              <div className="cap-screen" ref={screenRef}>
                <div className="cap-appbar">
                  <div className="biz">
                    Vikram Interiors<span>SellNSettle</span>
                  </div>
                  <span className="cap-newbtn" ref={newBtnRef}>
                    + New Enquiry
                  </span>
                </div>
                <div className="cap-dash">
                  <div className="cap-dlab">Needs you today</div>
                  <div className="cap-ghost coral">
                    <div className="g1" />
                    <div className="g2" />
                  </div>
                  <div className="cap-ghost teal">
                    <div className="g1" style={{ width: "50%" }} />
                    <div className="g2" style={{ width: "55%" }} />
                  </div>
                  <div className="cap-ghost">
                    <div className="g1" style={{ width: "44%" }} />
                    <div className="g2" style={{ width: "32%" }} />
                  </div>
                </div>

                <div className="cap-sheet">
                  <div className="cap-handle" />
                  <div className="cap-sheet-h">
                    <span className="t">New Enquiry</span>
                    <span className="cap-tabs">
                      <span className="cap-tab on">
                        <span className="sp">✦</span> Quick add
                      </span>
                      <span className="cap-tab">Manual</span>
                    </span>
                  </div>
                  <div className="qa-box" ref={boxRef}>
                    <span ref={typedRef} />
                    <span className="ph" ref={phRef}>
                      Paste a note, a message, anything…
                    </span>
                    <span className="qa-caret" ref={caretRef} style={{ display: "none" }} />
                    <div className="qa-scan" />
                  </div>
                  <div className="qa-statusline" ref={statusRef}>
                    <span className="spin" />
                    <span ref={statusTextRef} />
                  </div>

                  <div className="qa-form" ref={formRef}>
                    <div className="qa-field" data-k="name">
                      <label>Name</label>
                      <div className="qa-val" />
                    </div>
                    <div className="qa-row2">
                      <div className="qa-field" data-k="phone">
                        <label>Phone</label>
                        <div className="qa-val" />
                      </div>
                      <div className="qa-field" data-k="source">
                        <label>Source</label>
                        <div className="qa-val" />
                      </div>
                    </div>
                    <div className="qa-field" data-k="req">
                      <label>Requirement</label>
                      <div className="qa-val" />
                    </div>
                    <div className="qa-field" data-k="value">
                      <label>Est. value</label>
                      <div className="qa-val" />
                    </div>
                  </div>

                  <div className="qa-cap" ref={capRef}>
                    ✨ Filled from your note — edit or save.
                  </div>
                  <div className="qa-save" ref={saveRef}>
                    Save enquiry
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
