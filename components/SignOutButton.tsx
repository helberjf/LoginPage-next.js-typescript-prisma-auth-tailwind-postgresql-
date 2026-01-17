// components/auth/SignOutButton.tsx
"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type SignOutButtonProps = {
  className?: string;

  /**
   * Para onde redirecionar após sair.
   * Default: "/"
   */
  callbackUrl?: string;

  /**
   * Texto do botão (opcional)
   */
  label?: string;
};

export default function SignOutButton({
  className,
  callbackUrl = "/",
  label = "Sair",
}: SignOutButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSignOut() {
    try {
      setLoading(true);
      setOpen(false);

      await signOut({ callbackUrl });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className={className}
          type="button"
          disabled={loading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Sair da conta</DialogTitle>
          <DialogDescription>
            Você tem certeza que deseja encerrar sua sessão? Você precisará fazer
            login novamente para acessar o painel.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <DialogClose asChild>
            <Button variant="outline" type="button" disabled={loading}>
              Cancelar
            </Button>
          </DialogClose>

          <Button
            variant="destructive"
            type="button"
            onClick={handleSignOut}
            disabled={loading}
          >
            {loading ? "Saindo..." : "Sair"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
