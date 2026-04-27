import Link from "next/link";
import { AdminBusinessList } from "@/components/admin/admin-business-list";
import { AdminGate } from "@/components/admin/admin-gate";

export const dynamic = "force-dynamic";

export default function AdminBusinessesPage() {
  return (
    <AdminGate>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Admin</h1>
            <p className="text-sm text-muted-foreground">
              Local-only founder dashboard. Every action is recorded in the
              audit log.
            </p>
          </div>
          <Link
            href="/admin/audit"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Audit log →
          </Link>
        </div>
        <AdminBusinessList />
      </div>
    </AdminGate>
  );
}
