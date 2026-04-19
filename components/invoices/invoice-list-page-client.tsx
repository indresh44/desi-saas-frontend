"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InvoiceListView } from "@/components/invoices/invoice-list-view";
import { TemplatesTab } from "@/components/invoices/templates/templates-tab";

type Tab = "invoices" | "templates";

export default function InvoiceListPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const customerId = searchParams.get("customer_id") ?? undefined;
  const customerName = searchParams.get("customer_name") ?? "Customer";
  const initialTab: Tab = searchParams.get("tab") === "templates" ? "templates" : "invoices";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const title = useMemo(() => {
    if (!customerId) return "Invoices";
    return `${customerName}'s Invoices`;
  }, [customerId, customerName]);

  // Customer-filtered views don't show the templates tab (templates aren't per-customer)
  const showTabs = !customerId;

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

      {showTabs ? (
        <div className="inline-flex rounded-lg border bg-muted p-1">
          <button
            type="button"
            onClick={() => setActiveTab("invoices")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "invoices"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={activeTab === "invoices"}
          >
            Invoices
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === "templates"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-pressed={activeTab === "templates"}
          >
            Templates
          </button>
        </div>
      ) : null}

      {activeTab === "invoices" || customerId ? (
        <InvoiceListView
          customerId={customerId}
          showCustomerColumn={!customerId}
          showFilters={true}
          showSummaryBar={true}
        />
      ) : (
        <TemplatesTab />
      )}
    </section>
  );
}
