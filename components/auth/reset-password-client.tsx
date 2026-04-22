"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { confirmPasswordReset } from "@/lib/api/auth";
import sellNSettleIcon from "@/app/sellnsettle-icon.png";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const inputClassName =
  "mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!token) {
      setError(
        "This reset link is missing its token. Please request a new link from the forgot-password page."
      );
    }
  }, [token]);

  const onSubmit = async (values: FormValues) => {
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      await confirmPasswordReset(token, values.newPassword);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? String((err as { message: unknown }).message)
          : "Unable to reset password. Please request a new link.";
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
          <p className="mt-1 text-sm text-muted-foreground">Choose a new password</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          {success ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              Password updated. Redirecting to sign in...
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary">New password</label>
                <input
                  type="password"
                  {...register("newPassword")}
                  className={inputClassName}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  disabled={!token}
                />
                {errors.newPassword ? (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.newPassword.message}
                  </p>
                ) : null}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Must be 8+ characters with at least one letter and one number.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-primary">Confirm password</label>
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className={inputClassName}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  disabled={!token}
                />
                {errors.confirmPassword ? (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                ) : null}
              </div>

              {error ? (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting || !token}
                className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Updating..." : "Update password"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Need a new link?{" "}
          <Link href="/forgot-password" className="font-medium text-primary hover:underline">
            Request another
          </Link>
        </p>
      </div>
    </div>
  );
}
