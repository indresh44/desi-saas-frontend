import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono, Plus_Jakarta_Sans, Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";
import { LayoutContent } from "@/components/layout/layout-content";
import { AuthProvider } from "@/lib/auth/auth-context";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Ledger design system — body face. Weights 400 / 500 / 600 / 700 / 800.
const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Ledger design system — mono face. Dates / money / counts / eyebrows.
const splineSansMono = Spline_Sans_Mono({
  variable: "--font-spline-sans-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

// ── Default metadata for all pages (landing page overrides in its own page.tsx) ──
export const metadata: Metadata = {
  metadataBase: new URL("https://sellnsettle.com"),
  title: {
    default: "SellNSettle — Chat-First CRM for Indian Small Businesses",
    template: "%s | SellNSettle",
  },
  description:
    "Track enquiries, send invoices, collect payments — just by chatting in Hindi, English, or Hinglish. Built for Indian MSMEs.",
  keywords: ["CRM", "MSME", "invoicing", "India", "small business", "AI"],
  authors: [{ name: "SellNSettle" }],
  openGraph: {
    type: "website",
    url: "https://sellnsettle.com",
    siteName: "SellNSettle",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://sellnsettle.com",
  },
  // PWA manifest + icons. iOS Safari reads `apple-touch-icon` from the
  // root and the `apple` set in `appleWebApp`; Android Chrome uses the
  // manifest. See public/manifest.json + public/icons/README.md.
  manifest: "/manifest.json",
  applicationName: "SellNSettle",
  appleWebApp: {
    capable: true,
    title: "SellNSettle",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// Viewport must include `viewport-fit=cover` so iPhone notch / Android display
// cutout regions are usable. Combined with `env(safe-area-inset-*)` paddings
// on bottom-pinned elements (bottom nav, chat composer), this lets sticky
// chrome sit flush with the screen edge without being clipped by the home
// indicator.
//
// `themeColor` tints the iOS / Android status bar when the PWA is installed
// in standalone mode — must match `theme_color` in public/manifest.json.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a192f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.className} ${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} ${hankenGrotesk.variable} ${splineSansMono.variable} antialiased`}
      >
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
