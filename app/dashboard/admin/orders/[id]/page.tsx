// app/dashboard/admin/orders/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Package, User, CreditCard, Mail, Phone, AlertCircle } from "lucide-react";

function statusColor(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "PAID":
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    case "CANCELLED":
      return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
}

function statusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Pendente";
    case "PAID":
      return "Pago";
    case "CANCELLED":
      return "Cancelado";
    default:
      return status;
  }
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return (
        <section className="space-y-4 p-2 sm:p-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/admin/orders"
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-base font-semibold">Pedido Não Encontrado</h1>
          </div>
          
          <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/40">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span>Pedido #{params.id.slice(-8)} não encontrado no sistema.</span>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="space-y-4 p-2 sm:p-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/orders"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-base font-semibold">Detalhes do Pedido</h1>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-3 py-1 text-sm font-medium ${statusColor(
              order.status
            )}`}
          >
            {statusLabel(order.status)}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Pedido #{order.id.slice(-8)}
          </span>
        </div>

        {/* Customer Info */}
        <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <User className="w-4 h-4" />
            Informações do Cliente
          </h2>
          
          {order.user ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Nome:</span> {order.user.name || "Não informado"}
              </div>
              <div>
                <span className="font-medium">Email:</span> {order.user.email || "Não informado"}
              </div>
              {order.user.profile?.phone && (
                <div>
                  <span className="font-medium">Telefone:</span> {order.user.profile.phone}
                </div>
              )}
              {order.user.profile?.cpf && (
                <div>
                  <span className="font-medium">CPF:</span> {order.user.profile.cpf}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Nome:</span> {order.guestFullName || "Não informado"}
              </div>
              <div>
                <span className="font-medium">Email:</span> {order.guestEmail || "Não informado"}
              </div>
              {order.guestPhone && (
                <div>
                  <span className="font-medium">Telefone:</span> {order.guestPhone}
                </div>
              )}
              {order.guestCpf && (
                <div>
                  <span className="font-medium">CPF:</span> {order.guestCpf}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Package className="w-4 h-4" />
            Itens do Pedido ({order.items.length})
          </h2>
          
          {order.items.length > 0 ? (
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border border-gray-100 p-3 dark:border-gray-800"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/dashboard/admin/products/${item.productId}`}
                      className="block truncate text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {item.product?.name || "Produto não encontrado"}
                    </Link>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {item.quantity}x R$ {(item.priceCents / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    R$ {((item.priceCents * item.quantity) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Nenhum item encontrado neste pedido.
            </div>
          )}
        </div>

        {/* Payments */}
        {order.payments && order.payments.length > 0 && (
          <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="w-4 h-4" />
              Pagamentos ({order.payments.length})
            </h2>
            
            <div className="space-y-2">
              {order.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-md border border-gray-100 p-3 dark:border-gray-800"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {payment.method || "Método não informado"}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Status: {payment.status || "Não informado"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="rounded-md border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-sm font-semibold">Resumo do Pedido</h2>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Data do Pedido:</span>
              <span>{order.createdAt.toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex justify-between">
              <span>Última Atualização:</span>
              <span>{order.updatedAt.toLocaleDateString("pt-BR")}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total:</span>
              <span>R$ {(order.totalCents / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    
    return (
      <section className="space-y-4 p-2 sm:p-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/admin/orders"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-base font-semibold">Erro ao Carregar Pedido</h1>
        </div>
        
        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/40">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span>Ocorreu um erro ao carregar os detalhes do pedido. Tente novamente.</span>
          </div>
        </div>
      </section>
    );
  }
}
