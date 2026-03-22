import { Metadata } from "next";

/**
 * Generate consistent metadata for landing page and future pages
 * Supports landing, blog posts, and other content pages
 */
export function generateMetadata({
  title,
  description,
  ogImage,
  canonical,
  type = "website",
}: {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
  type?: "website" | "article" | "blog";
}): Metadata {
  const fullTitle = title.includes("SellNSettle")
    ? title
    : `${title} — SellNSettle`;

  return {
    title: fullTitle,
    description,
    keywords: [
      "CRM",
      "MSME",
      "invoicing",
      "lead tracking",
      "WhatsApp",
      "billing",
      "GST",
      "sales management",
    ],
    openGraph: {
      type: type as "website" | "article",
      url: canonical || "https://sellnsettle.com",
      title: fullTitle,
      description,
      siteName: "SellNSettle",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(ogImage && { image: ogImage }),
    },
    robots: "index, follow",
    ...(canonical && {
      alternates: {
        canonical,
      },
    }),
  };
}

/**
 * Default landing page metadata
 */
export const landingMetadata: Metadata = generateMetadata({
  title: "SellNSettle — From First Enquiry to Final Payment",
  description:
    "Stop juggling WhatsApp, a diary, and billing apps. SellNSettle tracks every lead, quote, invoice, and payment in one place — made for how Indian small businesses actually work.",
  canonical: "https://sellnsettle.com",
  type: "website",
});

/**
 * Generate blog post metadata
 * For future blog integration
 */
export function generateBlogMetadata({
  title,
  description,
  slug,
  ogImage,
  publishedDate,
  author = "SellNSettle",
}: {
  title: string;
  description: string;
  slug: string;
  ogImage?: string;
  publishedDate?: string;
  author?: string;
}): Metadata {
  const canonical = `https://sellnsettle.com/blog/${slug}`;

  const metadata = generateMetadata({
    title,
    description,
    ogImage,
    canonical,
    type: "article",
  });

  return {
    ...metadata,
    authors: [{ name: author }],
    ...(publishedDate && {
      publishedTime: publishedDate,
    }),
  };
}
