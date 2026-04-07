import type { Metadata } from "next";
import Post7Content from "./post7-content";

export const metadata: Metadata = {
  title: "WhatsApp Pe Invoice Kaise Bhejein — Professional Tarike Se",
  description:
    "Sirf amount type karke WhatsApp pe bhejne se invoice nahi banta. Seekho PDF invoice banao aur professional tarike se share karo — templates aur tips ke saath.",
  keywords: [
    "WhatsApp pe invoice kaise bhejein",
    "WhatsApp invoice share",
    "invoice PDF WhatsApp",
    "professional invoice kaise bhejein",
    "WhatsApp par bill kaise bhejein",
    "invoice bhejne ka tarika India",
  ],
  openGraph: {
    title: "WhatsApp Pe Invoice Kaise Bhejein — Professional Tarike Se",
    description:
      "Sirf amount type karna invoice nahi hai. Learn how to create a PDF invoice and share it professionally on WhatsApp with ready-made message templates.",
    type: "article",
    publishedTime: "2026-04-22T00:00:00Z",
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
      "https://sellnsettle.com/blog/whatsapp-invoice-bhejne-ka-tarika",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  headline: "WhatsApp Pe Invoice Kaise Bhejein — Professional Tarike Se",
  description:
    "Step-by-step guide on creating a professional PDF invoice and sharing it on WhatsApp — with message templates in Hindi and English.",
  author: { "@type": "Organization", name: "SellNSettle" },
  publisher: {
    "@type": "Organization",
    name: "SellNSettle",
    url: "https://sellnsettle.com",
  },
  datePublished: "2026-04-22",
  inLanguage: ["hi", "en"],
  step: [
    { "@type": "HowToStep", text: "Stop sending plain WhatsApp text as an invoice" },
    { "@type": "HowToStep", text: "Create a professional PDF invoice with all required fields" },
    { "@type": "HowToStep", text: "Send the PDF file (not a screenshot) with a proper message" },
    { "@type": "HowToStep", text: "Include payment details on the invoice" },
    { "@type": "HowToStep", text: "Set a follow-up after sharing to make sure they saw it" },
  ],
  mainEntityOfPage:
    "https://sellnsettle.com/blog/whatsapp-invoice-bhejne-ka-tarika",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Post7Content />
    </>
  );
}
