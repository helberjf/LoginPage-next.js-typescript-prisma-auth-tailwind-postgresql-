// app/dashboard/admin/users/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { UserStatus } from "@prisma/client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function statusBadge(status: UserStatus) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    case "BLOCKED":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "DELETED":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  if (!id) notFound();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) notFound();

  return (
    <section className="space-y-4 p-2 sm:p-4">
      {/* Header */}
      <header>
        <h1 className="text-base font-semibold">
          Detalhes do Usuário
        </h1>
      </header>

      {/* TABELA – DADOS BÁSICOS */}
      <Table title="Dados Básicos">
        <Row label="Nome" value={user.name ?? "-"} />
        <Row label="Email" value={user.email ?? "-"} />
        <Row
          label="Status"
          value={
            <span
              className={`rounded px-2 py-0.5 text-[10px] ${statusBadge(
                user.status
              )}`}
            >
              {user.status}
            </span>
          }
        />
        <Row
          label="Criado em"
          value={user.createdAt.toLocaleDateString("pt-BR")}
        />
      </Table>

      {/* TABELA – PERFIL */}
      <Table title="Perfil">
        <RowCols
          leftLabel="CPF"
          leftValue={user.profile?.cpf ?? "-"}
          rightLabel="Telefone"
          rightValue={user.profile?.phone ?? "-"}
        />

        <RowCols
          leftLabel="Gênero"
          leftValue={user.profile?.gender ?? "-"}
          rightLabel="Nascimento"
          rightValue={
            user.profile?.birthDate
              ? user.profile.birthDate.toLocaleDateString("pt-BR")
              : "-"
          }
        />
      </Table>

      {/* TABELA – ENDEREÇOS */}
      <Table title="Endereços">
        {user.addresses.length === 0 ? (
          <EmptyRow value="Nenhum endereço cadastrado" />
        ) : (
          user.addresses.map((addr) => (
            <div
              key={addr.id}
              className="space-y-2 px-3 py-2 text-[11px]"
            >
              {/* Rua */}
              <Field label="Rua" value={addr.street} />

              {/* Número + Bairro */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Número" value={addr.number} />
                <Field label="Bairro" value={addr.district} />
              </div>

              {/* Cidade */}
              <Field label="Cidade" value={addr.city} />

              {/* Estado + CEP */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Estado" value={addr.state} />
                <Field label="CEP" value={addr.zipCode} />
              </div>

              {/* Complemento */}
              {addr.complement && (
                <Field
                  label="Complemento"
                  value={addr.complement}
                />
              )}
            </div>
          ))
        )}
      </Table>


    </section>
  );
}

/* ---------- COMPONENTES DE TABELA ---------- */

function Table({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-800">
      <div className="border-b border-gray-200 px-3 py-2 text-xs font-semibold dark:border-gray-800">
        {title}
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-2 px-3 py-2 text-[11px]">
      <span className="text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="text-right font-medium">
        {value}
      </span>
    </div>
  );
}

/**
 * Linha em duas colunas (elegante para dados relacionados)
 */
function RowCols({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: React.ReactNode;
  rightLabel: string;
  rightValue: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 px-3 py-2 text-[11px]">
      <div className="flex justify-between gap-2">
        <span className="text-gray-500 dark:text-gray-400">
          {leftLabel}
        </span>
        <span className="font-medium">
          {leftValue}
        </span>
      </div>

      <div className="flex justify-between gap-2">
        <span className="text-gray-500 dark:text-gray-400">
          {rightLabel}
        </span>
        <span className="font-medium">
          {rightValue}
        </span>
      </div>
    </div>
  );
}

function EmptyRow({ value }: { value: string }) {
  return (
    <div className="px-3 py-2 text-[11px] text-gray-400">
      {value}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
      <span className="text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <span className="font-medium">
        {value}
      </span>
    </div>
  );
}

