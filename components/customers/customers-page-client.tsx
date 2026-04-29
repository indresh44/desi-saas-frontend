"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageCircle, Pencil, Phone, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCustomer, fetchCustomers, updateCustomer } from "@/lib/api/customers";
import { fetchCustomerOutstanding } from "@/lib/api/invoices";
import { Customer, UpdateCustomerInput } from "@/lib/types/customer";
import { validateIndianMobile } from "@/lib/validation/phone";

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
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editGstNumber, setEditGstNumber] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [outstandingByCustomer, setOutstandingByCustomer] = useState<
    Record<string, OutstandingState>
  >({});

  // `bg-background` (vs the wrapper's bg-card) makes the input field
  // visibly recess into the card in dark mode — without it the input
  // and the surrounding card render the same color and the boundary
  // disappears. `text-base md:text-sm` keeps the input at 16px on mobile
  // so iOS doesn't auto-zoom on focus.
  const inputClassName =
    "w-full rounded-lg border bg-background px-3 py-2 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 md:text-sm";

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

      const phoneCheck = validateIndianMobile(trimmedPhone);
      if (!phoneCheck.ok) {
        setErrorMessage(phoneCheck.reason);
        return;
      }

      setIsCreating(true);
      setErrorMessage(null);

      try {
        await createCustomer({
          name: trimmedName,
          phone: trimmedPhone,
          email: normalizeEmail(trimmedEmail),
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          gst_number: gstNumber.trim().toUpperCase() || undefined,
        });

        setName("");
        setPhone("");
        setEmail("");
        setAddress("");
        setCity("");
        setState("");
        setGstNumber("");
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
    [address, city, email, gstNumber, loadCustomers, name, phone, state]
  );

  const resetEditState = useCallback(() => {
    setEditingCustomerId(null);
    setEditName("");
    setEditPhone("");
    setEditEmail("");
    setEditAddress("");
    setEditCity("");
    setEditState("");
    setEditGstNumber("");
    setIsSavingEdit(false);
  }, []);

  const handleStartEdit = useCallback((customer: Customer) => {
    setErrorMessage(null);
    setEditingCustomerId(customer.id);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditEmail(customer.email ?? "");
    setEditAddress(customer.address ?? "");
    setEditCity(customer.city ?? "");
    setEditState(customer.state ?? "");
    setEditGstNumber(customer.gstNumber ?? "");
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

      const phoneCheck = validateIndianMobile(trimmedPhone);
      if (!phoneCheck.ok) {
        setErrorMessage(phoneCheck.reason);
        return;
      }

      const updates: UpdateCustomerInput = {};

      if (trimmedName !== customer.name) updates.name = trimmedName;
      if (trimmedPhone !== customer.phone) updates.phone = trimmedPhone;
      if (normalizedEditEmail !== customer.email) updates.email = normalizedEditEmail;
      const trimmedEditAddress = editAddress.trim() || null;
      if (trimmedEditAddress !== (customer.address ?? null)) updates.address = trimmedEditAddress;
      const trimmedEditCity = editCity.trim() || null;
      if (trimmedEditCity !== (customer.city ?? null)) updates.city = trimmedEditCity;
      const trimmedEditState = editState.trim() || null;
      if (trimmedEditState !== (customer.state ?? null)) updates.state = trimmedEditState;
      const trimmedEditGst = editGstNumber.trim().toUpperCase() || null;
      if (trimmedEditGst !== (customer.gstNumber ?? null)) updates.gst_number = trimmedEditGst;

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
    [editAddress, editCity, editEmail, editGstNumber, editName, editPhone, editState, resetEditState]
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Customers
          </h1>
          <p className="text-sm text-muted-foreground">
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
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          className="rounded-xl border bg-card p-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
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
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="space-y-1 sm:col-span-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Address
              </span>
              <input
                type="text"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className={inputClassName}
                placeholder="Street / area"
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                City
              </span>
              <input
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                State
              </span>
              <input
                type="text"
                value={state}
                onChange={(event) => setState(event.target.value)}
                className={inputClassName}
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                GST Number
              </span>
              <input
                type="text"
                value={gstNumber}
                onChange={(event) => setGstNumber(event.target.value)}
                className={inputClassName}
                placeholder="15-digit GSTIN"
                maxLength={15}
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

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
            <div className="h-10 animate-pulse rounded bg-muted" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">
            No customers yet. They are created automatically when you add a lead.
          </div>
        ) : (
          <>
            {/* ── Mobile card list (< md) ── */}
            <ul className="divide-y divide-border md:hidden">
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
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(event) => setEditAddress(event.target.value)}
                          className={inputClassName}
                          disabled={isSavingEdit}
                          placeholder="Address"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editCity}
                            onChange={(event) => setEditCity(event.target.value)}
                            className={inputClassName}
                            disabled={isSavingEdit}
                            placeholder="City"
                          />
                          <input
                            type="text"
                            value={editState}
                            onChange={(event) => setEditState(event.target.value)}
                            className={inputClassName}
                            disabled={isSavingEdit}
                            placeholder="State"
                          />
                        </div>
                        <input
                          type="text"
                          value={editGstNumber}
                          onChange={(event) => setEditGstNumber(event.target.value)}
                          className={inputClassName}
                          disabled={isSavingEdit}
                          placeholder="GST Number"
                          maxLength={15}
                        />
                        <div className="flex gap-2 pt-1">
                          {/* Compact font (size="sm" = 12.8px) but a 44px tap
                              target on mobile via the min-h override. Desktop
                              stays at the 28px sm height. */}
                          <Button
                            type="button"
                            size="sm"
                            className="min-h-7 flex-1 md:min-h-6"
                            onClick={() => void handleSaveEdit(customer)}
                            disabled={isSavingEdit}
                          >
                            {isSavingEdit ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="min-h-7 flex-1 md:min-h-6"
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
                            <p className="text-sm font-semibold text-primary">{customer.name}</p>
                            <p className="mt-0.5 text-sm text-muted-foreground">{customer.phone}</p>
                            {customer.email ? (
                              <p className="text-xs text-muted-foreground">{customer.email}</p>
                            ) : null}
                          </div>
                          <div className="text-right">
                            {outstandingState?.isLoading || outstanding === undefined ? (
                              <span className="text-sm text-muted-foreground">...</span>
                            ) : outstanding === null ? (
                              <span className="text-sm text-muted-foreground">-</span>
                            ) : outstanding > 0 ? (
                              <span className="text-sm font-semibold text-red-600">
                                {formatRupees(outstanding)}
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-green-600">✓ Clear</span>
                            )}
                          </div>
                        </div>
                        {/* Compact size="sm" buttons (matches leads card)
                            with per-action color tints: blue Call, green
                            WhatsApp, slate Edit. `fill-current` fills the
                            stroked Phone / MessageCircle glyphs with the
                            text color so the icon reads as a solid badge.
                            Dark variants keep contrast in dark mode. */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {customer.phone ? (
                            <a href={`tel:${customer.phone}`}>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
                              >
                                <Phone className="h-3.5 w-3.5 fill-current" />
                                Call
                              </Button>
                            </a>
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-300"
                            onClick={() => handleWhatsApp(customer.phone)}
                          >
                            <MessageCircle className="h-3.5 w-3.5 fill-current" />
                            WhatsApp
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-1.5 border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-slate-300"
                            onClick={() => handleStartEdit(customer)}
                            disabled={isAnotherRowEditing || isSavingEdit}
                          >
                            <Pencil className="h-3.5 w-3.5 fill-current" />
                            Edit
                          </Button>
                          <Link href={`/customers/${customer.id}`} className="ml-auto">
                            <Button type="button" variant="ghost" size="sm" className="gap-1">
                              Details
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
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
                <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Outstanding</th>
                    <th className="whitespace-nowrap px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredCustomers.map((customer) => {
                    const outstandingState = outstandingByCustomer[customer.id];
                    const outstanding = outstandingState?.amount;
                    const isEditing = editingCustomerId === customer.id;
                    const isAnotherRowEditing =
                      editingCustomerId !== null && editingCustomerId !== customer.id;

                    return (
                      <tr key={customer.id}>
                        <td className="px-4 py-3 font-medium text-primary">
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
                        <td className="px-4 py-3 text-foreground">
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
                        <td className="px-4 py-3 text-foreground">
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
                            <span className="text-muted-foreground">...</span>
                          ) : outstanding === null ? (
                            <span className="text-muted-foreground">-</span>
                          ) : outstanding > 0 ? (
                            <span className="font-medium text-red-600">
                              {formatRupees(outstanding)}
                            </span>
                          ) : (
                            <span className="font-medium text-green-600">✓ Clear</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5">
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
                                {customer.phone ? (
                                  <a
                                    href={`tel:${customer.phone}`}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                                  >
                                    <Phone className="h-4 w-4" />
                                    Call
                                  </a>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => handleWhatsApp(customer.phone)}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                  WhatsApp
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(customer)}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground"
                                  disabled={isAnotherRowEditing || isSavingEdit}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </button>
                                <Link
                                  href={`/customers/${customer.id}`}
                                  className="text-sm font-medium text-foreground transition hover:text-foreground"
                                >
                                  View Details -&gt;
                                </Link>
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
