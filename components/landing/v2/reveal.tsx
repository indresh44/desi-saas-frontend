"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* Scroll-reveal wrapper — mirrors the mockup's `.rv` → `.in` IntersectionObserver.
   Renders the section's inner `.wrap` and fades it up on first view. */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "header";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Component = Tag as "div";
  return (
    <Component ref={ref} className={`wrap rv ${className}`.trim()}>
      {children}
    </Component>
  );
}
