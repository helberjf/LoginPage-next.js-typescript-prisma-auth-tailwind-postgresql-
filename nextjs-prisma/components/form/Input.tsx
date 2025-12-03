// src/components/form/Input.tsx
"use client";

import { forwardRef } from "react";
import { cn } from "../../lib/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-md border border-neutral-300 dark:border-neutral-700",
          "bg-white dark:bg-neutral-900",
          "px-3 py-2 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-500",
          "transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
