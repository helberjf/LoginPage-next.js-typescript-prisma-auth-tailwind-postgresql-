import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      serviceId,
      date,
      time,
      employeeId,
      notes,
      guestName,
      guestEmail,
      guestPhone,
    } = body;

    // Validação básica
    if (!serviceId || !date || !time) {
      return NextResponse.json(
        { error: "serviceId, date e time são obrigatórios" },
        { status: 400 }
      );
    }

    if (!guestEmail) {
      return NextResponse.json(
        { error: "Email obrigatório" },
        { status: 401 }
      );
    }

    // Validar data e hora
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        { error: "Data inválida" },
        { status: 400 }
      );
    }

    // Parse da hora
    const [hours, mins] = time.split(":").map(Number);
    selectedDate.setHours(hours, mins, 0, 0);

    const now = new Date();
    if (selectedDate <= now) {
      return NextResponse.json(
        { error: "Horário não pode estar no passado" },
        { status: 400 }
      );
    }

    // Obter o serviço
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service || !service.active) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    const durationMins = service.durationMins || 30;
    const endTime = new Date(selectedDate);
    endTime.setMinutes(endTime.getMinutes() + durationMins);

    // REVALIDAÇÃO: Verificar disponibilidade
    let conflictingSchedules = [];

    if (employeeId) {
      conflictingSchedules = await prisma.schedule.findMany({
        where: {
          employeeId,
          startAt: {
            lt: endTime,
          },
          endAt: {
            gt: selectedDate,
          },
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
      });
    } else {
      // Se não há employee específico, apenas validar que não haja conflito de serviço
      conflictingSchedules = await prisma.schedule.findMany({
        where: {
          serviceId,
          startAt: {
            lt: endTime,
          },
          endAt: {
            gt: selectedDate,
          },
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
      });
    }

    if (conflictingSchedules.length > 0) {
      return NextResponse.json(
        {
          error: "Horário não está mais disponível",
          availableAfter: conflictingSchedules[0].endAt,
        },
        { status: 409 }
      );
    }

    // CRIAR AGENDAMENTO
    const schedule = await prisma.schedule.create({
      data: {
        serviceId,
        startAt: selectedDate,
        endAt: endTime,
        employeeId: employeeId || null,
        userId: null,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        notes: notes || null,
        type: "SERVICE",
        status: "PENDING",
        createdByRole: "CUSTOMER",
      },
      include: {
        service: true,
      },
    });

    return NextResponse.json({
      success: true,
      schedule: {
        id: schedule.id,
        startAt: schedule.startAt,
        endAt: schedule.endAt,
        serviceName: schedule.service.name,
        priceCents: schedule.service.priceCents,
      },
    });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    );
  }
}
