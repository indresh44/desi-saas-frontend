"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteAdminBusiness, getAdminBusiness } from "@/lib/api/admin";
import type { AdminBusinessDetail as AdminBusinessDetailType } from "@/lib/types/admin";

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

export function AdminBusinessDetail({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [business, setBusiness] = useState<AdminBusinessDetailType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdminBusiness(businessId)
      .then((b) => {
        if (!cancelled) setBusiness(b);
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
  }, [businessId]);

  const handleDelete = async () => {
    if (!business) return;
    if (confirmName !== business.name) {
      setDeleteError("Type the exact business name to confirm.");
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAdminBusiness(business.id, confirmName);
      router.push("/admin");
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: unknown }).message)
          : "Delete failed";
      setDeleteError(message);
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!business) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const counts = business.counts ?? {};

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          ← All businesses
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-primary">
          {business.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Created {formatDate(business.created_at)} · {business.timezone} ·{" "}
          {business.preferred_language}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Profile">
          <KV label="Phone" value={business.phone ?? "—"} />
          <KV label="Email" value={business.email ?? "—"} />
          <KV label="GST" value={business.gst_number ?? "—"} />
          <KV
            label="Type"
            value={business.business_type_label ?? business.business_type ?? "—"}
          />
          <KV label="City" value={business.city ?? "—"} />
          <KV label="State" value={business.state ?? "—"} />
          <KV label="Onboarding" value={business.onboarding_status} />
          <KV
            label="Onboarding method"
            value={business.onboarding_method ?? "—"}
          />
        </Card>

        <Card title="Owner">
          {business.owner ? (
            <>
              <KV label="Name" value={business.owner.name} />
              <KV label="Email" value={business.owner.email} />
              <KV label="Phone" value={business.owner.phone ?? "—"} />
              <KV label="Role" value={business.owner.role} />
              <KV
                label="Active"
                value={business.owner.is_active ? "Yes" : "No"}
              />
              <KV
                label="Last login"
                value={formatDate(business.owner.last_login_at)}
              />
              <KV label="Joined" value={formatDate(business.owner.created_at)} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No owner linked.</p>
          )}
        </Card>
      </section>

      <Card title="Data summary">
        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3 md:grid-cols-4">
          {Object.entries(counts).map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between rounded-md border bg-muted/30 px-2.5 py-1.5"
            >
              <span className="capitalize text-muted-foreground">
                {k.replace(/_/g, " ")}
              </span>
              <span className="font-medium tabular-nums">{v}</span>
            </div>
          ))}
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title={`Recent invoices (${business.recent_invoices.length})`}>
          {business.recent_invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {business.recent_invoices.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2"
                >
                  <span className="font-mono text-xs">{i.invoice_number}</span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {i.status}
                  </span>
                  <span className="tabular-nums">
                    {formatRupees(i.total_amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`Recent payments (${business.recent_payments.length})`}>
          {business.recent_payments.length === 0 ? (
            <p className="text-sm text-muted-foreground">None yet.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {business.recent_payments.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2"
                >
                  <span className="text-xs">{formatDate(p.created_at)}</span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    {p.method}
                  </span>
                  <span className="tabular-nums">
                    {formatRupees(p.amount)}
                    {p.voided_at ? (
                      <span className="ml-2 text-xs text-destructive">
                        VOIDED
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <Card title={`Recent leads (${business.recent_leads.length})`}>
        {business.recent_leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {business.recent_leads.map((l) => (
              <li
                key={l.id}
                className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2"
              >
                <span>{l.title ?? "Untitled"}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(l.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <section className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-5">
        <h2 className="text-base font-semibold text-destructive">Danger zone</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Hard-delete this business and every child record (users, leads,
          invoices, payments, chat history — everything). This cannot be
          undone. The action is recorded in the audit log.
        </p>

        <div className="mt-3 space-y-2">
          <label className="block text-xs font-medium text-muted-foreground">
            Type{" "}
            <span className="font-mono text-destructive">{business.name}</span>{" "}
            to confirm:
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={business.name}
            className="w-full max-w-md rounded-lg border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-destructive/30"
          />

          {deleteError ? (
            <p className="text-xs text-destructive">{deleteError}</p>
          ) : null}

          <button
            type="button"
            disabled={confirmName !== business.name || deleting}
            onClick={() => void handleDelete()}
            className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting
              ? "Deleting…"
              : `Permanently delete ${business.name}`}
          </button>
        </div>
      </section>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-right">{value}</span>
    </div>
  );
}
