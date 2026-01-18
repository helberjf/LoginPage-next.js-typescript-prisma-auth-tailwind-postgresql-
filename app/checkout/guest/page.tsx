import { redirect } from "next/navigation";

type PageProps = {
  searchParams?: Promise<{ productId?: string }> | { productId?: string };
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const productId = resolvedSearchParams?.productId;

  if (productId) {
    redirect(`/products/${productId}`);
  }

  redirect("/products");
}
