import type { Metadata } from "next";
import { HomeRouter } from "@/components/home-router";

// ── Landing page SEO metadata (overrides layout.tsx defaults) ──
export const metadata: Metadata = {
  title: "SellNSettle — Apni Business Diary, Ab AI Ke Saath",
  description:
    "India's first chat-first CRM for small businesses. Track enquiries, send invoices, collect payments — just by chatting in Hindi, English, or Hinglish. Built for interior designers, photographers, coaches & freelancers.",
  keywords: [
    "AI CRM India",
    "chat CRM for small business",
    "invoice software Hindi",
    "MSME CRM India",
    "interior designer CRM",
    "freelancer invoice app",
    "WhatsApp invoice India",
    "billing app Hindi",
    "lead tracking India",
    "small business invoicing",
    "enquiry management app",
    "payment collection app India",
    "GST invoice software",
    "business diary app",
    "SellNSettle",
  ],
  authors: [{ name: "SellNSettle" }],
  openGraph: {
    type: "website",
    url: "https://sellnsettle.com",
    title: "SellNSettle — Apni Business Diary, Ab AI Ke Saath",
    description:
      "Track enquiries, send invoices, collect payments — just by chatting in Hindi, English, or Hinglish. Built for Indian MSMEs.",
    siteName: "SellNSettle",
    locale: "en_IN",
    // TODO: Add OG image once designed
    images: [
      {
        url: "https://pub-868a57b0f5d74de78768fa0dccf4fb9a.r2.dev/assets/svgviewer-png-output.png",
        width: 1200,
        height: 630,
        alt: "SellNSettle — Chat-first CRM for Indian small businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SellNSettle — Apni Business Diary, Ab AI Ke Saath",
    description:
      "India's first chat-first CRM. Track leads, send invoices, collect payments — just by chatting. Works in Hindi, English & Hinglish.",
    // TODO: Add Twitter image
    images: ["https://pub-868a57b0f5d74de78768fa0dccf4fb9a.r2.dev/assets/svgviewer-png-output.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://sellnsettle.com",
  },
};

// ── JSON-LD Structured Data ──
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SellNSettle",
  url: "https://sellnsettle.com",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Chat-first AI CRM for Indian small businesses. Manage enquiries, invoices, and payments through natural language in Hindi, English, or Hinglish.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
    description: "Free tier available — no credit card required",
  },
  author: {
    "@type": "Organization",
    name: "SellNSettle",
    url: "https://sellnsettle.com",
  },
  audience: {
    "@type": "BusinessAudience",
    audienceType: "Small and Medium Enterprises",
    geographicArea: {
      "@type": "Country",
      name: "India",
    },
  },
  featureList: [
    "AI chat-based CRM in Hindi and English",
    "Lead and enquiry tracking",
    "GST invoice generation",
    "WhatsApp invoice sharing",
    "Payment collection and reminders",
    "Follow-up management",
    "Billing analytics",
  ],
};

export default function Home() {
  return (
    <>
      {/* JSON-LD for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Client-side auth router — shows landing page or dashboard */}
      <HomeRouter />
    </>
  );
}