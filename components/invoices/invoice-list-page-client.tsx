"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InvoiceListView } from "@/components/invoices/invoice-list-view";

export default function InvoiceListPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const customerId = searchParams.get("customer_id") ?? undefined;
  const customerName = searchParams.get("customer_name") ?? "Customer";

  const title = useMemo(() => {
    if (!customerId) {
      return "Invoices";
    }

    return `${customerName}'s Invoices`;
  }, [customerId, customerName]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">Manage all invoices and payments.</p>
      </div>

      {customerId ? (
        <div className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
          <span>Showing invoices for {customerName}</span>
          <button
            type="button"
            className="ml-auto text-xs font-medium text-primary hover:underline"
            onClick={() => router.push("/invoices")}
          >
            Clear filter
          </button>
        </div>
      ) : null}

      <InvoiceListView
        customerId={customerId}
        showCustomerColumn={!customerId}
        showFilters={true}
        showSummaryBar={true}
      />
    </section>
  );
}
