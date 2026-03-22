import React from "react";
import { SectionHeader } from "./ui/section-header";

export function HowSection() {
  const steps = [
    {
      num: "1",
      title: "Set up your business",
      desc: "Add your name, logo, GSTIN, and bank/UPI details. 60 seconds. Your invoices look professional from day one.",
    },
    {
      num: "2",
      title: "Add your first lead",
      desc: 'Tap "+ New Lead", add customer details, and you\'re tracking. Log a note, schedule a follow-up, move stages — all on mobile.',
    },
    {
      num: "3",
      title: "Invoice & collect",
      desc: "When the deal closes, create an invoice in under a minute. Share on WhatsApp. Mark payment received. Done.",
    },
  ];

  return (
    <section id="how" className="bg-zinc-50 py-24 px-[5%]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <SectionHeader
            label="Getting started"
            title="Up and running in three steps"
            subtitle="No complex setup. No training required. If it needs a tutorial, the design has failed."
            centered
          />
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-7 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-teal-200 via-teal-500 to-teal-200 -z-10"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-teal-500 text-white flex items-center justify-center font-serif text-2xl mb-4 shadow-md relative z-10">
                {step.num}
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed max-w-48">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
