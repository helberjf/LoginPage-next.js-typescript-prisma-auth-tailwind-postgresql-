import ProductForm from "@/components/admin/ProductForm";

export default function Page() {
  return (
    <section className="p-6 max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">
        Novo produto
      </h1>

      <ProductForm />
    </section>
  );
}
