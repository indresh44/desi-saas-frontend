import LeadDetailClient from "@/components/leads/lead-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  return <LeadDetailClient leadId={id} />;
}
