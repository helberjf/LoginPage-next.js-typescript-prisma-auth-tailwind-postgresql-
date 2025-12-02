// src/app/(dashboard)/error.tsx
"use client";

export default function DashboardError({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6">
      <h2 className="text-2xl font-bold mb-2">Erro inesperado</h2>
      <p className="text-neutral-500 mb-4">
        Algo deu errado ao carregar o dashboard.
      </p>
      <button
        onClick={() => location.reload()}
        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        Tentar novamente
      </button>
    </div>
  );
}
