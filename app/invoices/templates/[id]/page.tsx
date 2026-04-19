"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TemplateForm } from "@/components/invoices/templates/template-form";

export default function TemplateEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const isNew = id === "new";

  return (
    <section className="space-y-5">
      <div>
        <button
          type="button"
          onClick={() => router.push("/invoices?tab=templates")}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to templates
        </button>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {isNew ? "New template" : "Edit template"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Templates are reusable invoice line items. Prices save now and can be refreshed
          from the catalog when you create an invoice.
        </p>
      </div>

      <TemplateForm templateId={id} />
    </section>
  );
}
