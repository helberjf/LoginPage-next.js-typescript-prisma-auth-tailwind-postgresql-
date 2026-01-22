// app/api/schedules/create/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createScheduleSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Hora é obrigatória"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = createScheduleSchema.parse(body);

    // Combinar data e hora
    const dateTime = new Date(`${validatedData.date}T${validatedData.time}`);

    // Verificar se a data é futura
    if (dateTime <= new Date()) {
      return NextResponse.json(
        { error: "A data e hora devem ser no futuro" },
        { status: 400 }
      );
    }

    // Verificar se já existe um agendamento no mesmo horário
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        startAt: dateTime,
        status: { not: "CANCELLED" },
      },
    });

    if (existingSchedule) {
      return NextResponse.json(
        { error: "Horário já ocupado" },
        { status: 409 }
      );
    }

    // Criar agendamento para visitante (guest)
    const schedule = await prisma.schedule.create({
      data: {
        type: "SERVICE",
        status: "PENDING",
        startAt: dateTime,
        endAt: new Date(dateTime.getTime() + 60 * 60 * 1000), // 1 hora
        guestName: validatedData.name,
        guestPhone: validatedData.phone,
        notes: `Agendamento de visitante: ${validatedData.name} - ${validatedData.email} - Serviço: ${validatedData.serviceId}`,
      },
    });

    return NextResponse.json({
      message: "Agendamento criado com sucesso",
      scheduleId: schedule.id,
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Dados inválidos fornecidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}