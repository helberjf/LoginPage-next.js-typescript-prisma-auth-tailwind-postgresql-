"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  categories: Category[];
};

export default function ProductCategoryFilter({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = searchParams?.get("category") ?? "";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (value) {
      params.set("category", value);
    } else {
      params.delete("category");
    }
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  return (
    <div className="w-full sm:w-60">
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm"
      >
        <option value="">Todas as categorias</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
