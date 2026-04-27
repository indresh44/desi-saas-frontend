import Link from "next/link";
import { AdminAuditLog } from "@/components/admin/admin-audit-log";
import { AdminGate } from "@/components/admin/admin-gate";

export const dynamic = "force-dynamic";

export default function AdminAuditPage() {
  return (
    <AdminGate>
      <div className="space-y-5">
        <div>
          <Link
            href="/admin"
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            ← Back to admin
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-primary">
            Audit log
          </h1>
          <p className="text-sm text-muted-foreground">
            Every admin action, newest first.
          </p>
        </div>
        <AdminAuditLog />
      </div>
    </AdminGate>
  );
}
