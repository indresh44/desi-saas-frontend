import type { Metadata } from "next";
import Post8Content from "./post8-content";

export const metadata: Metadata = {
  title: "Freelancer Payment Collection Tips India — Never Chase Clients Again",
  description:
    "Stop chasing clients for money. 7 practical tips for Indian freelancers to set clear payment terms, send invoices fast, follow up without awkwardness, and get paid on time.",
  keywords: [
    "freelancer payment collection India",
    "how to collect payment from clients",
    "freelancer invoice tips India",
    "payment reminder freelancer",
    "client payment tips India",
    "freelancer paisa kaise maangein",
  ],
  openGraph: {
    title: "Freelancer Payment Collection Tips India — Never Chase Clients Again",
    description:
      "7 practical tips for Indian freelancers to collect payments on time — without awkward conversations or endless follow-ups.",
    type: "article",
    publishedTime: "2026-04-25T00:00:00Z",
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
      "https://sellnsettle.com/blog/freelancer-payment-collection-tips-india",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Collect Payments as a Freelancer in India",
  description:
    "7 practical tips for Indian freelancers to set clear payment expectations, invoice fast, follow up without awkwardness, and stop chasing clients.",
  author: { "@type": "Organization", name: "SellNSettle" },
  publisher: {
    "@type": "Organization",
    name: "SellNSettle",
    url: "https://sellnsettle.com",
  },
  datePublished: "2026-04-25",
  mainEntityOfPage:
    "https://sellnsettle.com/blog/freelancer-payment-collection-tips-india",
  step: [
    { "@type": "HowToStep", name: "Set payment expectations before the project starts" },
    { "@type": "HowToStep", name: "Send invoices immediately after delivery" },
    { "@type": "HowToStep", name: "Offer multiple payment methods" },
    { "@type": "HowToStep", name: "Use milestone billing for large projects" },
    { "@type": "HowToStep", name: "Send payment reminders professionally" },
    { "@type": "HowToStep", name: "Handle clients who ghost on payment" },
    { "@type": "HowToStep", name: "Track all outstanding amounts" },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Post8Content />
    </>
  );
}
