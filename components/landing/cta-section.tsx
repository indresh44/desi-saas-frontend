import React from "react";
import { LandingButton } from "./ui/landing-button";

export function CTASection() {
  return (
    <section className="bg-teal-500 py-24 px-[5%] text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-4xl md:text-5xl leading-tight text-white mb-4">
          Your business diary,
          <br />
          upgraded.
        </h2>
        <p className="text-base text-white/75 mb-8 leading-relaxed">
          Start managing leads, invoices, and payments in one place — free, no
          card required.
        </p>
        <LandingButton
          variant="white"
          size="lg"
          href="/register"
          icon="→"
        >
          Start for free — no card needed
        </LandingButton>
        <p className="mt-4 text-sm text-white/55">
          Already have an account?{" "}
          <a href="/login" className="text-white underline">
            Sign in
          </a>
        </p>
      </div>
    </section>
  );
}
