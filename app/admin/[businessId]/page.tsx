import { AdminBusinessDetail } from "@/components/admin/admin-business-detail";
import { AdminGate } from "@/components/admin/admin-gate";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ businessId: string }>;
};

export default async function AdminBusinessPage({ params }: PageProps) {
  const { businessId } = await params;
  return (
    <AdminGate>
      <AdminBusinessDetail businessId={businessId} />
    </AdminGate>
  );
}
