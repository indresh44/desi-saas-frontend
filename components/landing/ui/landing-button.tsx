import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        primary:
          "bg-teal-500 text-white hover:bg-teal-600 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        ghost:
          "bg-transparent text-zinc-700 border-1.5 border-zinc-200 hover:border-teal-500 hover:text-teal-500",
        white:
          "bg-white text-teal-700 hover:-translate-y-0.5 shadow-lg hover:shadow-xl font-bold",
      },
      size: {
        default: "px-6 py-3 text-sm",
        lg: "px-8 py-3.5 text-base",
        sm: "px-4 py-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

interface LandingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
}

export function LandingButton({
  variant,
  size,
  className,
  children,
  href,
  icon,
  ...props
}: LandingButtonProps) {
  if (href) {
    return (
      <a
        href={href}
        className={cn(buttonVariants({ variant, size }), className)}
      >
        {children}
        {icon && <span className="ml-2">{icon}</span>}
      </a>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {icon && <span className="ml-2">{icon}</span>}
    </button>
  );
}
