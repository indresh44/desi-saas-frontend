import CustomerDetailClient from "@/components/customers/customer-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  return <CustomerDetailClient customerId={id} />;
}
