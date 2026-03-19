"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCustomer, fetchCustomers } from "@/lib/api/customers";
import { fetchCustomerOutstanding } from "@/lib/api/invoices";
import { Customer } from "@/lib/types/customer";

type OutstandingState = {
  isLoading: boolean;
  amount: number | null;
};

function formatRupees(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

export default function CustomersPageClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [outstandingByCustomer, setOutstandingByCustomer] = useState<
    Record<string, OutstandingState>
  >({});

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchCustomers();
      setCustomers(data);
      setOutstandingByCustomer({});
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to load customers.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (customers.length === 0) {
      return;
    }

    customers.forEach((customer) => {
      setOutstandingByCustomer((prev) => {
        if (prev[customer.id]?.isLoading === true || prev[customer.id]?.amount !== undefined) {
          return prev;
        }

        return {
          ...prev,
          [customer.id]: { isLoading: true, amount: null },
        };
      });

      void fetchCustomerOutstanding(customer.id)
        .then((result) => {
          setOutstandingByCustomer((prev) => ({
            ...prev,
            [customer.id]: { isLoading: false, amount: result.outstanding },
          }));
        })
        .catch(() => {
          setOutstandingByCustomer((prev) => ({
            ...prev,
            [customer.id]: { isLoading: false, amount: null },
          }));
        });
    });
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) => {
      const nameMatches = customer.name.toLowerCase().includes(query);
      const phoneMatches = customer.phone.toLowerCase().includes(query);
      return nameMatches || phoneMatches;
    });
  }, [customers, search]);

  const handleCreateCustomer = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmedName = name.trim();
      const trimmedPhone = phone.trim();
      const trimmedEmail = email.trim();

      if (!trimmedName || !trimmedPhone) {
        setErrorMessage("Name and phone are required.");
        return;
      }

      setIsCreating(true);
      setErrorMessage(null);

      try {
        await createCustomer({
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail || null,
        });

        setName("");
        setPhone("");
        setEmail("");
        setShowCreateForm(false);
        await loadCustomers();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to create customer.";
        setErrorMessage(message);
      } finally {
        setIsCreating(false);
      }
    },
    [email, loadCustomers, name, phone]
  );

  const handleWhatsApp = useCallback((phoneNumber: string) => {
    const cleaned = normalizePhone(phoneNumber);
    if (!cleaned) {
      return;
    }

    window.open(`https://wa.me/91${cleaned}`, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Customers
          </h1>
          <p className="text-sm text-zinc-500">
            Track customers, dues, and quick actions.
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          />
        </div>

        <Button type="button" onClick={() => setShowCreateForm((prev) => !prev)}>
          <Plus className="h-4 w-4" />
          New Customer
        </Button>
      </div>

      {showCreateForm ? (
        <form
          onSubmit={handleCreateCustomer}
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Phone
              </span>
              <input
                type="text"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Customer"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <div className="h-10 animate-pulse rounded bg-zinc-100" />
            <div className="h-10 animate-pulse rounded bg-zinc-100" />
            <div className="h-10 animate-pulse rounded bg-zinc-100" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-zinc-600">
            No customers yet. They are created automatically when you add a lead.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Outstanding</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredCustomers.map((customer) => {
                  const outstandingState = outstandingByCustomer[customer.id];
                  const outstanding = outstandingState?.amount;

                  return (
                    <tr key={customer.id}>
                      <td className="px-4 py-3 font-medium text-zinc-900">{customer.name}</td>
                      <td className="px-4 py-3 text-zinc-700">{customer.phone}</td>
                      <td className="px-4 py-3 text-zinc-700">{customer.email || "-"}</td>
                      <td className="px-4 py-3">
                        {outstandingState?.isLoading || outstanding === undefined ? (
                          <span className="text-zinc-500">...</span>
                        ) : outstanding === null ? (
                          <span className="text-zinc-500">-</span>
                        ) : outstanding > 0 ? (
                          <span className="font-medium text-red-600">
                            {formatRupees(outstanding)}
                          </span>
                        ) : (
                          <span className="font-medium text-green-600">✓ Clear</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href="/leads"
                            className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
                          >
                            View Leads →
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(customer.phone)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
                          >
                            <MessageCircle className="h-4 w-4" />
                            💬 WhatsApp
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
