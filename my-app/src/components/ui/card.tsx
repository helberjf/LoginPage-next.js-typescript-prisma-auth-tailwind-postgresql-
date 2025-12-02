// src/components/ui/card.tsx
import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-neutral-300 dark:border-neutral-700",
        "p-4 bg-white dark:bg-neutral-900",
        className
      )}
    >
      {children}
    </div>
  );
}
