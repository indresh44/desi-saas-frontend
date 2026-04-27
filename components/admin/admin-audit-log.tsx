"use client";

import { useEffect, useState } from "react";
import { listAdminAudit } from "@/lib/api/admin";
import type { AdminAuditLog as AdminAuditLogType } from "@/lib/types/admin";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export function AdminAuditLog() {
  const [logs, setLogs] = useState<AdminAuditLogType[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listAdminAudit({ limit: 200 })
      .then((rows) => {
        if (!cancelled) setLogs(rows);
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

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!logs) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">
        No admin actions recorded yet.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => (
        <li
          key={log.id}
          className="rounded-2xl border bg-card p-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide">
                {log.action}
              </span>
              {log.target_type ? (
                <span className="text-xs text-muted-foreground">
                  {log.target_type}
                  {log.target_id ? ` · ${log.target_id.slice(0, 8)}…` : ""}
                </span>
              ) : null}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDate(log.created_at)}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            By {log.admin_email}
            {log.ip_address ? ` · ${log.ip_address}` : ""}
          </div>
          {log.before_snapshot ? (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Snapshot
              </summary>
              <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-muted/40 p-3 text-[11px] leading-relaxed">
                {JSON.stringify(log.before_snapshot, null, 2)}
              </pre>
            </details>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
