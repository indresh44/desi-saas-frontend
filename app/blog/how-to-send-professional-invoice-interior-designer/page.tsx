import type { Metadata } from "next";
import Post2Content from "./post2-content";

export const metadata: Metadata = {
  title: "How to Send a Professional Invoice as an Interior Designer (Free GST Format)",
  description:
    "Stop sending WhatsApp messages as bills. Learn what a professional interior design invoice must include, common mistakes to avoid, and get a free GST-compliant template.",
  keywords: [
    "interior design invoice format",
    "GST invoice interior designer",
    "interior design bill format",
    "professional invoice template India",
    "interior design billing",
    "SAC code interior design",
  ],
  openGraph: {
    title: "How to Send a Professional Invoice as an Interior Designer",
    description:
      "Free GST format included. What your invoice must have, 5 common mistakes, and how to create one in 30 seconds.",
    type: "article",
    publishedTime: "2026-04-14T00:00:00Z",
    authors: ["SellNSettle"],
    images: [
      {
        url: "https://sellnsettle.com/og-blog.png",
        width: 1200,
        height: 630,
        alt: "SellNSettle Blog",
      },
    ],
  },
  alternates: {
    canonical:
      "https://sellnsettle.com/blog/how-to-send-professional-invoice-interior-designer",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Send a Professional Invoice as an Interior Designer",
  description:
    "Step-by-step guide to creating a GST-compliant professional invoice for interior design services in India.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Include all 10 required fields",
      text: "Business name, GSTIN, SAC code, client details, invoice number, dates, itemized services, GST breakdown, total, and payment details.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Create the invoice",
      text: "Use a template or chat-based tool to generate the invoice with all line items and GST calculations.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Export as PDF and share on WhatsApp",
      text: "Generate a PDF and share the actual file (not a screenshot) on WhatsApp for a professional impression.",
    },
  ],
  author: { "@type": "Organization", name: "SellNSettle" },
  publisher: {
    "@type": "Organization",
    name: "SellNSettle",
    url: "https://sellnsettle.com",
  },
  datePublished: "2026-04-14",
  mainEntityOfPage:
    "https://sellnsettle.com/blog/how-to-send-professional-invoice-interior-designer",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Post2Content />
    </>
  );
}