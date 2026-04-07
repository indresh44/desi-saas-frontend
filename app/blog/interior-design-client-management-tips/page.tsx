import type { Metadata } from "next";
import Post1Content from "./post1-content";

export const metadata: Metadata = {
  title: "Interior Design Client Management: 7 Tips That Actually Work",
  description:
    "Most interior designers lose clients not because of skill, but poor management. 7 practical tips for tracking enquiries, sending professional invoices, and getting paid on time.",
  keywords: [
    "interior design client management",
    "interior designer CRM India",
    "client tracking interior design",
    "interior design business tips",
    "enquiry management interior designer",
  ],
  openGraph: {
    title: "Interior Design Client Management: 7 Tips That Actually Work",
    description:
      "7 practical tips for Indian interior designers to track enquiries, send professional invoices, and stop losing leads.",
    type: "article",
    publishedTime: "2026-04-10T00:00:00Z",
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
      "https://sellnsettle.com/blog/interior-design-client-management-tips",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Interior Design Client Management: 7 Tips That Actually Work",
  description:
    "Most interior designers lose clients not because of skill, but poor management. Practical tips for tracking enquiries, invoicing, and payments.",
  author: { "@type": "Organization", name: "SellNSettle" },
  publisher: {
    "@type": "Organization",
    name: "SellNSettle",
    url: "https://sellnsettle.com",
  },
  datePublished: "2026-04-10",
  mainEntityOfPage:
    "https://sellnsettle.com/blog/interior-design-client-management-tips",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Post1Content />
    </>
  );
}