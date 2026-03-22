"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { MessageCircle, Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCustomer, fetchCustomers, updateCustomer } from "@/lib/api/customers";
import { fetchCustomerOutstanding } from "@/lib/api/invoices";
import { Customer, UpdateCustomerInput } from "@/lib/types/customer";

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

function normalizeEmail(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
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
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [outstandingByCustomer, setOutstandingByCustomer] = useState<
    Record<string, OutstandingState>
  >({});

  const inputClassName =
    "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:opacity-50";

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
          email: normalizeEmail(trimmedEmail),
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

  const resetEditState = useCallback(() => {
    setEditingCustomerId(null);
    setEditName("");
    setEditPhone("");
    setEditEmail("");
    setIsSavingEdit(false);
  }, []);

  const handleStartEdit = useCallback((customer: Customer) => {
    setErrorMessage(null);
    setEditingCustomerId(customer.id);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditEmail(customer.email ?? "");
  }, []);

  const handleCancelEdit = useCallback(() => {
    resetEditState();
  }, [resetEditState]);

  const handleSaveEdit = useCallback(
    async (customer: Customer) => {
      const trimmedName = editName.trim();
      const trimmedPhone = editPhone.trim();
      const normalizedEditEmail = normalizeEmail(editEmail);

      if (!trimmedName || !trimmedPhone) {
        setErrorMessage("Name and phone are required.");
        return;
      }

      const updates: UpdateCustomerInput = {};

      if (trimmedName !== customer.name) {
        updates.name = trimmedName;
      }

      if (trimmedPhone !== customer.phone) {
        updates.phone = trimmedPhone;
      }

      if (normalizedEditEmail !== customer.email) {
        updates.email = normalizedEditEmail;
      }

      if (Object.keys(updates).length === 0) {
        resetEditState();
        return;
      }

      setIsSavingEdit(true);
      setErrorMessage(null);

      try {
        const updatedCustomer = await updateCustomer(customer.id, updates);
        setCustomers((prev) =>
          prev.map((item) =>
            item.id === updatedCustomer.id ? updatedCustomer : item
          )
        );
        resetEditState();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to update customer.";
        setErrorMessage(message);
        setIsSavingEdit(false);
      }
    },
    [editEmail, editName, editPhone, resetEditState]
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

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:min-w-52 sm:flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          />
        </div>

        <Button
          type="button"
          onClick={() => setShowCreateForm((prev) => !prev)}
          disabled={isSavingEdit}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          New Customer
        </Button>
      </div>

      {showCreateForm ? (
        <form
          onSubmit={handleCreateCustomer}
          className="rounded-xl border border-zinc-200 bg-white p-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputClassName}
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
                className={inputClassName}
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
                className={inputClassName}
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
          <>
            {/* ── Mobile card list (< md) ── */}
            <ul className="divide-y divide-zinc-100 md:hidden">
              {filteredCustomers.map((customer) => {
                const outstandingState = outstandingByCustomer[customer.id];
                const outstanding = outstandingState?.amount;
                const isEditing = editingCustomerId === customer.id;
                const isAnotherRowEditing =
                  editingCustomerId !== null && editingCustomerId !== customer.id;

                return (
                  <li key={customer.id} className="px-4 py-4">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          className={inputClassName}
                          disabled={isSavingEdit}
                          placeholder="Name"
                          required
                        />
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(event) => setEditPhone(event.target.value)}
                          className={inputClassName}
                          disabled={isSavingEdit}
                          placeholder="Phone"
                          required
                        />
                        <input
                          type="email"
                          value={editEmail}
                          onChange={(event) => setEditEmail(event.target.value)}
                          className={inputClassName}
                          disabled={isSavingEdit}
                          placeholder="Email"
                        />
                        <div className="flex gap-2 pt-1">
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1"
                            onClick={() => void handleSaveEdit(customer)}
                            disabled={isSavingEdit}
                          >
                            {isSavingEdit ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={handleCancelEdit}
                            disabled={isSavingEdit}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">{customer.name}</p>
                            <p className="mt-0.5 text-sm text-zinc-600">{customer.phone}</p>
                            {customer.email ? (
                              <p className="text-xs text-zinc-500">{customer.email}</p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            {outstandingState?.isLoading || outstanding === undefined ? (
                              <span className="text-sm text-zinc-500">...</span>
                            ) : outstanding === null ? (
                              <span className="text-sm text-zinc-500">-</span>
                            ) : outstanding > 0 ? (
                              <span className="text-sm font-semibold text-red-600">
                                {formatRupees(outstanding)}
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-green-600">✓ Clear</span>
                            )}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(customer)}
                            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
                            disabled={isAnotherRowEditing || isSavingEdit}
                          >
                            Edit
                          </button>
                          <Link
                            href={`/leads?customer_id=${customer.id}&customer_name=${encodeURIComponent(customer.name)}`}
                            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                          >
                            View Leads →
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleWhatsApp(customer.phone)}
                            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                          >
                            WhatsApp
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* ── Desktop table (≥ md) ── */}
            <div className="hidden overflow-x-auto md:block">
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
                    const isEditing = editingCustomerId === customer.id;
                    const isAnotherRowEditing =
                      editingCustomerId !== null && editingCustomerId !== customer.id;

                    return (
                      <tr key={customer.id}>
                        <td className="px-4 py-3 font-medium text-zinc-900">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(event) => setEditName(event.target.value)}
                              className={inputClassName}
                              disabled={isSavingEdit}
                              required
                            />
                          ) : (
                            customer.name
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(event) => setEditPhone(event.target.value)}
                              className={inputClassName}
                              disabled={isSavingEdit}
                              required
                            />
                          ) : (
                            customer.phone
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {isEditing ? (
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(event) => setEditEmail(event.target.value)}
                              className={inputClassName}
                              disabled={isSavingEdit}
                            />
                          ) : (
                            customer.email || "-"
                          )}
                        </td>
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
                            {isEditing ? (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => void handleSaveEdit(customer)}
                                  disabled={isSavingEdit}
                                >
                                  {isSavingEdit ? "Saving..." : "Save"}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  disabled={isSavingEdit}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(customer)}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-zinc-700 transition hover:text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-400"
                                  disabled={isAnotherRowEditing || isSavingEdit}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </button>
                                <Link
                                  href={`/leads?customer_id=${customer.id}&customer_name=${encodeURIComponent(customer.name)}`}
                                  className="text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
                                >
                                  View Leads -&gt;
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleWhatsApp(customer.phone)}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-zinc-700 transition hover:text-zinc-900"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  WhatsApp
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
