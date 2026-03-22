import React from "react";
import { SectionHeader } from "./ui/section-header";

export function PipelineSection() {
  const steps = [
    { icon: "📥", name: "Enquiry", desc: "Lead comes in via WhatsApp, referral, or walk-in" },
    { icon: "💬", name: "Follow-up", desc: "Track calls, meetings, notes — full history" },
    { icon: "📋", name: "Quote", desc: "Send professional quotes with line items and GST" },
    { icon: "🧾", name: "Invoice", desc: "One tap: convert quote → GST invoice PDF" },
    { icon: "✅", name: "Payment", desc: "Record UPI, cash, bank — auto-updates status" },
  ];

  return (
    <section className="bg-white py-24 px-[5%] text-center">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          label="The complete journey"
          title="One app. The whole cycle."
          subtitle="Most tools start at the invoice. SellNSettle starts at the first enquiry and follows through till the payment lands."
          centered
          className="mb-16"
        />

        {/* Pipeline Flow */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-4 flex-wrap">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center gap-2">
                <div className="w-15 h-15 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center text-4xl hover:bg-teal-500 hover:border-teal-500 hover:shadow-lg hover:scale-110 transition-all">
                  {step.icon}
                </div>
                <p className="text-sm font-semibold text-zinc-900">{step.name}</p>
                <p className="text-xs text-zinc-600 max-w-28 leading-snug">
                  {step.desc}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className="text-2xl text-teal-500 opacity-60 md:pb-20">
                  →
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
