"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, MessageCircle, Phone, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateLeadDialog } from "@/components/leads/create-lead-dialog";
import { LeadWhatsAppChatDrawer } from "@/components/whatsapp/lead-whatsapp-chat-drawer";
import { useLookupMaps } from "@/hooks/use-lookup-maps";
import { searchCustomers } from "@/lib/api/customers";
import { fetchLeads } from "@/lib/api/leads";
import { Customer } from "@/lib/types/customer";
import { Lead } from "@/lib/types/lead";
import { PipelineStage } from "@/lib/types/pipeline";

function formatRupees(value: string): string {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatShortDate(dateValue: string): string | null {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

function LeadCard({
  lead,
  stageMap,
  onOpenChat,
}: {
  lead: Lead;
  stageMap: Record<string, PipelineStage>;
  onOpenChat: (lead: Lead) => void;
}) {
  const serviceDate = lead.serviceDate ? formatShortDate(lead.serviceDate) : null;
  const addedDate = lead.createdAt ? formatShortDate(lead.createdAt) : null;
  const lookupStage = stageMap[lead.stageId];
  const stageName = lead.stageName ?? lookupStage?.name ?? "Unknown Stage";
  const stageColor = lead.stageColor ?? lookupStage?.color ?? "#e4e4e7";
  const customerName = lead.customerName ?? "Unknown Customer";
  const callHref = lead.customerPhone ? `tel:${lead.customerPhone}` : null;

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Top row: title + stage badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold leading-snug text-zinc-900">{lead.title}</p>
          <p className="mt-1 truncate text-xs text-zinc-500">{customerName}</p>
        </div>
        {stageName ? (
          <span
            className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium text-zinc-800"
            style={{ backgroundColor: stageColor }}
          >
            {stageName}
          </span>
        ) : null}
      </div>

      {/* Second row: source label + estimated value */}
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <p className="truncate text-sm text-zinc-500">{lead.source || "—"}</p>
        <p className="shrink-0 text-sm font-medium text-zinc-800">
          {lead.estimatedValue ? formatRupees(lead.estimatedValue) : "—"}
        </p>
      </div>

      {/* Metadata chips */}
      {(lead.source || serviceDate || addedDate) ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {lead.source ? (
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
              {lead.source}
            </span>
          ) : null}
          {serviceDate ? (
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
              Service: {serviceDate}
            </span>
          ) : null}
          {addedDate ? (
            <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
              Added {addedDate}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Actions row */}
      <div className="mt-auto flex items-center gap-2 border-t border-zinc-100 pt-3 mt-3">
        {callHref ? (
          <a href={callHref}>
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Call
            </Button>
          </a>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled
            title="Phone not available"
            className="gap-1.5"
          >
            <Phone className="h-3.5 w-3.5" />
            Call
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => onOpenChat(lead)}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </Button>

        <Link href={`/leads/${lead.id}`} className="ml-auto">
          <Button type="button" variant="ghost" size="sm" className="gap-1">
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="h-4 w-40 rounded bg-zinc-200" />
        <div className="h-5 w-20 rounded-full bg-zinc-200" />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="h-3 w-24 rounded bg-zinc-100" />
        <div className="h-3 w-16 rounded bg-zinc-100" />
      </div>
      <div className="mt-2 flex gap-1.5">
        <div className="h-5 w-16 rounded-md bg-zinc-100" />
        <div className="h-5 w-20 rounded-md bg-zinc-100" />
      </div>
      <div className="mt-3 flex gap-2 border-t border-zinc-100 pt-3">
        <div className="h-7 w-14 rounded-md bg-zinc-100" />
        <div className="h-7 w-24 rounded-md bg-zinc-100" />
        <div className="ml-auto h-7 w-24 rounded-md bg-zinc-100" />
      </div>
    </div>
  );
}

export function LeadsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { stageMap, isLoading: isLoadingStages } = useLookupMaps();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isCustomerSearchLoading, setIsCustomerSearchLoading] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState<string | null>(null);
  const blurTimeoutRef = useRef<number | null>(null);

  const customerIdFilter = searchParams.get("customer_id");
  const customerNameForFilter = searchParams.get("customer_name") ?? "this customer";

  useEffect(() => {
    if (customerIdFilter) {
      setCustomerSearch(customerNameForFilter);
    }
  }, [customerIdFilter, customerNameForFilter]);

  useEffect(() => {
    const trimmedCustomerSearch = customerSearch.trim();

    if (trimmedCustomerSearch.length < 2) {
      setCustomerResults([]);
      setCustomerSearchError(null);
      setIsCustomerSearchLoading(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsCustomerSearchLoading(true);
      setCustomerSearchError(null);

      try {
        const data = await searchCustomers(trimmedCustomerSearch);
        setCustomerResults(data);
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ) {
          setCustomerSearchError(error.message);
        } else {
          setCustomerSearchError("Unable to search customers.");
        }
        setCustomerResults([]);
      } finally {
        setIsCustomerSearchLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [customerSearch]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current !== null) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchLeads(
        customerIdFilter ? { customer_id: customerIdFilter } : undefined
      );
      setLeads(data);
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unable to fetch leads.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [customerIdFilter]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const clearCustomerFilter = useCallback((clearInput = true) => {
    if (clearInput) {
      setCustomerSearch("");
    }
    setCustomerResults([]);
    setCustomerSearchError(null);
    setIsCustomerSearchOpen(false);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("customer_id");
    nextParams.delete("customer_name");

    const nextQuery = nextParams.toString();
    router.push(nextQuery ? `/leads?${nextQuery}` : "/leads");
  }, [router, searchParams]);

  const handleCustomerSearchChange = (nextValue: string) => {
    setCustomerSearch(nextValue);

    if (customerIdFilter && nextValue !== customerNameForFilter) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("customer_id");
      nextParams.delete("customer_name");
      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `/leads?${nextQuery}` : "/leads");
    }
  };

  const handleCustomerFocus = () => {
    if (blurTimeoutRef.current !== null) {
      window.clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsCustomerSearchOpen(true);
  };

  const handleCustomerBlur = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setIsCustomerSearchOpen(false);
      blurTimeoutRef.current = null;
    }, 150);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setCustomerSearch(customer.name);
    setCustomerResults([]);
    setCustomerSearchError(null);
    setIsCustomerSearchOpen(false);
    router.push(
      `/leads?customer_id=${customer.id}&customer_name=${encodeURIComponent(customer.name)}`
    );
  };

  const stageOptions = useMemo(
    () =>
      Object.values(stageMap).sort((a, b) => {
        if (a.position === b.position) {
          return a.name.localeCompare(b.name);
        }
        return a.position - b.position;
      }),
    [stageMap]
  );

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesSearch =
        !q ||
        lead.title.toLowerCase().includes(q) ||
        (lead.source?.toLowerCase().includes(q) ?? false) ||
        (lead.customerName?.toLowerCase().includes(q) ?? false) ||
        (lead.customerPhone?.toLowerCase().includes(q) ?? false);
      const matchesStage = stageFilter === "all" || lead.stageId === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [leads, search, stageFilter]);

  const openChat = useCallback((lead: Lead) => {
    setSelectedLead(lead);
    setIsChatOpen(true);
  }, []);

  const showCustomerDropdown =
    isCustomerSearchOpen && customerSearch.trim().length >= 2;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {customerIdFilter ? `${customerNameForFilter}'s Leads` : "Leads"}
          </h1>
          <p className="text-sm text-zinc-500">
            {customerIdFilter
              ? `Showing ${leads.length} lead${leads.length !== 1 ? "s" : ""} for this customer`
              : "View and manage all your leads."}
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Lead
        </Button>
      </div>

      {/* Error */}
      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {customerIdFilter ? (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-zinc-100/70 px-3 py-2 text-sm text-zinc-600">
          <span>
            Showing leads for <strong>{customerNameForFilter}</strong>
          </span>
          <button
            type="button"
            onClick={() => clearCustomerFilter()}
            className="ml-auto text-xs text-primary hover:underline"
          >
            Show all leads
          </button>
        </div>
      ) : null}

      {/* Search + Stage filter */}
      {!isLoading && !errorMessage ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-48 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by title or source..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            />
          </div>
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by customer..."
              value={customerSearch}
              onChange={(event) => handleCustomerSearchChange(event.target.value)}
              onFocus={handleCustomerFocus}
              onBlur={handleCustomerBlur}
              className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
            />

            {showCustomerDropdown ? (
              <div className="absolute z-30 mt-1 w-full rounded-lg border border-zinc-200 bg-white p-1 shadow-lg">
                {isCustomerSearchLoading ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching customers...
                  </div>
                ) : null}

                {!isCustomerSearchLoading && customerSearchError ? (
                  <div className="px-3 py-2 text-sm text-red-600">{customerSearchError}</div>
                ) : null}

                {!isCustomerSearchLoading && !customerSearchError && customerResults.length > 0 ? (
                  <div className="max-h-56 overflow-y-auto">
                    {customerResults.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        className="w-full rounded-md px-3 py-2 text-left hover:bg-zinc-100"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          handleCustomerSelect(customer);
                        }}
                      >
                        <p className="text-sm font-medium text-zinc-900">{customer.name}</p>
                        <p className="text-xs text-zinc-500">{customer.phone}</p>
                      </button>
                    ))}
                  </div>
                ) : null}

                {!isCustomerSearchLoading && !customerSearchError && customerResults.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-zinc-500">No customers found.</div>
                ) : null}
              </div>
            ) : null}
          </div>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            disabled={isLoadingStages}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          >
            <option value="all">All Stages</option>
            {stageOptions.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Cards / Loading / Empty */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-16 text-center">
          <p className="text-sm text-zinc-500">
            {leads.length === 0
              ? "No leads yet. Create your first lead →"
              : "No leads match your search."}
          </p>
          {leads.length === 0 ? (
            <Button type="button" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Lead
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              stageMap={stageMap}
              onOpenChat={openChat}
            />
          ))}
        </div>
      )}

      <LeadWhatsAppChatDrawer
        isOpen={isChatOpen}
        lead={selectedLead}
        onClose={() => setIsChatOpen(false)}
      />

      <CreateLeadDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={loadLeads}
      />
    </section>
  );
}
