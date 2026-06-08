import type { CSSProperties } from "react";

/* ═══════════════════════════════════════════════════════════════
   Landing v2 — shared theme + scoped CSS
   Ported from the founder's mockup (sellnsettle-landing-v2_2.html).
   The same markup renders in two looks, switched purely by CSS vars:
     • WARM  → warm-paper aesthetic (the mockup as designed)
     • NEO   → white / neobrutalist, blends with the current live page
   All selectors are scoped under `.lv2-root` so nothing leaks into the
   rest of the app. Keyframes are prefixed `lv2-` to avoid collisions.
   ═══════════════════════════════════════════════════════════════ */

export type Lv2Theme = "warm" | "neo";

// Per-theme CSS custom properties applied inline on the `.lv2-root` wrapper.
export const WARM_VARS: CSSProperties = {
  ["--navy" as string]: "#0a192f",
  ["--navy-2" as string]: "#13243f",
  ["--coral" as string]: "#FF6B6B",
  ["--teal" as string]: "#2EC4B6",
  ["--gold" as string]: "#D4AF37",
  ["--brand" as string]: "#EA8A1B",
  ["--paper" as string]: "#FBF8F1",
  ["--paper-2" as string]: "#F3EFE4",
  ["--card" as string]: "#FFFFFF",
  ["--ink" as string]: "#0a192f",
  ["--ink-soft" as string]: "#4b5867",
  ["--ink-faint" as string]: "#7d8896",
  ["--coral-tint" as string]: "#FFE9E9",
  ["--teal-tint" as string]: "#DFF4F1",
  ["--gold-tint" as string]: "#F6EDD2",
  ["--wa" as string]: "#1f9d55",
  ["--wa-tint" as string]: "#e4f4ea",
  ["--lv2-page-bg" as string]:
    "radial-gradient(900px 460px at 88% -6%, rgba(255,107,107,.10), transparent 60%)," +
    "radial-gradient(760px 420px at -6% 18%, rgba(46,196,182,.10), transparent 58%)," +
    "#FBF8F1",
};

export const NEO_VARS: CSSProperties = {
  ["--navy" as string]: "#0a192f",
  ["--navy-2" as string]: "#13243f",
  ["--coral" as string]: "#FF6B6B",
  ["--teal" as string]: "#2EC4B6",
  ["--gold" as string]: "#d4af37",
  ["--brand" as string]: "#E8862E",
  ["--paper" as string]: "#ffffff",
  ["--paper-2" as string]: "#F8F9FA",
  ["--card" as string]: "#FFFFFF",
  ["--ink" as string]: "#0a192f",
  ["--ink-soft" as string]: "#4b5867",
  ["--ink-faint" as string]: "#7d8896",
  ["--coral-tint" as string]: "#FFE9E9",
  ["--teal-tint" as string]: "#DFF4F1",
  ["--gold-tint" as string]: "#FBF1D6",
  ["--wa" as string]: "#1f9d55",
  ["--wa-tint" as string]: "#e4f4ea",
  ["--lv2-page-bg" as string]: "#ffffff",
};

export const THEME_VARS: Record<Lv2Theme, CSSProperties> = {
  warm: WARM_VARS,
  neo: NEO_VARS,
};

export const FH = "var(--font-plus-jakarta)";

export const LV2_CSS = `
.lv2-root{
  font-family:"Plus Jakarta Sans",${FH},system-ui,sans-serif;
  background:var(--lv2-page-bg);
  color:var(--ink);
  font-size:17px;
  line-height:1.6;
  overflow-x:hidden;
  -webkit-font-smoothing:antialiased;
  position:relative;
}
.lv2-root *{box-sizing:border-box;}
/* Headings inherit container color/font so the app's global h1–h6 base rules
   (dark ink, Hanken Grotesk) don't override our per-section colors on dark cards. */
.lv2-root h1,.lv2-root h2,.lv2-root h3,.lv2-root h4,.lv2-root h5{color:inherit;font-family:inherit;}
.lv2-root .wrap{max-width:1180px;margin:0 auto;padding:0 26px;position:relative;z-index:2;}
.lv2-root a{color:inherit;text-decoration:none;}

.lv2-root .btn{display:inline-flex;align-items:center;gap:8px;font-family:inherit;font-weight:700;font-size:14.5px;cursor:pointer;border:2.5px solid var(--navy);border-radius:11px;padding:11px 18px;transition:transform .16s ease,box-shadow .16s ease,background .16s;box-shadow:3.5px 3.5px 0 var(--navy);}
.lv2-root .btn:hover{transform:translate(-2px,-2px);box-shadow:5.5px 5.5px 0 var(--navy);}
.lv2-root .btn:active{transform:translate(1px,1px);box-shadow:2px 2px 0 var(--navy);}
.lv2-root .btn-gold{background:var(--gold);color:var(--navy);}
.lv2-root .btn-coral{background:var(--coral);color:#fff;}
.lv2-root .btn-navy{background:var(--navy);color:#fff;}
.lv2-root .btn-white{background:#fff;color:var(--navy);}

/* NAV */
.lv2-root .lv2-nav{position:sticky;top:0;z-index:55;background:color-mix(in srgb, var(--paper) 90%, transparent);backdrop-filter:blur(8px);border-bottom:2.5px solid var(--navy);}
.lv2-root .nav-in{display:flex;align-items:center;justify-content:space-between;max-width:1180px;margin:0 auto;padding:13px 26px;}
.lv2-root .logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:21px;letter-spacing:-.02em;}
.lv2-root .logo .mark{width:30px;height:30px;border-radius:8px;background:var(--brand);border:2.5px solid var(--navy);display:grid;place-items:center;color:#fff;font-weight:800;font-size:16px;box-shadow:2.5px 2.5px 0 var(--navy);}
.lv2-root .logo b{color:var(--brand);}
.lv2-root .nav-links{display:flex;align-items:center;gap:26px;font-size:14.5px;font-weight:600;}
.lv2-root .nav-links a:not(.btn){color:var(--ink-soft);transition:color .18s;}
.lv2-root .nav-links a:not(.btn):hover{color:var(--coral);}
@media(max-width:880px){.lv2-root .nav-links a:not(.btn){display:none;}}

/* HERO */
.lv2-root header.hero{padding:60px 0 26px;}
.lv2-root .hero-grid{display:grid;grid-template-columns:1.02fr 1.05fr;gap:46px;align-items:center;}
.lv2-root .tagpill{display:inline-flex;align-items:center;gap:9px;background:var(--teal-tint);border:2.5px solid var(--navy);border-radius:999px;padding:7px 15px;font-size:12.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;box-shadow:3px 3px 0 var(--navy);}
.lv2-root .tagpill .sp{color:var(--brand);}
.lv2-root h1{font-weight:800;font-size:clamp(38px,5vw,62px);line-height:1.02;letter-spacing:-.035em;margin:22px 0 .35em;}
.lv2-root h1 .c{color:var(--coral);}
.lv2-root h1 .g{color:var(--gold);font-style:italic;}
.lv2-root h1 .t{color:var(--teal);}
.lv2-root .lede{font-size:clamp(17px,1.9vw,20px);max-width:520px;color:var(--ink-soft);margin:0 0 16px;}
.lv2-root .lede b{color:var(--ink);font-weight:700;}
.lv2-root .hero-beats{display:flex;flex-wrap:wrap;gap:9px;margin:0 0 16px;}
.lv2-root .hero-beats .hb{font-size:13.5px;font-weight:800;color:var(--navy);background:#fff;border:2.5px solid var(--navy);border-radius:999px;padding:7px 15px;box-shadow:3px 3px 0 var(--navy);display:inline-flex;align-items:center;gap:8px;}
.lv2-root .hero-beats .hb::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--coral);flex:none;}
.lv2-root .hero-beats .hb:nth-child(2)::before{background:var(--teal);}
.lv2-root .hero-beats .hb:nth-child(3)::before{background:var(--gold);}
.lv2-root .hero-payoff{font-size:clamp(16px,1.8vw,18.5px);color:var(--ink-soft);max-width:520px;margin:0 0 26px;}
.lv2-root .hero-payoff b{color:var(--ink);font-weight:700;}
.lv2-root .hero-cta{display:flex;gap:14px;flex-wrap:wrap;}
.lv2-root .hero-note{margin-top:18px;font-size:13px;font-weight:600;color:var(--ink-faint);display:flex;align-items:center;gap:9px;}
.lv2-root .hero-note .dot{width:8px;height:8px;border-radius:50%;background:var(--teal);box-shadow:0 0 0 4px rgba(46,196,182,.2);}

/* DASHBOARD MOCKUP */
.lv2-root .dash{background:#fff;border:3px solid var(--navy);border-radius:20px;box-shadow:10px 10px 0 var(--navy);overflow:hidden;}
.lv2-root .dash-top{background:var(--paper-2);border-bottom:2.5px solid var(--navy);padding:13px 17px;display:flex;align-items:center;justify-content:space-between;}
.lv2-root .dash-top .greet{font-weight:800;font-size:15px;}
.lv2-root .dash-top .sub{font-size:11.5px;color:var(--ink-faint);font-weight:600;}
.lv2-root .dash-top .sub b{color:var(--coral);}
.lv2-root .dash-top .ask{font-size:11px;font-weight:800;background:var(--coral-tint);color:var(--coral);border:2px solid var(--coral);border-radius:8px;padding:5px 10px;display:flex;align-items:center;gap:5px;}
.lv2-root .dash-body{padding:15px 16px 17px;display:grid;gap:11px;}
.lv2-root .dash-seclab{font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);display:flex;align-items:center;gap:8px;}
.lv2-root .dash-seclab::after{content:"";flex:1;height:1.5px;background:var(--paper-2);}
.lv2-root .ecard{border:2.5px solid var(--navy);border-radius:13px;padding:13px 14px;box-shadow:3px 3px 0 var(--navy);background:#fff;position:relative;}
.lv2-root .ecard.due{border-left:7px solid var(--coral);}
.lv2-root .ecard.noset{border-left:7px solid var(--gold);}
.lv2-root .ecard.quiet{border-left:7px solid var(--ink-faint);}
.lv2-root .ecard .er1{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.lv2-root .ecard .et{font-weight:800;font-size:14.5px;line-height:1.15;}
.lv2-root .ecard .en{font-size:12px;color:var(--ink-soft);font-weight:600;margin-top:1px;}
.lv2-root .ecard .acts{display:flex;gap:6px;flex-wrap:wrap;}
.lv2-root .chip-act{font-size:11px;font-weight:800;border:2px solid var(--navy);border-radius:8px;padding:5px 9px;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;}
.lv2-root .chip-act.wa{background:var(--wa-tint);color:var(--wa);}
.lv2-root .chip-act.call{background:#fff;color:var(--navy);}
.lv2-root .chip-act.done{background:#fff;color:var(--ink-faint);border-color:#cbd3dc;}
.lv2-root .chip-act.set{background:var(--gold-tint);color:#9c7a1e;border-color:var(--gold);}
.lv2-root .ecard .meta{display:flex;align-items:center;gap:7px;margin-top:9px;font-size:11.5px;font-weight:700;color:var(--coral);flex-wrap:wrap;}
.lv2-root .ecard.noset .meta{color:#9c7a1e;}
.lv2-root .ecard.quiet .meta{color:var(--ink-faint);}
.lv2-root .vp{font-size:10.5px;font-weight:800;background:var(--paper-2);border:1.5px solid #d9d2c2;border-radius:6px;padding:2px 6px;color:var(--ink-soft);}
.lv2-root .tg{font-size:10.5px;font-weight:800;background:var(--coral-tint);border:1.5px solid #eab7b0;border-radius:6px;padding:2px 6px;color:var(--coral);}
.lv2-root .viewctx{margin-top:9px;border-top:1.5px dashed #d9d2c2;padding-top:8px;}
.lv2-root .viewctx .vc-h{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:var(--teal);cursor:pointer;}
.lv2-root .viewctx .vc-h .caret{transition:transform .2s;}
.lv2-root .ecard.open .viewctx .vc-h .caret{transform:rotate(90deg);}
.lv2-root .vc-body{max-height:0;overflow:hidden;transition:max-height .3s ease;}
.lv2-root .ecard.open .vc-body{max-height:240px;}
.lv2-root .ai-sum{margin-top:9px;background:var(--gold-tint);border:2px dashed var(--gold);border-radius:10px;padding:10px 11px;}
.lv2-root .ai-sum .ai-l{font-size:9px;font-weight:800;letter-spacing:.08em;color:#9c7a1e;text-transform:uppercase;display:flex;align-items:center;gap:5px;margin-bottom:5px;}
.lv2-root .ai-sum p{margin:0;font-size:11.5px;line-height:1.5;color:var(--ink-soft);}
.lv2-root .ai-sum p b{color:var(--navy);}

.lv2-root .hero-badge{position:absolute;top:-13px;right:14px;z-index:6;background:var(--coral);color:#fff;border:2.5px solid var(--navy);border-radius:9px;padding:6px 12px;font-size:11px;font-weight:800;letter-spacing:.05em;transform:rotate(4deg);box-shadow:3px 3px 0 var(--navy);}
.lv2-root .hero-visual{position:relative;}

/* trust */
.lv2-root .trust{margin-top:30px;border-top:2.5px solid var(--navy);border-bottom:2.5px solid var(--navy);padding:16px 0;display:flex;flex-wrap:wrap;gap:9px 12px;align-items:center;justify-content:center;}
.lv2-root .trust .lbl{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--teal);}
.lv2-root .trust .who{background:#fff;border:2px solid var(--navy);border-radius:999px;padding:5px 14px;font-size:13.5px;font-weight:600;box-shadow:2.5px 2.5px 0 var(--navy);}

/* SECTION base */
.lv2-root section{padding:74px 0;}
.lv2-root .lab{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:var(--teal);margin-bottom:12px;}
.lv2-root h2{font-weight:800;font-size:clamp(30px,4.4vw,50px);line-height:1.04;letter-spacing:-.03em;margin:0 0 .35em;}
.lv2-root h2 .c{color:var(--coral);}
.lv2-root h2 .g{color:var(--gold);font-style:italic;}
.lv2-root h2 .t{color:var(--teal);}
.lv2-root h2 em{font-style:italic;color:var(--coral);}
.lv2-root .sec-lede{font-size:clamp(17px,1.9vw,20px);color:var(--ink-soft);max-width:640px;}

/* LOSE TRACK */
.lv2-root .lt-band{background:var(--navy);border-radius:22px;border:3px solid var(--navy);box-shadow:9px 9px 0 var(--coral);padding:54px 44px;position:relative;overflow:hidden;}
.lv2-root .lt-band::after{content:"";position:absolute;right:-50px;bottom:-50px;width:230px;height:230px;border-radius:50%;background:radial-gradient(circle,rgba(46,196,182,.32),transparent 70%);}
.lv2-root .lt-band .lab{color:var(--gold);}
.lv2-root .lt-band h2{color:#fff;position:relative;}
.lv2-root .lt-band h2 .strike{color:rgba(255,255,255,.45);text-decoration:line-through;text-decoration-color:var(--coral);text-decoration-thickness:4px;}
.lv2-root .lt-band h2 .keep{color:var(--teal);}
.lv2-root .lt-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:34px;position:relative;}
.lv2-root .lt-chip{background:var(--navy-2);border:2px solid #2b3a55;border-radius:12px;padding:14px 16px;font-weight:700;font-size:15px;color:rgba(255,255,255,.82);display:flex;align-items:center;gap:10px;}
.lv2-root .lt-chip .x{color:var(--coral);font-weight:800;flex:none;}
@media(max-width:760px){.lv2-root .lt-grid{grid-template-columns:1fr;}}

/* LOOP */
.lv2-root .loop{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:34px;align-items:stretch;}
.lv2-root .lcard{background:var(--card);border:2.5px solid var(--navy);border-radius:16px;padding:26px 24px;box-shadow:5px 5px 0 var(--navy);transition:transform .18s,box-shadow .18s;position:relative;display:flex;flex-direction:column;}
.lv2-root .lcard:hover{transform:translate(-3px,-3px);box-shadow:8px 8px 0 var(--navy);}
.lv2-root .lnum{width:44px;height:44px;border-radius:50%;border:2.5px solid var(--navy);display:grid;place-items:center;font-weight:800;font-size:18px;color:#fff;box-shadow:2.5px 2.5px 0 var(--navy);margin-bottom:16px;}
.lv2-root .lcard.l1 .lnum{background:var(--coral);}
.lv2-root .lcard.l2 .lnum{background:var(--teal);}
.lv2-root .lcard.l3 .lnum{background:var(--gold);color:var(--navy);}
.lv2-root .lcard .ls{font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-faint);}
.lv2-root .lcard h3{font-weight:800;font-size:22px;letter-spacing:-.02em;margin:4px 0 8px;}
.lv2-root .lcard p{font-size:15px;color:var(--ink-soft);margin:0 0 16px;}
.lv2-root .lcard .who-acts{font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;margin-top:auto;padding-top:10px;border-top:1.5px dashed #d9d2c2;color:var(--ink-faint);}
.lv2-root .lcard .who-acts b{color:var(--navy);}
.lv2-root .demo{background:var(--paper-2);border:2px solid var(--navy);border-radius:11px;padding:12px 13px;font-size:13px;line-height:1.6;margin-bottom:14px;}
.lv2-root .demo b{color:var(--navy);font-weight:800;}
.lv2-root .demo .ok{color:var(--teal);font-weight:800;}
.lv2-root .demo .al{color:var(--coral);font-weight:800;}
.lv2-root .ochips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px;}
.lv2-root .ochip{font-size:11.5px;font-weight:700;border:2px solid var(--navy);border-radius:8px;padding:5px 10px;background:#fff;box-shadow:2px 2px 0 var(--navy);}
.lv2-root .ochip.hot{background:var(--teal-tint);color:var(--teal);}
.lv2-root .loop-foot{text-align:center;margin-top:26px;font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--coral);}
@media(max-width:820px){.lv2-root .loop{grid-template-columns:1fr;}}

/* AI SECTION */
.lv2-root .ai-sec{background:var(--navy);color:#fff;border-top:3px solid var(--navy);border-bottom:3px solid var(--navy);}
.lv2-root .ai-sec .lab{color:var(--gold);}
.lv2-root .ai-sec h2{color:#fff;}
.lv2-root .ai-sec h2 em{color:var(--teal);}
.lv2-root .ai-head{display:grid;grid-template-columns:1.05fr .95fr;gap:38px;align-items:center;}
.lv2-root .ai-stance{background:rgba(255,255,255,.05);border:2.5px solid var(--teal);border-radius:16px;padding:22px 24px;box-shadow:5px 5px 0 var(--teal);}
.lv2-root .ai-stance .q{font-weight:800;font-size:clamp(18px,2.3vw,24px);letter-spacing:-.02em;line-height:1.22;color:var(--teal);font-style:italic;}
.lv2-root .ai-stance p{font-size:14.5px;color:rgba(255,255,255,.74);margin:12px 0 0;}
.lv2-root .stance-points{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px;}
.lv2-root .stance-points .sp-pt{font-size:12.5px;font-weight:700;color:#fff;background:rgba(46,196,182,.12);border:2px solid rgba(46,196,182,.45);border-radius:999px;padding:5px 13px;display:inline-flex;align-items:center;gap:7px;}
.lv2-root .stance-points .sp-pt::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--teal);flex:none;}
.lv2-root .stance-payoff{margin-top:15px;font-weight:800;font-size:18px;letter-spacing:-.01em;color:rgba(255,255,255,.55);}
.lv2-root .stance-payoff span{color:var(--teal);}
.lv2-root .ai-stance .split{display:flex;gap:10px;margin-top:16px;}
.lv2-root .ai-stance .half{flex:1;border-radius:11px;padding:12px;border:2px solid #38486690;}
.lv2-root .ai-stance .half .ht{font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:5px;}
.lv2-root .ai-stance .half.does{background:rgba(46,196,182,.1);}
.lv2-root .ai-stance .half.does .ht{color:var(--teal);}
.lv2-root .ai-stance .half.dont{background:rgba(255,107,107,.08);}
.lv2-root .ai-stance .half.dont .ht{color:var(--coral);}
.lv2-root .ai-stance .half p{font-size:12.5px;color:rgba(255,255,255,.8);margin:0;}
.lv2-root .expand-mock{background:#fff;border:2.5px solid var(--navy);border-radius:14px;box-shadow:6px 6px 0 var(--teal);overflow:hidden;color:var(--ink);}
.lv2-root .em-card{padding:15px 16px;}
.lv2-root .em-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;}
.lv2-root .em-t{font-weight:800;font-size:16px;}
.lv2-root .em-n{font-size:12.5px;color:var(--ink-soft);font-weight:600;}
.lv2-root .em-acts{display:flex;gap:6px;}
.lv2-root .em-meta{display:flex;align-items:center;gap:7px;margin-top:9px;font-size:12px;font-weight:700;color:var(--coral);}
.lv2-root .em-expand{background:var(--paper-2);border-top:2px solid var(--navy);padding:13px 16px;}
.lv2-root .em-expand .vc-h{display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;color:var(--teal);margin-bottom:9px;}
.lv2-root .em-ai{background:#fff;border:2px dashed var(--gold);border-radius:11px;padding:12px 13px;}
.lv2-root .em-ai .ai-l{font-size:9.5px;font-weight:800;letter-spacing:.08em;color:#9c7a1e;text-transform:uppercase;display:flex;align-items:center;gap:5px;margin-bottom:6px;}
.lv2-root .em-ai p{margin:0;font-size:12.5px;line-height:1.55;color:var(--ink-soft);}
.lv2-root .em-ai p b{color:var(--navy);}
.lv2-root .em-ai .req{margin-top:8px;display:flex;flex-wrap:wrap;gap:5px;}
.lv2-root .em-ai .req .r{font-size:10.5px;font-weight:800;background:var(--teal-tint);border:1.5px solid #9ecbb9;border-radius:6px;padding:2px 7px;color:var(--teal);}
.lv2-root .ai-abil{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:34px;}
.lv2-root .acard{background:var(--navy-2);border:2.5px solid #2b3a55;border-radius:14px;padding:22px;transition:transform .18s,border-color .18s,box-shadow .18s;}
.lv2-root .acard:hover{transform:translate(-3px,-3px);border-color:var(--gold);box-shadow:6px 6px 0 rgba(212,175,55,.5);}
.lv2-root .acard .ai-ic{width:42px;height:42px;border-radius:10px;background:rgba(255,255,255,.06);border:2px solid #38486690;display:grid;place-items:center;margin-bottom:14px;}
.lv2-root .acard h4{font-weight:800;font-size:17px;letter-spacing:-.01em;margin:0 0 5px;}
.lv2-root .acard p{font-size:14px;color:rgba(255,255,255,.68);margin:0;}
.lv2-root .acard.k1 .ai-ic svg{color:var(--gold);}
.lv2-root .acard.k2 .ai-ic svg{color:var(--teal);}
.lv2-root .auto-note{margin-top:18px;border:2px dashed #3a4a66;border-radius:12px;padding:14px 16px;font-size:13.5px;font-weight:600;color:rgba(255,255,255,.7);display:flex;align-items:flex-start;gap:10px;}
.lv2-root .auto-note b{color:#fff;font-weight:800;}
.lv2-root .auto-note .ic{color:var(--coral);flex:none;}
@media(max-width:880px){.lv2-root .ai-head{grid-template-columns:1fr;}.lv2-root .ai-abil{grid-template-columns:1fr;}}

/* CAPTURE DEMO */
.lv2-root .cap-grid{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;margin-top:6px;}
.lv2-root .cap-copy .ways{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0 18px;}
.lv2-root .cap-copy .way{font-size:13px;font-weight:800;border:2.5px solid var(--navy);border-radius:10px;padding:9px 14px;box-shadow:3px 3px 0 var(--navy);display:inline-flex;align-items:center;gap:8px;background:#fff;}
.lv2-root .cap-copy .way.ai{background:var(--gold-tint);}
.lv2-root .cap-copy .way .sp{color:var(--gold);}
.lv2-root .cap-copy .ctrl{display:flex;align-items:flex-start;gap:10px;font-size:14.5px;color:var(--ink-soft);border-left:3px solid var(--teal);padding:4px 0 4px 14px;}
.lv2-root .cap-copy .ctrl b{color:var(--ink);}
.lv2-root .cap-phone-wrap{display:flex;justify-content:center;position:relative;}
.lv2-root .cap-phone{width:300px;background:var(--navy);border:3px solid var(--navy);border-radius:38px;padding:11px;box-shadow:10px 10px 0 var(--navy);position:relative;}
.lv2-root .cap-screen{background:var(--paper-2);border-radius:28px;overflow:hidden;border:2px solid var(--navy);height:540px;position:relative;}
.lv2-root .cap-appbar{background:#fff;border-bottom:2px solid var(--navy);padding:12px 13px;display:flex;align-items:center;justify-content:space-between;}
.lv2-root .cap-appbar .biz{font-weight:800;font-size:13px;}
.lv2-root .cap-appbar .biz span{display:block;font-size:9px;font-weight:600;color:var(--ink-faint);}
.lv2-root .cap-newbtn{font-size:11px;font-weight:800;background:var(--coral);color:#fff;border:2px solid var(--navy);border-radius:9px;padding:7px 11px;display:inline-flex;align-items:center;gap:5px;box-shadow:2.5px 2.5px 0 var(--navy);transition:transform .12s,box-shadow .12s;}
.lv2-root .cap-newbtn.tap{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--navy);}
.lv2-root .cap-dash{padding:12px;display:grid;gap:9px;}
.lv2-root .cap-dlab{font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-faint);}
.lv2-root .cap-ghost{background:#fff;border:2px solid var(--navy);border-radius:11px;padding:11px 12px;box-shadow:2.5px 2.5px 0 var(--navy);}
.lv2-root .cap-ghost .g1{height:9px;width:62%;background:#dfe5ec;border-radius:4px;}
.lv2-root .cap-ghost .g2{height:7px;width:40%;background:#eef1f5;border-radius:4px;margin-top:7px;}
.lv2-root .cap-ghost.coral{border-left:6px solid var(--coral);}
.lv2-root .cap-ghost.teal{border-left:6px solid var(--teal);}
.lv2-root .cap-sheet{position:absolute;left:0;right:0;bottom:0;background:#fff;border-top:2.5px solid var(--navy);border-radius:20px 20px 0 0;box-shadow:0 -12px 30px -16px rgba(10,25,47,.4);padding:12px 14px 16px;transform:translateY(102%);transition:transform .42s cubic-bezier(.2,.8,.2,1);max-height:90%;overflow:hidden;}
.lv2-root .cap-screen.sheet-open .cap-sheet{transform:translateY(0);}
.lv2-root .cap-handle{width:40px;height:4px;border-radius:99px;background:#cdd5df;margin:0 auto 12px;}
.lv2-root .cap-sheet-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;}
.lv2-root .cap-sheet-h .t{font-weight:800;font-size:15px;}
.lv2-root .cap-tabs{display:flex;gap:5px;}
.lv2-root .cap-tab{font-size:10px;font-weight:800;border:2px solid var(--navy);border-radius:7px;padding:4px 8px;background:#fff;color:var(--ink-faint);display:flex;align-items:center;gap:4px;}
.lv2-root .cap-tab.on{background:var(--gold-tint);color:#9c7a1e;}
.lv2-root .cap-tab.on .sp{color:var(--gold);}
.lv2-root .qa-box{border:2px solid var(--navy);border-radius:12px;background:var(--paper);padding:11px 12px;min-height:62px;font-size:13px;line-height:1.5;color:var(--ink);position:relative;overflow:hidden;box-shadow:2.5px 2.5px 0 var(--navy);}
.lv2-root .qa-box .ph{color:var(--ink-faint);}
.lv2-root .qa-caret{display:inline-block;width:2px;height:15px;background:var(--coral);vertical-align:-3px;margin-left:1px;animation:lv2-blink 1s steps(1) infinite;}
@keyframes lv2-blink{50%{opacity:0;}}
.lv2-root .qa-statusline{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:700;color:var(--ink-faint);margin:10px 2px 12px;min-height:16px;}
.lv2-root .qa-statusline .spin{width:13px;height:13px;border:2px solid #d7dde5;border-top-color:var(--teal);border-radius:50%;animation:lv2-spin .7s linear infinite;display:none;}
.lv2-root .qa-statusline.working .spin{display:inline-block;}
.lv2-root .qa-statusline .teal{color:var(--teal);}
@keyframes lv2-spin{to{transform:rotate(360deg);}}
.lv2-root .qa-form{position:relative;display:grid;gap:9px;transition:opacity .25s,filter .25s;}
.lv2-root .qa-form.locked{opacity:.4;filter:grayscale(.3);pointer-events:none;}
.lv2-root .qa-field{display:grid;gap:3px;}
.lv2-root .qa-field label{font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-faint);}
.lv2-root .qa-val{border:2px solid var(--navy);border-radius:9px;padding:8px 10px;font-size:12.5px;font-weight:700;min-height:33px;background:#fff;color:var(--ink);transition:background .35s,box-shadow .35s;}
.lv2-root .qa-val:empty::before{content:"—";color:#c9d0d9;font-weight:600;}
.lv2-root .qa-field.flash .qa-val{background:var(--teal-tint);box-shadow:0 0 0 2px var(--teal) inset;}
.lv2-root .qa-row2{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
.lv2-root .qa-scan{position:absolute;left:0;right:0;top:-32px;height:32px;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(46,196,182,.4),transparent);opacity:0;}
.lv2-root .qa-box.scanning{box-shadow:2.5px 2.5px 0 var(--navy), 0 0 0 2px var(--teal) inset;}
.lv2-root .qa-box.scanning .qa-scan{opacity:1;animation:lv2-scan 1.05s ease-in-out;}
@keyframes lv2-scan{0%{top:-32px;}100%{top:100%;}}
.lv2-root .qa-cap{font-size:11px;font-weight:800;color:var(--teal);margin:11px 2px 0;min-height:15px;opacity:0;transition:opacity .3s;}
.lv2-root .qa-cap.show{opacity:1;}
.lv2-root .qa-save{margin-top:11px;width:100%;text-align:center;background:var(--gold);color:var(--navy);border:2.5px solid var(--navy);border-radius:11px;padding:11px;font-weight:800;font-size:13.5px;box-shadow:3px 3px 0 var(--navy);transition:transform .12s,box-shadow .12s;}
.lv2-root .qa-save.tap{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--navy);}
@media(max-width:820px){.lv2-root .cap-grid{grid-template-columns:1fr;gap:36px;}}

/* WHO */
.lv2-root .who-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:34px;}
.lv2-root .person{background:var(--card);border:2.5px solid var(--navy);border-radius:16px;overflow:hidden;box-shadow:5px 5px 0 var(--navy);transition:transform .18s,box-shadow .18s;}
.lv2-root .person:hover{transform:translate(-3px,-3px);box-shadow:8px 8px 0 var(--navy);}
.lv2-root .person .top{height:118px;display:grid;place-items:center;border-bottom:2.5px solid var(--navy);}
.lv2-root .person.p1 .top{background:var(--coral-tint);}
.lv2-root .person.p2 .top{background:var(--teal-tint);}
.lv2-root .person.p3 .top{background:var(--gold-tint);}
.lv2-root .person .top svg{width:52px;height:52px;}
.lv2-root .person.p1 .top svg{color:var(--coral);}
.lv2-root .person.p2 .top svg{color:var(--teal);}
.lv2-root .person.p3 .top svg{color:#b8932a;}
.lv2-root .person .body{padding:20px 22px 24px;}
.lv2-root .person .body h3{font-weight:800;font-style:italic;font-size:21px;letter-spacing:-.01em;margin:0 0 7px;}
.lv2-root .person.p1 .body h3{color:var(--coral);}
.lv2-root .person.p2 .body h3{color:var(--teal);}
.lv2-root .person.p3 .body h3{color:#b8932a;}
.lv2-root .person .body p{font-size:14.5px;color:var(--ink-soft);margin:0;}
@media(max-width:820px){.lv2-root .who-grid{grid-template-columns:1fr;}}

/* CTA */
.lv2-root .cta-block{background:var(--coral);border:3px solid var(--navy);border-radius:26px;box-shadow:12px 12px 0 var(--gold);padding:58px 44px;text-align:center;position:relative;overflow:hidden;}
.lv2-root .cta-block::before{content:"";position:absolute;left:-40px;top:-40px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.25),transparent 70%);}
.lv2-root .cta-block h2{color:#fff;margin:0 auto .15em;max-width:680px;position:relative;text-shadow:2px 2px 0 rgba(10,25,47,.25);}
.lv2-root .cta-block h2 em{color:var(--navy);font-style:italic;}
.lv2-root .cta-block .cs{font-size:18px;font-weight:600;color:rgba(255,255,255,.95);max-width:540px;margin:0 auto 8px;position:relative;}
.lv2-root .cta-perks{display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin:20px 0 26px;position:relative;font-size:13.5px;font-weight:700;}
.lv2-root .cta-perks span{display:flex;align-items:center;gap:7px;color:#fff;}
.lv2-root .cta-perks .tick{color:var(--navy);font-weight:800;}
.lv2-root .cta-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;position:relative;}
.lv2-root .cta-fine{margin-top:18px;font-size:12.5px;font-weight:600;color:rgba(255,255,255,.85);position:relative;}

/* reveal + load-in */
.lv2-root .rv{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s ease;}
.lv2-root .rv.in{opacity:1;transform:none;}
.lv2-root .ld{opacity:0;transform:translateY(18px);animation:lv2-rise .7s cubic-bezier(.2,.7,.2,1) forwards;}
.lv2-root .ld-1{animation-delay:.05s;}
.lv2-root .ld-2{animation-delay:.15s;}
.lv2-root .ld-3{animation-delay:.26s;}
.lv2-root .ld-4{animation-delay:.37s;}
.lv2-root .ld-5{animation-delay:.48s;}
.lv2-root .ld-6{animation-delay:.6s;}
@keyframes lv2-rise{to{opacity:1;transform:none;}}

@media(max-width:900px){.lv2-root .hero-grid{grid-template-columns:1fr;gap:40px;}}
@media(max-width:760px){.lv2-root{font-size:16px;}.lv2-root section{padding:56px 0;}.lv2-root .lt-band{padding:40px 26px;}.lv2-root .cta-block{padding:42px 24px;}}
@media(prefers-reduced-motion:reduce){.lv2-root .qa-caret,.lv2-root .qa-statusline .spin,.lv2-root .qa-box.scanning .qa-scan,.lv2-root .ld{animation:none!important;}.lv2-root .ld{opacity:1;transform:none;}}
`;
