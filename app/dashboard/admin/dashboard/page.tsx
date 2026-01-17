// app/dashboard/admin/dashboard/page.tsx

export default function AdminDashboardPage() {
  return (
    <section className="space-y-4 p-3 sm:p-4">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-lg font-semibold sm:text-xl">
          Dashboard Admin
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Visão geral do sistema
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Produtos"
          value="0"
          description="Cadastrados"
        />
        <DashboardCard
          title="Vendas"
          value="R$ 0,00"
          description="Total"
        />
        <DashboardCard
          title="Usuários"
          value="0"
          description="Ativos"
        />
        <DashboardCard
          title="Pendências"
          value="0"
          description="Pedidos"
        />
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Atividades */}
        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-semibold">
            Atividades Recentes
          </h2>

          <EmptyState message="Nenhuma atividade registrada." />
        </div>

        {/* Ações rápidas */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-semibold">
            Ações Rápidas
          </h2>

          <div className="space-y-2">
            <QuickAction label="Novo Produto" />
            <QuickAction label="Pedidos" />
            <QuickAction label="Usuários" />
            <QuickAction label="Relatórios" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Components ---------- */

function DashboardCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <p className="mt-1 text-xl font-semibold">
        {value}
      </p>
      <p className="text-[11px] text-gray-400">
        {description}
      </p>
    </div>
  );
}

function QuickAction({ label }: { label: string }) {
  return (
    <button
      className="
        w-full rounded-md border border-gray-200 px-3 py-2 text-xs font-medium
        transition
        hover:bg-gray-100
        dark:border-gray-800 dark:hover:bg-gray-800
      "
    >
      {label}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-28 items-center justify-center text-xs text-gray-400">
      {message}
    </div>
  );
}
