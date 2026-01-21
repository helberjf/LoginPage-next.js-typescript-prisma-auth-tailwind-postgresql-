// app/api/schedules/assign/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const { scheduleId } = body;

  if (!scheduleId) {
    return NextResponse.json(
      { error: "scheduleId é obrigatório" },
      { status: 400 }
    );
  }

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule) {
    return NextResponse.json(
      { error: "Agendamento não encontrado" },
      { status: 404 }
    );
  }

  if (schedule.employeeId) {
    return NextResponse.json(
      { error: "Agendamento já possui funcionário" },
      { status: 400 }
    );
  }

  // Buscar funcionários ativos
  const employees = await prisma.user.findMany({
    where: {
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  for (const employee of employees) {
    const conflict = await prisma.schedule.findFirst({
      where: {
        employeeId: employee.id,
        status: { notIn: ["CANCELLED"] },
        startAt: { lt: schedule.endAt },
        endAt: { gt: schedule.startAt },
      },
    });

    if (!conflict) {
      const updated = await prisma.schedule.update({
        where: { id: schedule.id },
        data: {
          employeeId: employee.id,
          status: "CONFIRMED",
        },
      });

      return NextResponse.json(updated);
    }
  }

  return NextResponse.json(
    { error: "Nenhum funcionário disponível nesse horário" },
    { status: 409 }
  );
}
