// src/components/ui/button.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const UIButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-md px-4 py-2",
          "text-sm font-medium",
          "bg-blue-600 text-white hover:bg-blue-700",
          "disabled:opacity-50 disabled:pointer-events-none",
          "transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

UIButton.displayName = "UIButton";

export default UIButton;
