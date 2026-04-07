import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Tips for Indian Small Businesses",
  description:
    "Practical tips on invoicing, client follow-ups, payment collection, and business management for interior designers, photographers, coaches, and freelancers in India.",
  alternates: {
    canonical: "https://sellnsettle.com/blog",
  },
};

// ── Blog posts data (move to CMS or MDX later) ──
const posts = [
  {
    slug: "interior-design-client-management-tips",
    title: "Interior Design Client Management: 7 Tips That Actually Work",
    excerpt: "Most interior designers lose clients not because of skill, but because of poor management. Here are 7 practical tips.",
    date: "Apr 10, 2026",
    tag: "Business Tips",
  },
  {
    slug: "how-to-send-professional-invoice-interior-designer",
    title: "How to Send a Professional Invoice as an Interior Designer (Free GST Format)",
    excerpt: "Handwritten bills hurt your business. Here's exactly what a professional interior design invoice needs — with free templates.",
    date: "Apr 14, 2026",
    tag: "Invoicing",
  },
  {
    slug: "follow-up-kaise-karein-lead-miss-na-ho",
    title: "Follow-up Kaise Karein Taaki Lead Miss Na Ho",
    excerpt: "\"Kal call karunga\" — yeh kal kabhi nahi aata. Here's the 48-hour rule and ready-made follow-up scripts in Hindi.",
    date: "Apr 18, 2026",
    tag: "Lead Management",
  },
  {
    slug: "ai-crm-kya-hai-small-business-hindi",
    title: "AI CRM Kya Hai? Small Business Ke Liye Simple Explanation",
    excerpt: "CRM sunke darr mat jaao. Simple Hindi mein samjho — AI CRM kya karta hai aur aapko kyun chahiye.",
    date: "Apr 22, 2026",
    tag: "AI & Tech",
  },
  {
    slug: "payment-reminder-templates-hindi-english",
    title: "Payment Reminder Messages — 10 Templates in Hindi & English",
    excerpt: "Payment maangna awkward lagta hai? Use these ready-made templates — polite, professional, and effective.",
    date: "Apr 26, 2026",
    tag: "Payments",
  },
  {
    slug: "gst-invoice-format-interior-designer-free-template",
    title: "GST Invoice Format for Interior Designers — Free Template Download",
    excerpt: "SAC codes, CGST/SGST breakdown, required fields — everything you need for GST-compliant interior design invoices.",
    date: "Apr 30, 2026",
    tag: "Invoicing",
  },
  {
    slug: "whatsapp-invoice-bhejne-ka-tarika",
    title: "WhatsApp Pe Invoice Kaise Bhejein — Professional Tarike Se",
    excerpt: "WhatsApp pe amount type karke bhejte ho? Yeh galat hai. Yahan seekho professional tarika.",
    date: "May 4, 2026",
    tag: "WhatsApp",
  },
  {
    slug: "freelancer-payment-collection-tips-india",
    title: "Freelancer Payment Collection Tips — Never Chase Clients Again",
    excerpt: "Set expectations, send invoices immediately, automate reminders. 7 practical tips for Indian freelancers.",
    date: "May 8, 2026",
    tag: "Payments",
  },
];

export default function BlogPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-extrabold text-zinc-900 mb-4 tracking-tight font-[var(--font-plus-jakarta)]">
        Blog
      </h1>
      <p className="text-lg text-zinc-500 mb-12">
        Practical tips for running a small business in India — invoicing,
        client management, follow-ups, and more.
      </p>

      <div className="space-y-8">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block group"
          >
            <article className="border border-zinc-200 rounded-xl p-6 hover:border-zinc-400 hover:shadow-sm transition-all">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                  {post.tag}
                </span>
                <span className="text-xs text-zinc-400">{post.date}</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 group-hover:text-teal-700 transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {post.excerpt}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </main>
  );
}