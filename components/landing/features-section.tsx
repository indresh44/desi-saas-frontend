import React from "react";
import { SectionHeader } from "./ui/section-header";

export function FeaturesSection() {
  const features = [
    {
      icon: "📊",
      name: "Lead Pipeline",
      desc: "Visual pipeline with 5 stages. Move leads with one tap. Full activity timeline per lead — calls, notes, stage changes.",
    },
    {
      icon: "👥",
      name: "Customer Profiles",
      desc: "Lifetime value, outstanding balance, all leads and invoices for every customer — in one place.",
    },
    {
      icon: "🧾",
      name: "GST Invoices",
      desc: "GST-compliant invoice PDFs with your branding, UPI details, and bank account. Share instantly via WhatsApp.",
    },
    {
      icon: "📦",
      name: "Item Catalog",
      desc: "Build your product/service library once. Typeahead auto-fills name, rate, unit, and GST% in every invoice.",
    },
    {
      icon: "🔔",
      name: "Follow-up Reminders",
      desc: "Schedule follow-ups with notes and due dates. Today's dashboard shows exactly who to call and when.",
    },
    {
      icon: "💬",
      name: "WhatsApp Integration",
      desc: "One-tap templates for payment reminders, meeting confirmations, and quote sharing — from your own number.",
    },
    {
      icon: "💰",
      name: "Payment Tracking",
      desc: "Record UPI, cash, or bank payments. Invoice status updates automatically. Outstanding tracked per customer.",
    },
    {
      icon: "📅",
      name: "Meetings",
      desc: "Schedule meetings tied to leads. Scheduled, completed, no-show — all in a clean date-grouped list.",
    },
    {
      icon: "📱",
      name: "Mobile-first + Dark Mode",
      desc: "Designed for a 6-inch phone screen. Light and dark mode. Fast on slow connections.",
    },
  ];

  return (
    <section id="features" className="bg-zinc-50 py-24 px-[5%]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
          <div>
            <SectionHeader
              label="What's inside"
              title="Everything a growing business needs"
            />
          </div>
          <div>
            <p className="text-base text-zinc-600 leading-relaxed">
              Not enterprise bloat. Just the features that matter for running
              10–30 active deals from your phone, every day.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white border border-zinc-200 rounded-2xl p-5 hover:border-teal-200 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-2xl mb-3">
                {feature.icon}
              </div>
              <h3 className="text-sm font-bold text-zinc-900 mb-2">
                {feature.name}
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
