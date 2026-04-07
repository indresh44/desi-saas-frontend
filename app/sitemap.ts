import type { MetadataRoute } from "next";

// ── Static pages + blog posts ──
// Add new blog slugs here as you publish them

const BLOG_POSTS = [
  { slug: "interior-design-client-management-tips", date: "2026-04-10" },
  { slug: "how-to-send-professional-invoice-interior-designer", date: "2026-04-14" },
  { slug: "follow-up-kaise-karein-lead-miss-na-ho", date: "2026-04-18" },
  { slug: "ai-crm-kya-hai-small-business-hindi", date: "2026-04-22" },
  { slug: "payment-reminder-templates-hindi-english", date: "2026-04-26" },
  { slug: "gst-invoice-format-interior-designer-free-template", date: "2026-04-30" },
  { slug: "whatsapp-invoice-bhejne-ka-tarika", date: "2026-05-04" },
  { slug: "freelancer-payment-collection-tips-india", date: "2026-05-08" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sellnsettle.com";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages];
}