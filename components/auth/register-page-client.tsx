"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth/auth-context";
import sellNSettleIcon from "@/app/sellnsettle-icon.png";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    isWhatsapp: z.boolean(),
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

const inputClassName =
  "mt-1 w-full rounded-md border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

export default function RegisterPageClient() {
  const { register: authRegister } = useAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      isWhatsapp: true,
    },
  });

  const isWhatsapp = watch("isWhatsapp");

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
        phone: values.phone,
        country_code: "+91",
        is_whatsapp: values.isWhatsapp,
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-2 text-2xl font-black text-[#E8862E]">
            <Image src={sellNSettleIcon} alt="SellNSettle" width={28} height={28} />
            SellNSettle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Create your account</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-primary">Your name</label>
              <input
                type="text"
                {...register("name")}
                className={inputClassName}
                placeholder="Ramesh Tiwari"
                autoComplete="name"
              />
              {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name.message}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium text-primary">Email</label>
              <input
                type="email"
                {...register("email")}
                className={inputClassName}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email ? <p className="mt-1 text-xs text-destructive">{errors.email.message}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium text-primary">Phone number</label>
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full rounded-r-md border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="9876543210"
                  autoComplete="tel-national"
                  maxLength={10}
                />
              </div>
              {errors.phone ? <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p> : null}
              <label className="mt-2 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWhatsapp}
                  onChange={(e) => setValue("isWhatsapp", e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-xs text-muted-foreground">This number is on WhatsApp</span>
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-primary">Password</label>
              <input
                type="password"
                {...register("password")}
                className={inputClassName}
                placeholder="Min 8 characters, letter + number"
                autoComplete="new-password"
              />
              {errors.password ? <p className="mt-1 text-xs text-destructive">{errors.password.message}</p> : null}
            </div>

            <div>
              <label className="text-sm font-medium text-primary">Confirm password</label>
              <input
                type="password"
                {...register("confirmPassword")}
                className={inputClassName}
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-xs text-destructive">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <div className="mt-4 border-t pt-4">
              <p className="mb-3 text-xs text-muted-foreground">Tell us about your business</p>
            </div>

            <div>
              <label className="text-sm font-medium text-primary">Business name</label>
              <input
                type="text"
                {...register("businessName")}
                className={inputClassName}
                placeholder="Tiwari Interiors"
              />
              {errors.businessName ? (
                <p className="mt-1 text-xs text-destructive">{errors.businessName.message}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-primary">City</label>
              <input
                type="text"
                {...register("city")}
                className={inputClassName}
                placeholder="Bhopal"
              />
              {errors.city ? <p className="mt-1 text-xs text-destructive">{errors.city.message}</p> : null}
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
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
