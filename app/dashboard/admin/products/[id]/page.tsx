import ProductForm from "@/components/admin/ProductForm";

type Props = {
  params: { id: string };
};

export default function Page({ params }: Props) {
  return (
    <section className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">
        Editar produto
      </h1>

      <ProductForm productId={params.id} />
    </section>
  );
}
