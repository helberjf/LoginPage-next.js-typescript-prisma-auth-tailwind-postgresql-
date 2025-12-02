// src/components/ui/input.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const UIInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-neutral-300",
          "bg-white px-3 py-2 text-sm",
          "dark:bg-neutral-900 dark:border-neutral-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-600",
          "transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

UIInput.displayName = "UIInput";
export default UIInput;
