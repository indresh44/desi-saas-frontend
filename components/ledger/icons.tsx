/**
 * Ledger custom icons — glyphs not covered by lucide-react.
 * Match lucide's defaults: 24×24 viewBox, 1.8 stroke, round caps.
 */

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: number;
}

export function WhatsAppIcon({ size = 16, strokeWidth = 1.8, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M3 21l1.65-4.8A8.6 8.6 0 1 1 7.8 19.3z" />
      <path d="M9 8.5c-.3 0-.6.1-.8.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.6 2 .8 2.5.7 2.9.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.7-.4c-.4-.2-1.2-.6-1.4-.6-.2-.1-.3-.1-.5.1l-.6.8c-.1.2-.3.2-.5.1a5.7 5.7 0 0 1-2.9-2.5c-.2-.4 0-.5.2-.7l.4-.5.2-.5v-.4l-.7-1.6c-.2-.4-.3-.4-.5-.5z" />
    </svg>
  );
}
