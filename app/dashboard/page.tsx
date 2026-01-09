// app/dashboard/page.tsx
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import { Prisma } from "@prisma/client";

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
    payments: true;
  };
}>;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <p>Não autenticado</p>;
  }

  const orders: OrderWithRelations[] = await prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
  });

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Olá, {session.user.name ?? "Usuário"}
        </h1>

        <SignOutButton />
      </header>

      <section className="p-4 rounded-md border">
        <p>Email: {session.user.email}</p>
      </section>

      <section className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Meus pedidos</h2>

        <Link
          href="/products"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Comprar mais produtos
        </Link>
      </section>

      {orders.length === 0 ? (
        <p className="text-neutral-400 text-sm">
          Você ainda não fez nenhum pedido.
        </p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border rounded-md p-4 space-y-2"
            >
              <div className="flex justify-between">
                <span className="font-semibold">
                  Pedido #{order.id.slice(0, 8)}
                </span>
                <span className="text-sm text-neutral-500">
                  {order.status}
                </span>
              </div>

              <p className="text-sm">
                Total: R$ {(order.totalCents / 100).toFixed(2)}
              </p>

              <p className="text-xs text-neutral-500">
                Criado em:{" "}
                {order.createdAt.toLocaleDateString("pt-BR")}
              </p>

              <ul className="text-sm list-disc pl-4">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity}× {item.product.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
