import type { Metadata } from "next";
import Post5Content from "./post5-content";

export const metadata: Metadata = {
  title: "Payment Reminder Messages — 10 Templates in Hindi & English",
  description:
    "Ready-to-use payment reminder message templates in Hindi and English for WhatsApp. Gentle to firm — covers due date, 3 days, 7 days, and final notice. Copy-paste karein.",
  keywords: [
    "payment reminder message Hindi",
    "payment yaad dilane ka message",
    "payment reminder WhatsApp template",
    "invoice payment follow up message",
    "payment reminder SMS Hindi",
    "client payment reminder India",
    "payment reminder message for freelancers",
  ],
  openGraph: {
    title: "Payment Reminder Messages — 10 Templates in Hindi & English",
    description:
      "10 copy-paste payment reminder templates in Hindi and English. Gentle to firm — for WhatsApp, email, or SMS. Never chase clients awkwardly again.",
    type: "article",
    publishedTime: "2026-04-25T00:00:00Z",
    authors: ["SellNSettle"],
  },
  alternates: {
    canonical:
      "https://sellnsettle.com/blog/payment-reminder-templates-hindi-english",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Payment Reminder Messages — 10 Templates in Hindi & English",
  description:
    "10 ready-to-use payment reminder templates in Hindi and English for Indian freelancers and small businesses. Covers due date, 3 days, 7 days, and final notice.",
  author: { "@type": "Organization", name: "SellNSettle" },
  publisher: {
    "@type": "Organization",
    name: "SellNSettle",
    url: "https://sellnsettle.com",
  },
  datePublished: "2026-04-25",
  inLanguage: ["hi", "en"],
  mainEntityOfPage:
    "https://sellnsettle.com/blog/payment-reminder-templates-hindi-english",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Post5Content />
    </>
  );
}
