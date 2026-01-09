"use client";

import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  className?: string;
};

export default function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className={
        className ??
        "inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      }
    >
      Sair
    </button>
  );
}
