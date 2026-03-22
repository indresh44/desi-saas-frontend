import React from "react";

export function FooterSection() {
  return (
    <footer className="bg-zinc-900 px-[5%] py-11">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5 flex-wrap">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 no-underline">
          <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
            <svg
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5 fill-white"
            >
              <path d="M3 4C3 3.45 3.45 3 4 3H14C14.55 3 15 3.45 15 4V6C15 6.55 14.55 7 14 7H4C3.45 7 3 6.55 3 6V4Z" />
              <path d="M3 9C3 8.45 3.45 8 4 8H10C10.55 8 11 8.45 11 9V10C11 10.55 10.55 11 10 11H4C3.45 11 3 10.55 3 10V9Z" />
              <circle cx="13.5" cy="13.5" r="2.5" />
            </svg>
          </div>
          <span className="font-serif text-lg text-white tracking-tight">
            SellNSettle
          </span>
        </a>

        {/* Links */}
        <ul className="flex gap-6 list-none">
          <li>
            <a
              href="#features"
              className="text-xs text-white/40 hover:text-white/75 no-underline transition-colors"
            >
              Features
            </a>
          </li>
          <li>
            <a
              href="mailto:hello@sellnsettle.com"
              className="text-xs text-white/40 hover:text-white/75 no-underline transition-colors"
            >
              Contact
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-xs text-white/40 hover:text-white/75 no-underline transition-colors"
            >
              Privacy
            </a>
          </li>
          <li>
            <a
              href="#"
              className="text-xs text-white/40 hover:text-white/75 no-underline transition-colors"
            >
              Terms
            </a>
          </li>
        </ul>

        {/* Copyright */}
        <p className="text-xs text-white/25">
          © 2025 SellNSettle · Made for Indian MSMEs
        </p>
      </div>
    </footer>
  );
}
