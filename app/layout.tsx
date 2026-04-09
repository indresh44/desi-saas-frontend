import type { Metadata } from "next";
import { Inter, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
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
  icons: {
    icon: "/favicon.ico",
  },
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
        className={`${inter.className} ${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
