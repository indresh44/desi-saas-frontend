import type { Metadata } from "next";
import Post3Content from "./post3-content";

export const metadata: Metadata = {
  title: "Follow-up Kaise Karein Taaki Lead Miss Na Ho",
  description:
    "\"Kal call karunga\" — yeh kal kabhi nahi aata. Practical follow-up tips for interior designers, photographers, and freelancers in India. Ready-made scripts in Hindi and English.",
  keywords: [
    "follow up kaise karein",
    "client follow up tips Hindi",
    "lead follow up interior designer",
    "follow up scripts Hindi",
    "client management tips India",
    "lead miss hone se kaise bachayein",
  ],
  openGraph: {
    title: "Follow-up Kaise Karein Taaki Lead Miss Na Ho",
    description:
      "Practical follow-up schedule, 5 ready-made scripts, and tips for Indian service businesses. Available in Hindi and English.",
    type: "article",
    publishedTime: "2026-04-18T00:00:00Z",
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
      "https://sellnsettle.com/blog/follow-up-kaise-karein-lead-miss-na-ho",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Follow-up Kaise Karein Taaki Lead Miss Na Ho",
  description:
    "Practical follow-up tips with ready-made scripts in Hindi and English for Indian small businesses.",
  author: { "@type": "Organization", name: "SellNSettle" },
  publisher: {
    "@type": "Organization",
    name: "SellNSettle",
    url: "https://sellnsettle.com",
  },
  datePublished: "2026-04-18",
  inLanguage: ["hi", "en"],
  mainEntityOfPage:
    "https://sellnsettle.com/blog/follow-up-kaise-karein-lead-miss-na-ho",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Post3Content />
    </>
  );
}