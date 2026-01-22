"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DollarSign } from "lucide-react";

type Props = {
  maxPrice: number;
};

export default function ProductPriceFilter({ maxPrice }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const safeMax = useMemo(() => {
    const raw = Number(searchParams?.get("maxPrice"));
    if (Number.isFinite(raw) && raw > 0) {
      return Math.min(raw, maxPrice);
    }
    return maxPrice;
  }, [searchParams, maxPrice]);

  const [value, setValue] = useState(safeMax);

  useEffect(() => {
    setValue(safeMax);
  }, [safeMax]);

  const sliderMax = Math.max(1, Math.ceil(maxPrice));

  const updateQuery = (nextValue: number) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (nextValue >= sliderMax) {
      params.delete("maxPrice");
    } else {
      params.set("maxPrice", String(nextValue));
    }

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const handleChange = (nextValue: number) => {
    setValue(nextValue);
    updateQuery(nextValue);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Filtrar por preço"
        className="h-10 px-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition flex items-center gap-2"
      >
        <DollarSign className="w-4 h-4" />
        <span className="hidden sm:inline">Preço</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-3 shadow-lg z-20">
          <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-2">
            Até R$ {value}
          </div>
          <input
            type="range"
            min={0}
            max={sliderMax}
            value={value}
            onChange={(e) => handleChange(parseInt(e.target.value, 10))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
