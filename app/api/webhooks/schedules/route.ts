import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook para confirmar ou cancelar agendamentos após pagamento
 * 
 * Fluxo:
 * 1. Usuário cria agendamento (status: PENDING)
 * 2. Usuário é redirecionado ao checkout com orderId
 * 3. MercadoPago confirma pagamento
 * 4. Webhook do MercadoPago atualiza o Order com status PAID
 * 5. Este endpoint é chamado para:
 *    - CONFIRMAR o agendamento se o pagamento foi aprovado
 *    - CANCELAR o agendamento se o pagamento falhou
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      scheduleId,
      orderId,
      paymentStatus, // PAID | FAILED | CANCELLED
      action, // CONFIRM | CANCEL
    } = body;

    // Validação
    if (!scheduleId && !orderId) {
      return NextResponse.json(
        { error: "scheduleId ou orderId é obrigatório" },
        { status: 400 }
      );
    }

    if (!action || !["CONFIRM", "CANCEL"].includes(action)) {
      return NextResponse.json(
        { error: "action deve ser CONFIRM ou CANCEL" },
        { status: 400 }
      );
    }

    let schedule;

    // Encontrar agendamento
    if (scheduleId) {
      schedule = await prisma.schedule.findUnique({
        where: { id: scheduleId },
        include: { order: true, service: true },
      });
    } else if (orderId) {
      // Encontrar agendamento através do orderId
      schedule = await prisma.schedule.findFirst({
        where: { orderId },
        include: { order: true, service: true },
      });
    }

    if (!schedule) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // CONFIRMAR AGENDAMENTO
    if (action === "CONFIRM") {
      if (paymentStatus && paymentStatus !== "PAID") {
        return NextResponse.json(
          { error: "Apenas pagamentos PAID podem confirmar agendamentos" },
          { status: 400 }
        );
      }

      const updatedSchedule = await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          status: "CONFIRMED",
        },
        include: {
          order: true,
          service: true,
          employee: true,
          user: true,
        },
      });

      // TODO: Enviar email de confirmação
      // await sendScheduleConfirmationEmail(updatedSchedule);

      return NextResponse.json({
        success: true,
        message: "Agendamento confirmado",
        schedule: {
          id: updatedSchedule.id,
          status: updatedSchedule.status,
          startAt: updatedSchedule.startAt,
          serviceName: updatedSchedule.service.name,
          confirmationCode: updatedSchedule.id.slice(0, 8).toUpperCase(),
        },
      });
    }

    // CANCELAR AGENDAMENTO
    if (action === "CANCEL") {
      const updatedSchedule = await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          status: "CANCELLED",
        },
        include: {
          order: true,
          service: true,
        },
      });

      // TODO: Enviar email de cancelamento
      // await sendScheduleCancellationEmail(updatedSchedule);

      return NextResponse.json({
        success: true,
        message: "Agendamento cancelado",
        schedule: {
          id: updatedSchedule.id,
          status: updatedSchedule.status,
        },
      });
    }

    return NextResponse.json(
      { error: "Ação inválida" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Erro ao processar webhook de agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao processar webhook" },
      { status: 500 }
    );
  }
}

/**
 * Valida e reprocess agendamentos pendentes
 * Útil para sincronizar estado em caso de inconsistências
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { scheduleId } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { error: "scheduleId é obrigatório" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { order: true },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 }
      );
    }

    // Se há um orderId, verificar status do pagamento
    if (schedule.orderId && schedule.order) {
      const orderStatus = schedule.order.status;

      // Se pagamento foi feito, confirmar agendamento
      if (orderStatus === "PAID" && schedule.status === "PENDING") {
        await prisma.schedule.update({
          where: { id: scheduleId },
          data: {
            status: "CONFIRMED",
          },
        });

        return NextResponse.json({
          success: true,
          message: "Agendamento sincronizado e confirmado",
        });
      }

      // Se pagamento foi cancelado/refundado, cancelar agendamento
      if (
        ["CANCELLED", "REFUNDED"].includes(orderStatus) &&
        schedule.status === "CONFIRMED"
      ) {
        await prisma.schedule.update({
          where: { id: scheduleId },
          data: {
            status: "CANCELLED",
          },
        });

        return NextResponse.json({
          success: true,
          message: "Agendamento cancelado por falta de pagamento",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Agendamento já está em estado correto",
      schedule: {
        id: schedule.id,
        status: schedule.status,
      },
    });
  } catch (error) {
    console.error("Erro ao validar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao validar agendamento" },
      { status: 500 }
    );
  }
}
