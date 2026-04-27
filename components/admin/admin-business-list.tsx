"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { listAdminBusinesses } from "@/lib/api/admin";
import type { AdminBusinessSummary } from "@/lib/types/admin";

function formatRupees(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminBusinessList() {
  const [businesses, setBusinesses] = useState<AdminBusinessSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    listAdminBusinesses()
      .then((rows) => {
        if (!cancelled) setBusinesses(rows);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Failed to load";
        setError(message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!businesses) return [];
    const q = search.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        (b.owner_email ?? "").toLowerCase().includes(q) ||
        (b.phone ?? "").toLowerCase().includes(q),
    );
  }, [businesses, search]);

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (businesses === null) {
    return (
      <p className="text-sm text-muted-foreground">Loading businesses…</p>
    );
  }

  const totalUsers = businesses.reduce((sum, b) => sum + b.user_count, 0);
  const totalOutstanding = businesses.reduce(
    (sum, b) => sum + b.outstanding_amount,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Businesses" value={String(businesses.length)} />
        <StatCard label="Users (total)" value={String(totalUsers)} />
        <StatCard
          label="Outstanding (total)"
          value={formatRupees(totalOutstanding)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, owner email, phone…"
          className="w-full max-w-md rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <span className="text-xs text-muted-foreground">
          {filtered.length} / {businesses.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Business</th>
              <th className="px-4 py-3 text-left">Owner</th>
              <th className="px-4 py-3 text-left">Signed up</th>
              <th className="px-4 py-3 text-left">Last login</th>
              <th className="px-4 py-3 text-right">Leads</th>
              <th className="px-4 py-3 text-right">Invoices</th>
              <th className="px-4 py-3 text-right">Outstanding</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-muted/20">
                <td className="px-4 py-3">
                  <div className="font-medium text-primary">{b.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.phone ?? "—"} · {b.preferred_language} · {b.timezone}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>{b.owner_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    {b.owner_email ?? "—"}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">
                  {formatDate(b.created_at)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {formatDate(b.owner_last_login_at)}
                </td>
                <td className="px-4 py-3 text-right">{b.lead_count}</td>
                <td className="px-4 py-3 text-right">{b.invoice_count}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatRupees(b.outstanding_amount)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/${b.id}`}
                    className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Open →
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  No businesses match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-primary">{value}</p>
    </div>
  );
}
