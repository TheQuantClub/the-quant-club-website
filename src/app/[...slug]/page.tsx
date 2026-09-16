import { ProductApp } from "@/components/product-app";

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  return <ProductApp slug={slug} />;
}
