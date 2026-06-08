import {
  Eyebrow,
  FollowupPill,
  LedgerButton,
  LedgerSurface,
  LedgerThemeToggle,
  Mono,
  PageTitle,
  Panel,
  PanelHead,
  SourceTag,
  StageBadge,
  StatusStripe,
} from "@/components/ledger";
import { Phone } from "lucide-react";

/**
 * Ledger Design System — preview / sanity page.
 *
 * Renders every primitive on a single warm-paper surface so the
 * tokens, fonts, light/dark switch and atoms can be verified at a
 * glance before any feature screen is rebuilt. Not linked from the
 * app — visit /ledger-preview directly.
 */
export default function LedgerPreviewPage() {
  return (
    <LedgerSurface className="min-h-dvh">
      <div className="mx-auto max-w-[1180px] px-[30px] py-[26px]">
        {/* Header strip */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <PageTitle>Ledger Design System</PageTitle>
            <p
              className="mt-1 text-[14px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              Foundation preview — tokens, fonts, theme switch, atoms.
            </p>
          </div>
          <LedgerThemeToggle />
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* ── Main column ── */}
          <div className="flex flex-col gap-6">
            <Panel>
              <PanelHead title="Pipeline stage" count="§ 7.6" />
              <div className="flex flex-wrap gap-2">
                <StageBadge stage="new" />
                <StageBadge stage="interested" />
                <StageBadge stage="visit" />
                <StageBadge stage="wip" />
                <StageBadge stage="completed" />
              </div>
            </Panel>

            <Panel>
              <PanelHead title="Follow-up status" count="§ 7.7" />
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <FollowupPill kind="overdue" label="2 days late" />
                <FollowupPill kind="unset" />
                <FollowupPill kind="today" label="Follow up today" />
                <FollowupPill kind="scheduled" label="Follow up 30 May" />
                <FollowupPill kind="quiet" label="Quiet 5 days — nudge?" />
                <FollowupPill kind="closed" label="Closed" />
                <FollowupPill kind="none" />
              </div>
            </Panel>

            <Panel>
              <PanelHead title="Buttons" count="§ 7.3" />
              <div className="flex flex-wrap items-center gap-3">
                <LedgerButton variant="primary" size="lg">+ New Enquiry</LedgerButton>
                <LedgerButton variant="action">
                  <Phone className="size-[15px]" strokeWidth={1.8} />
                  Call
                </LedgerButton>
                <LedgerButton variant="whatsapp">WhatsApp</LedgerButton>
                <LedgerButton variant="ghost" size="sm">Done</LedgerButton>
                <LedgerButton variant="icon" size="icon" aria-label="More">
                  <Phone className="size-[15px]" strokeWidth={1.8} />
                </LedgerButton>
              </div>
            </Panel>

            <Panel>
              <PanelHead title="Status stripe + row sample" count="§ 7.13 / 7.10" />
              <div className="flex flex-col gap-3">
                {(["overdue", "unset", "today", "scheduled"] as const).map((k) => (
                  <div
                    key={k}
                    className="relative overflow-hidden"
                    style={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--ledger-radius-card)",
                      padding: "14px 15px 13px 17px",
                    }}
                  >
                    <StatusStripe kind={k} />
                    <div className="flex items-start justify-between">
                      <div>
                        <div
                          className="text-[16px] font-bold tracking-[-0.02em]"
                          style={{ color: "var(--color-text)" }}
                        >
                          Modular kitchen — 3BHK
                        </div>
                        <div
                          className="mt-1 text-[13px]"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Rajesh Kumar · <SourceTag source="Referral" /> · <Mono>Added 24 May</Mono>
                        </div>
                      </div>
                      <div className="text-right">
                        <Eyebrow>Est.</Eyebrow>
                        <div className="mt-0.5">
                          <Mono className="text-[13.5px] font-semibold">₹ 2,50,000</Mono>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StageBadge stage="visit" />
                      <FollowupPill kind={k} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          {/* ── Side rail ── */}
          <div className="flex flex-col gap-6">
            <Panel>
              <PanelHead title="Typography" count="§ 4" />
              <div className="flex flex-col gap-2">
                <span style={{ color: "var(--color-text)" }} className="text-[26px] font-bold tracking-[-0.025em]">
                  Page title 26 / 700
                </span>
                <span style={{ color: "var(--color-text)" }} className="text-[16px] font-bold tracking-[-0.02em]">
                  Card title 16 / 700
                </span>
                <span style={{ color: "var(--color-text-secondary)" }} className="text-[14px]">
                  Body 14 / 400
                </span>
                <span style={{ color: "var(--color-text-muted)" }} className="text-[13px]">
                  Meta 13 / 400
                </span>
                <Eyebrow>Eyebrow · mono</Eyebrow>
                <Mono className="text-[13px]" style={{ color: "var(--color-text-faint)" }}>
                  2026-05-30 · ₹ 2,50,000 · 12 leads
                </Mono>
              </div>
            </Panel>

            <Panel>
              <PanelHead title="Colour swatches" count="§ 3.1" />
              <div className="grid grid-cols-2 gap-2 text-[11.5px]">
                {[
                  ["bg", "--color-bg"],
                  ["surface", "--color-surface"],
                  ["surface-raised", "--color-surface-raised"],
                  ["accent", "--color-accent"],
                  ["accent-soft", "--color-accent-soft"],
                  ["border", "--color-border"],
                ].map(([label, token]) => (
                  <div
                    key={label}
                    className="flex items-center gap-2"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    <span
                      className="inline-block size-6 rounded-md"
                      style={{
                        background: `var(${token})`,
                        border: "1px solid var(--color-border)",
                      }}
                    />
                    <Mono>{label}</Mono>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <p
          className="mt-10 text-center text-[12px]"
          style={{ color: "var(--color-text-faint)" }}
        >
          <Mono>§ 0 foundation complete</Mono>
          {" · "}
          next: build pages from the recipes in § 15.
        </p>
      </div>
    </LedgerSurface>
  );
}
