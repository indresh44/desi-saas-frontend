"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { requestPasswordReset } from "@/lib/api/auth";
import sellNSettleIcon from "@/app/sellnsettle-icon.png";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

type FormValues = z.infer<typeof schema>;

const inputClassName =
  "mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ForgotPasswordClient() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setError("");
    try {
      await requestPasswordReset(values.email);
      setSubmitted(true);
    } catch (err) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to send reset link. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
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
          <p className="mt-1 text-sm text-muted-foreground">
            Reset your password
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {submitted ? (
            <div className="space-y-3">
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                If that email matches an account, a reset link has been sent.
                Check your inbox — the link is valid for 30 minutes.
              </div>
              <p className="text-xs text-muted-foreground">
                Didn&apos;t get the email? Check your spam folder, then{" "}
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="font-medium text-primary hover:underline"
                >
                  try again
                </button>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the email you signed up with. We&apos;ll send a link to
                reset your password.
              </p>
              <div>
                <label className="text-sm font-medium text-primary">Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className={inputClassName}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email ? (
                  <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
                ) : null}
              </div>

              {error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
