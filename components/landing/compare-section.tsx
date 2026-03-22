import React from "react";
import { SectionHeader } from "./ui/section-header";

export function CompareSection() {
  const rows = [
    { feature: "Lead tracking & pipeline", sellnsettle: true, billing: false, crm: true },
    { feature: "GST invoice generation", sellnsettle: true, billing: true, crm: false },
    { feature: "Follow-up reminders", sellnsettle: true, billing: false, crm: true },
    { feature: "WhatsApp-native workflows", sellnsettle: true, billing: false, crm: false },
    { feature: "Quote → Invoice in one tap", sellnsettle: true, billing: "partial", crm: false },
    { feature: "Setup time", sellnsettle: "60 sec", billing: "~30 min", crm: "Days–weeks" },
    { feature: "Built for 1–5 person teams", sellnsettle: true, billing: true, crm: false },
    { feature: "Works well on mobile", sellnsettle: true, billing: "partial", crm: false },
  ];

  return (
    <section id="compare" className="bg-white py-24 px-[5%]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <SectionHeader
            label="Why SellNSettle"
            title="The only tool that covers the entire business cycle"
            subtitle="Billing apps start too late. Enterprise CRMs are too complex. SellNSettle fills the gap."
            centered
          />
        </div>

        {/* Comparison Table */}
        <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-zinc-900 grid grid-cols-4 text-white">
            <div className="px-4 py-3 text-left text-xs font-semibold text-zinc-300">
              Feature
            </div>
            <div className="px-4 py-3 text-center text-xs font-semibold bg-teal-600 text-white">
              SellNSettle
            </div>
            <div className="px-4 py-3 text-center text-xs font-semibold text-zinc-300">
              Billing Apps
            </div>
            <div className="px-4 py-3 text-center text-xs font-semibold text-zinc-300">
              Enterprise CRM
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, idx) => (
            <div key={idx} className="grid grid-cols-4 border-b border-zinc-100 hover:bg-teal-50 transition-colors last:border-b-0">
              <div className="px-4 py-3 text-xs font-medium text-zinc-900">
                {row.feature}
              </div>
              <div className="px-4 py-3 text-center text-xs font-semibold text-teal-600 bg-teal-50">
                {typeof row.sellnsettle === "boolean" ? (
                  row.sellnsettle ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )
                ) : (
                  row.sellnsettle
                )}
              </div>
              <div className="px-4 py-3 text-center text-xs text-zinc-600">
                {typeof row.billing === "boolean" ? (
                  row.billing ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )
                ) : (
                  row.billing
                )}
              </div>
              <div className="px-4 py-3 text-center text-xs text-zinc-600">
                {typeof row.crm === "boolean" ? (
                  row.crm ? (
                    <span className="text-green-600">✓</span>
                  ) : (
                    <span className="text-red-400">✗</span>
                  )
                ) : (
                  row.crm
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
