import type { Metadata } from "next";
import Post6Content from "./post6-content";

export const metadata: Metadata = {
  title: "GST Invoice Format for Interior Designers — Free Template",
  description:
    "Complete GST invoice format for interior designers in India. SAC code, 18% GST rate, mandatory fields, common mistakes, and a sample invoice — all in one place.",
  keywords: [
    "GST invoice format interior designer",
    "interior design bill format",
    "GST invoice interior design India",
    "SAC code interior design",
    "GST invoice mandatory fields",
    "interior designer invoice template India",
    "18 percent GST interior design",
  ],
  openGraph: {
    title: "GST Invoice Format for Interior Designers — Free Template",
    description:
      "SAC code, GST rate, mandatory fields, common mistakes, and a full sample invoice for interior designers in India.",
    type: "article",
    publishedTime: "2026-04-28T00:00:00Z",
    authors: ["SellNSettle"],
  },
  alternates: {
    canonical:
      "https://sellnsettle.com/blog/gst-invoice-format-interior-designer-free-template",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "GST Invoice Format for Interior Designers — Free Template",
  description:
    "Complete guide to GST invoicing for interior designers in India — SAC code 998533, 18% rate, mandatory fields, sample invoice, and common mistakes to avoid.",
  author: { "@type": "Organization", name: "SellNSettle" },
  publisher: {
    "@type": "Organization",
    name: "SellNSettle",
    url: "https://sellnsettle.com",
  },
  datePublished: "2026-04-28",
  inLanguage: "en",
  mainEntityOfPage:
    "https://sellnsettle.com/blog/gst-invoice-format-interior-designer-free-template",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Post6Content />
    </>
  );
}
