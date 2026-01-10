import ProductForm from "@/components/admin/ProductForm";

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  return <ProductForm productId={params.id} />;
}
