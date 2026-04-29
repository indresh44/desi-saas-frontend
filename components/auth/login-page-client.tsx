"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth/auth-context";
import sellNSettleIcon from "@/app/sellnsettle-icon.png";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

// `text-base md:text-sm` keeps inputs at 16px on mobile so iOS doesn't
// auto-zoom on focus; desktop stays at 14px. See mobile UX plan bucket 5.
const inputClassName =
  "mt-1 w-full rounded-md border bg-card px-3 py-2 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:text-sm";

export default function LoginPageClient() {
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginForm) => {
    setIsSubmitting(true);
    setError("");

    try {
      await login({ email: values.email, password: values.password });
    } catch (submitError) {
      if (
        typeof submitError === "object" &&
        submitError !== null &&
        "message" in submitError &&
        typeof submitError.message === "string"
      ) {
        setError(submitError.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-black text-[#E8862E]">
            <Image src={sellNSettleIcon} alt="SellNSettle" width={28} height={28} />
            SellNSettle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary">Email</label>
              <input
                type="email"
                inputMode="email"
                enterKeyHint="next"
                {...register("email")}
                className={inputClassName}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email ? (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-medium text-primary">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                enterKeyHint="go"
                {...register("password")}
                className={inputClassName}
                placeholder="Your password"
                autoComplete="current-password"
              />
              {errors.password ? (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
