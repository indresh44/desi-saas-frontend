"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth/auth-context";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Must contain at least one letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    businessName: z.string().min(2, "Business name must be at least 2 characters"),
    city: z.string().min(2, "City is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPageClient() {
  const { register: authRegister } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterForm) => {
    setIsSubmitting(true);
    setError("");

    try {
      await authRegister({
        name: values.name,
        email: values.email,
        password: values.password,
        business_name: values.businessName,
        city: values.city,
      });
    } catch (submitError) {
      if (
        typeof submitError === "object" &&
        submitError !== null &&
        "message" in submitError &&
        typeof submitError.message === "string"
      ) {
        setError(submitError.message);
      } else {
        setError("Registration failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">SellnSettle</h1>
          <p className="mt-1 text-sm text-zinc-500">Create your account</p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Your name</label>
              <input
                type="text"
                {...register("name")}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/20"
                placeholder="Ramesh Tiwari"
                autoComplete="name"
              />
              {errors.name ? <p className="mt-1 text-xs text-red-500">{errors.name.message}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                {...register("email")}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/20"
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email ? <p className="mt-1 text-xs text-red-500">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                {...register("password")}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/20"
                placeholder="Min 8 characters, letter + number"
                autoComplete="new-password"
              />
              {errors.password ? <p className="mt-1 text-xs text-red-500">{errors.password.message}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium">Confirm password</label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/20"
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="mb-3 text-xs text-zinc-500">Tell us about your business</p>
            </div>

            <div>
              <label className="text-sm font-medium">Business name</label>
              <input
                type="text"
                {...register("businessName")}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/20"
                placeholder="Tiwari Interiors"
              />
              {errors.businessName ? (
                <p className="mt-1 text-xs text-red-500">{errors.businessName.message}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium">City</label>
              <input
                type="text"
                {...register("city")}
                className="mt-1 w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/20"
                placeholder="Bhopal"
              />
              {errors.city ? <p className="mt-1 text-xs text-red-500">{errors.city.message}</p> : null}
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
