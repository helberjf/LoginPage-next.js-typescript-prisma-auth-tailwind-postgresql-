"use client";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string | null;
};

export default function FormInput({ label, id, error, ...rest }: Props) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full rounded-lg border px-3 py-2 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1
          ${error ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-primary"}
        `}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
