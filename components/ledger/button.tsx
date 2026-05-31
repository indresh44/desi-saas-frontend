import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Ledger buttons — §7.3.
 *
 * Variants
 *   primary   — terracotta fill, white text, soft accent shadow.
 *               Use for the screen's one primary action.
 *   action    — neutral surface, 1px border, secondary text.
 *               Used for inline actions like "Call".
 *   whatsapp  — WhatsApp green driven by --wa (the one sanctioned
 *               non-system colour). Auto re-tints across modes.
 *   ghost     — transparent, hover fills with surface-raised.
 *   icon      — square icon-only button.
 *
 * Sizes follow the spec (40 / 34 / 30px) and the icon size variant
 * is 34×34 with no padding.
 */
const button = cva(
  [
    "inline-flex items-center justify-center gap-[6px]",
    "font-semibold whitespace-nowrap",
    "transition-colors transition-shadow",
    "outline-none disabled:opacity-50 disabled:pointer-events-none",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "",
        action: "",
        whatsapp: "",
        ghost: "",
        icon: "",
        setFollowup: "",
      },
      size: {
        // Spec values: primary 40, action 34, ghost 30.
        lg: "h-10 px-[18px] text-[14px]",
        md: "h-[34px] px-[13px] text-[13px]",
        sm: "h-[30px] px-[12px] text-[12.5px]",
        icon: "h-[34px] w-[34px] p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type StyleVars = React.CSSProperties & Record<string, string>;

function styleFor(variant: NonNullable<VariantProps<typeof button>["variant"]>): StyleVars {
  switch (variant) {
    case "primary":
      return {
        background: "var(--color-accent)",
        color: "var(--color-accent-contrast)",
        border: "1px solid transparent",
        borderRadius: "var(--ledger-radius-control)",
        boxShadow: "0 1px 2px color-mix(in oklch, var(--color-accent) 40%, transparent)",
      };
    case "action":
      return {
        background: "var(--color-surface)",
        color: "var(--color-text-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--ledger-radius-control)",
      };
    case "whatsapp":
      return {
        background: "color-mix(in oklch, var(--wa) 8%, var(--color-surface))",
        color: "var(--wa)",
        border: "1px solid color-mix(in oklch, var(--wa) 30%, transparent)",
        borderRadius: "var(--ledger-radius-control)",
      };
    case "ghost":
      return {
        background: "transparent",
        color: "var(--color-text-muted)",
        border: "1px solid transparent",
        borderRadius: "var(--ledger-radius-control)",
      };
    case "icon":
      return {
        background: "transparent",
        color: "var(--color-text-muted)",
        border: "1px solid transparent",
        borderRadius: "var(--ledger-radius-sm)",
      };
    case "setFollowup":
      // §13.5 — needs-attention CTA for unset / quiet leads. Driven
      // by --follow-unset so it re-tints across light/dark.
      return {
        background: "color-mix(in oklch, var(--follow-unset) 10%, var(--color-surface))",
        color: "var(--follow-unset)",
        border: "1px solid color-mix(in oklch, var(--follow-unset) 34%, var(--color-border))",
        borderRadius: "var(--ledger-radius-control)",
      };
  }
}

export interface LedgerButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "style">,
    VariantProps<typeof button> {
  /** Optional inline-style override merged after variant styles. */
  style?: React.CSSProperties;
}

export const LedgerButton = forwardRef<HTMLButtonElement, LedgerButtonProps>(
  function LedgerButton({ className, variant = "primary", size = "md", style, ...props }, ref) {
    const baseStyle = styleFor(variant ?? "primary");
    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        className={cn(button({ variant, size }), className)}
        style={{ ...baseStyle, ...style }}
        {...props}
      />
    );
  },
);
