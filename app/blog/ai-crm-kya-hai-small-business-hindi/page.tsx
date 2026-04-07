import type { Metadata } from "next";
import Post4Content from "./post4-content";

export const metadata: Metadata = {
  title: "AI CRM Kya Hai? Small Business Ke Liye Simple Explanation",
  description:
    "AI CRM kya hota hai aur chhoti business ke liye kyun zaroori hai — simple Hindi mein samjhiye. Normal CRM vs AI CRM ka fark, real examples, aur free mein kaise shuru karein.",
  keywords: [
    "AI CRM kya hai",
    "AI CRM for small business Hindi",
    "CRM meaning in Hindi",
    "AI CRM vs normal CRM",
    "small business CRM India",
    "chat based CRM Hindi",
    "CRM for freelancers India",
  ],
  openGraph: {
    title: "AI CRM Kya Hai? Small Business Ke Liye Simple Explanation",
    description:
      "AI CRM kya hota hai, normal CRM se kaise alag hai, aur chhoti business ke liye kyun perfect hai — Hindi aur English dono mein.",
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
      "https://sellnsettle.com/blog/ai-crm-kya-hai-small-business-hindi",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "AI CRM Kya Hai? Small Business Ke Liye Simple Explanation",
  description:
    "Simple explanation of AI CRM for small businesses in India. Covers what CRM means, how AI CRM differs from traditional CRM, real use cases, pricing, and signs you need one.",
  author: { "@type": "Organization", name: "SellNSettle" },
  publisher: {
    "@type": "Organization",
    name: "SellNSettle",
    url: "https://sellnsettle.com",
  },
  datePublished: "2026-04-22",
  inLanguage: ["hi", "en"],
  mainEntityOfPage:
    "https://sellnsettle.com/blog/ai-crm-kya-hai-small-business-hindi",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Post4Content />
    </>
  );
}
