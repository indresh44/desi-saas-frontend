import React from "react";
import { LandingButton } from "./ui/landing-button";
import { LandingBadge } from "./ui/landing-badge";

interface HeroSectionProps {
  isScrolled: boolean;
}

export function HeroSection({ isScrolled }: HeroSectionProps) {
  return (
    <>
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-[5%] h-15 flex items-center justify-between bg-white/93 backdrop-blur-sm border-b border-zinc-200 transition-shadow ${isScrolled ? "shadow-md" : ""}`}
      >
        <a href="#" className="flex items-center gap-2 no-underline">
          <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
            <svg
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 fill-white"
            >
              <path d="M3 4C3 3.45 3.45 3 4 3H14C14.55 3 15 3.45 15 4V6C15 6.55 14.55 7 14 7H4C3.45 7 3 6.55 3 6V4Z" />
              <path d="M3 9C3 8.45 3.45 8 4 8H10C10.55 8 11 8.45 11 9V10C11 10.55 10.55 11 10 11H4C3.45 11 3 10.55 3 10V9Z" />
              <circle cx="13.5" cy="13.5" r="2.5" />
            </svg>
          </div>
          <span className="font-serif text-lg text-zinc-900 tracking-tight">
            SellNSettle
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-7 list-none">
          <li>
            <a
              href="#features"
              className="text-xs font-medium text-zinc-600 hover:text-teal-500 no-underline transition-colors"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="#compare"
              className="text-xs font-medium text-zinc-600 hover:text-teal-500 no-underline transition-colors"
            >
              Why us
            </a>
          </li>
          <li>
            <a
              href="#how"
              className="text-xs font-medium text-zinc-600 hover:text-teal-500 no-underline transition-colors"
            >
              How it works
            </a>
          </li>
          <li>
            <a
              href="/login"
              className="text-xs font-medium text-zinc-600 hover:text-teal-500 no-underline transition-colors"
            >
              Sign in
            </a>
          </li>
          <li>
            <LandingButton
              variant="primary"
              size="sm"
              href="/register"
              className="!text-white"
            >
              Start free
            </LandingButton>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen pt-15 flex items-center bg-white">
        <div className="max-w-4xl mx-auto px-[5%] grid grid-cols-1 md:grid-cols-2 gap-20 items-center w-full py-20">
          {/* Hero Copy */}
          <div>
            <LandingBadge>Built for Indian MSMEs</LandingBadge>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight text-zinc-900 mb-4 mt-6 opacity-0 animate-fadeUp [animation-delay:200ms]">
              From first enquiry
              <br />
              to <em className="italic text-teal-500">final payment</em>
            </h1>

            <p className="text-base text-zinc-600 leading-relaxed max-w-sm mb-8 opacity-0 animate-fadeUp [animation-delay:300ms]">
              Stop juggling WhatsApp, a diary, and billing apps. SellNSettle
              tracks every lead, quote, invoice, and payment in one place —
              made for how Indian small businesses actually work.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 mb-6 opacity-0 animate-fadeUp [animation-delay:400ms] flex-wrap">
              <LandingButton
                variant="primary"
                size="lg"
                href="/register"
                icon="→"
              >
                Start for free
              </LandingButton>
              <LandingButton variant="ghost" size="lg" href="#how">
                See how it works
              </LandingButton>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-xs text-zinc-500 opacity-0 animate-fadeUp [animation-delay:500ms] flex-wrap">
              <span>✓ No credit card needed</span>
              <span className="hidden sm:inline text-zinc-300">·</span>
              <span>✓ Setup in 60 seconds</span>
              <span className="hidden sm:inline text-zinc-300">·</span>
              <span>✓ Works on mobile</span>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="flex justify-center opacity-0 animate-fadeUp [animation-delay:300ms]">
            <div className="relative">
              <div className="w-64 bg-zinc-900 rounded-3xl p-2.5 shadow-2xl">
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-6 bg-zinc-900 rounded-b-4 z-10"></div>
                <div className="w-full h-135 bg-zinc-100 rounded-3xl overflow-hidden flex flex-col">
                  {/* Topbar */}
                  <div className="bg-white border-b border-zinc-200 px-3.5 py-2.5 flex items-center justify-between flex-shrink-0">
                    <div>
                      <p className="text-xs font-bold text-zinc-900">
                        Dashboard
                      </p>
                      <p className="text-2xs text-zinc-500">Welcome back</p>
                    </div>
                    <button className="text-2xs font-semibold text-zinc-600 border border-zinc-200 rounded px-1.5 py-0.5">
                      Logout
                    </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto px-2.5 py-3.5 space-y-2">
                    {/* Stats */}
                    <div className="space-y-1">
                      <div className="bg-white border border-zinc-200 rounded-lg p-2.5">
                        <p className="text-2xs font-semibold uppercase text-zinc-600 mb-1">
                          This Month
                        </p>
                        <p className="text-lg font-bold text-zinc-900">₹4.2L</p>
                        <p className="text-2xs text-zinc-500 mt-0.5">
                          +8% from last month
                        </p>
                      </div>
                      <div className="bg-white border border-zinc-200 rounded-lg p-2.5">
                        <p className="text-2xs font-semibold uppercase text-zinc-600 mb-1">
                          Active Leads
                        </p>
                        <p className="text-lg font-bold text-zinc-900">12</p>
                        <p className="text-2xs text-zinc-500 mt-0.5">
                          5 due today
                        </p>
                      </div>
                    </div>

                    {/* Overdue Section */}
                    <div>
                      <p className="text-xs font-bold text-zinc-900 mb-1">
                        Overdue
                      </p>
                      <div className="bg-white border border-zinc-200 rounded-lg p-2.5">
                        <div className="flex justify-between mb-1">
                          <p className="text-xs font-bold text-zinc-900">
                            ABC Corp
                          </p>
                          <p className="text-xs font-bold text-red-600">₹2.5L</p>
                        </div>
                        <p className="text-2xs text-zinc-600 mb-1.5">INV-001</p>
                        <p className="text-2xs text-zinc-500 mb-1.5">
                          28 days overdue
                        </p>
                        <div className="flex gap-1">
                          <button className="text-2xs font-semibold px-2 py-1 border border-zinc-200 rounded text-zinc-700 bg-white">
                            Call
                          </button>
                          <button className="text-2xs font-semibold px-2 py-1 border border-teal-500 rounded text-teal-600 bg-white hover:bg-teal-50">
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Follow-ups */}
                    <div>
                      <p className="text-xs font-bold text-zinc-900 mb-1">
                        Follow-ups
                      </p>
                      <div className="bg-white border border-zinc-200 rounded-lg p-2.5">
                        <div className="flex justify-between mb-1">
                          <p className="text-xs font-semibold text-zinc-800">
                            Raj - XYZ Ltd
                          </p>
                          <p className="text-2xs text-zinc-500">2:30 PM</p>
                        </div>
                        <p className="text-2xs text-zinc-700 mb-1.5">
                          Follow up on quotation
                        </p>
                        <button className="text-2xs font-semibold px-2 py-1 border border-zinc-200 rounded text-zinc-700 bg-white">
                          ✓ Mark Done
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Pills */}
              <div className="absolute top-15 -right-20 bg-white rounded-2xl p-2 shadow-lg border border-zinc-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap animate-bounce text-green-600">
                ✓ Payment received
              </div>
              <div className="absolute bottom-25 -left-20 bg-white rounded-2xl p-2 shadow-lg border border-zinc-200 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap animate-bounce text-teal-600">
                📅 2 new leads
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
