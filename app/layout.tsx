import type { Metadata } from "next";
import { Inter, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { LayoutContent } from "@/components/layout/layout-content";
import { AuthProvider } from "@/lib/auth/auth-context";
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

export const metadata: Metadata = {
  title: "SellNSettle — From First Enquiry to Final Payment",
  description: "Stop juggling WhatsApp, a diary, and billing apps. SellNSettle tracks every lead, quote, invoice, and payment in one place — made for how Indian small businesses actually work.",
  keywords: ["CRM", "MSME", "invoicing", "lead tracking", "WhatsApp", "billing", "GST"],
  authors: [{ name: "SellNSettle" }],
  openGraph: {
    type: "website",
    url: "https://sellnsettle.com",
    title: "SellNSettle — From First Enquiry to Final Payment",
    description: "Stop juggling WhatsApp, a diary, and billing apps. SellNSettle tracks every lead, quote, invoice, and payment in one place — made for how Indian small businesses actually work.",
    siteName: "SellNSettle",
  },
  twitter: {
    card: "summary_large_image",
    title: "SellNSettle — From First Enquiry to Final Payment",
    description: "Stop juggling WhatsApp, a diary, and billing apps. SellNSettle tracks every lead, quote, invoice, and payment in one place — made for how Indian small businesses actually work.",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://sellnsettle.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
