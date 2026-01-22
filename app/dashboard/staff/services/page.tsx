import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Atendimentos | Staff",
  description: "Lista de atendimentos e serviços atribuídos ao staff.",
};

export default function StaffServicesPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Atendimentos</h1>
      <p className="text-neutral-600 dark:text-neutral-400">
        Em breve você poderá gerenciar seus atendimentos por aqui.
      </p>
    </main>
  );
}