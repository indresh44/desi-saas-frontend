import { Suspense } from "react";
import LeadDetailClient from "@/components/leads/lead-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <Suspense>
      <LeadDetailClient leadId={id} />
    </Suspense>
  );
}
