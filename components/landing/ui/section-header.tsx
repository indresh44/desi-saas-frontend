import React from "react";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  label,
  title,
  subtitle,
  centered = false,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      {label && (
        <p className="text-xs font-bold uppercase tracking-wider text-teal-600 mb-2">
          {label}
        </p>
      )}
      <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-zinc-900 mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base text-zinc-600 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}
