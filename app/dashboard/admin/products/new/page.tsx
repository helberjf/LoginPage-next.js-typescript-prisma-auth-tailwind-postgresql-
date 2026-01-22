import ProductForm from "@/components/admin/ProductForm";

export default function Page() {
  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
            Novo produto
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
            Preencha as informações e publique o produto no catálogo.
          </p>
        </header>

        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-4 sm:p-6">
          <ProductForm />
        </div>
      </div>
    </section>
  );
}
