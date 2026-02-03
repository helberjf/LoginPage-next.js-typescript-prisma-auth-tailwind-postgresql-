import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const scheduleId = body?.scheduleId as string | undefined;

    if (!scheduleId) {
      return NextResponse.json(
        { error: "scheduleId é obrigatório" },
        { status: 400 }
      );
    }

    const schedule = await prisma.schedule.findFirst({
      where: {
        id: scheduleId,
        userId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        startAt: true,
      },
    });

    if (!schedule) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    if (!['PENDING', 'CONFIRMED'].includes(schedule.status)) {
      return NextResponse.json(
        { error: "Agendamento não pode ser cancelado" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (schedule.startAt <= now) {
      return NextResponse.json(
        { error: "Agendamento já ocorreu ou está em andamento" },
        { status: 400 }
      );
    }

    await prisma.schedule.update({
      where: { id: scheduleId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar agendamento" },
      { status: 500 }
    );
  }
}