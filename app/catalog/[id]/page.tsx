import CatalogItemDetailClient from "@/components/catalog/catalog-item-detail-client";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CatalogItemDetailPage({ params }: Props) {
  const { id } = await params;
  return <CatalogItemDetailClient itemId={id} />;
}
