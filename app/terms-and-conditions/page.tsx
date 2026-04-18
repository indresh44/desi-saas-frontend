import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Terms and Conditions for SellNSettle — the rules and guidelines for using our platform.",
  alternates: {
    canonical: "https://sellnsettle.com/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6]">
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <Link
          href="/"
          className="text-sm font-semibold text-[#e85d26] hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
      <iframe
        src="/legal/terms-and-conditions.html"
        className="flex-1 w-full border-none"
        title="Terms and Conditions"
      />
    </div>
  );
}
