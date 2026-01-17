
// app/dashboard/admin/products/page.tsx
import ProductList from "@/components/admin/ProductList";

export default function Page() {
  return (
    <section className="p-1">
      <h1 className="text-xl font-semibold mb-4">
        Produtos
      </h1>
      
      <ProductList />
    </section>
  );
}
