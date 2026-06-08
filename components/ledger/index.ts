/**
 * Ledger Design System — reusable primitives.
 *
 * Spec:   design_handoff_ledger/Ledger Design System.md
 * Tokens: app/ledger.css  (applied globally at :root)
 *
 * Usage — Ledger is the global theme, so just compose primitives:
 *
 *   import { PageTitle, StageBadge, FollowupPill, LedgerButton } from "@/components/ledger";
 *
 *   <PageTitle>Enquiries</PageTitle>
 *   <StageBadge stage="visit" />
 *   <FollowupPill kind="overdue" label="2 days late" />
 *   <LedgerButton variant="primary">+ New Enquiry</LedgerButton>
 */

export * from "./tokens";
export { LedgerSurface } from "./ledger-surface";
export { LedgerThemeToggle } from "./theme-toggle";

// Atoms
export { StageBadge } from "./stage-badge";
export { FollowupPill } from "./followup-pill";
export { SourceTag } from "./source-tag";
export { StatusStripe } from "./status-stripe";
export { LedgerButton } from "./button";
export type { LedgerButtonProps } from "./button";
export { Panel, PanelHead } from "./panel";
export { Mono, Eyebrow, PageTitle } from "./typography";
export { WhatsAppIcon } from "./icons";

// Form controls
export {
  LedgerSearchInput,
  LedgerSelectBox,
  LedgerDateRange,
  LedgerSegmentedControl,
} from "./form-controls";
export type {
  LedgerSearchInputProps,
  SegmentOption,
} from "./form-controls";

// Filter chips (mobile)
export {
  LedgerQuickFilterChip,
  LedgerChipScroller,
} from "./quick-filter-chip";

// Composed views
export { LedgerEnquiryTable } from "./enquiry-table";
