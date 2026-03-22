import React from "react";
import { SectionHeader } from "./ui/section-header";

export function ProblemSection() {
  return (
    <section className="bg-zinc-900 py-24 px-[5%]">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        {/* Left: Problem Statement */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">
            The problem
          </p>
          <h2 className="font-serif text-3xl md:text-4xl leading-tight text-white mb-4">
            Running your business on{" "}
            <em className="italic text-cyan-300">five different apps</em>
          </h2>
          <p className="text-base text-zinc-300 leading-relaxed mb-8">
            Most small business owners lose deals not because they're bad at
            selling — but because they lose track. An enquiry slips. An invoice
            goes unsent for two weeks. A payment reminder never happens.
          </p>

          {/* Stats */}
          <div className="flex flex-col md:flex-row gap-10">
            <div>
              <p className="font-serif text-3xl text-teal-400 leading-none mb-1">
                47%
              </p>
              <p className="text-xs text-zinc-400 leading-snug max-w-24">
                of deals lost due to poor follow-up
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl text-teal-400 leading-none mb-1">
                ₹2L+
              </p>
              <p className="text-xs text-zinc-400 leading-snug max-w-24">
                average overdue per business
              </p>
            </div>
          </div>
        </div>

        {/* Right: Problem Tools */}
        <div className="flex flex-col gap-2">
          {[
            {
              icon: "💬",
              name: "WhatsApp",
              pain: "No organized history, deals forgotten",
            },
            {
              icon: "📝",
              name: "Diary/Notebook",
              pain: "Handwritten notes get lost, nothing syncs",
            },
            {
              icon: "🧾",
              name: "Manual Billing",
              pain: "Excel sheets, no GST, invoices sent late",
            },
            {
              icon: "🏦",
              name: "Bank Statements",
              pain: "Payments come in, you lose track of who paid",
            },
          ].map((tool, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 hover:bg-white/10 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 text-lg">
                {tool.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{tool.name}</p>
                <p className="text-xs text-zinc-400 leading-snug">
                  {tool.pain}
                </p>
              </div>
              <div className="text-red-400 text-sm font-bold ml-auto flex-shrink-0">
                ✕
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
