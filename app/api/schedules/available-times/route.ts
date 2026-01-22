import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AvailableSlot {
  time: string; // HH:MM format
  timestamp: number; // ISO timestamp
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date"); // YYYY-MM-DD
    const employeeId = searchParams.get("employeeId"); // opcional

    if (!serviceId || !date) {
      return NextResponse.json(
        { error: "serviceId e date são obrigatórios" },
        { status: 400 }
      );
    }

    // Validar data
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        { error: "Data inválida" },
        { status: 400 }
      );
    }

    // Não permitir datas no passado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return NextResponse.json(
        { error: "Não é possível agendar para datas passadas" },
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

    // Obter disponibilidade do funcionário
    const dayOfWeek = selectedDate.getDay();

    let availability;
    if (employeeId) {
      availability = await prisma.employeeAvailability.findUnique({
        where: {
          employeeId_dayOfWeek: {
            employeeId,
            dayOfWeek,
          },
        },
      });
    } else {
      // Se não houver employee específico, pegar qualquer disponibilidade para o dia
      availability = await prisma.employeeAvailability.findFirst({
        where: {
          dayOfWeek,
          active: true,
        },
      });
    }

    if (!availability || !availability.active) {
      return NextResponse.json(
        { availableTimes: [], message: "Sem disponibilidade para este dia" },
        { status: 200 }
      );
    }

    // Parse dos horários
    const [startHour, startMin] = availability.startTime.split(":").map(Number);
    const [endHour, endMin] = availability.endTime.split(":").map(Number);

    let breakStartTime: Date | null = null;
    let breakEndTime: Date | null = null;

    if (availability.breakStartTime && availability.breakEndTime) {
      const [breakStartHour, breakStartMin] = availability.breakStartTime.split(":").map(Number);
      const [breakEndHour, breakEndMin] = availability.breakEndTime.split(":").map(Number);

      breakStartTime = new Date(selectedDate);
      breakStartTime.setHours(breakStartHour, breakStartMin, 0, 0);

      breakEndTime = new Date(selectedDate);
      breakEndTime.setHours(breakEndHour, breakEndMin, 0, 0);
    }

    // Gerar slots de horários
    const slots: AvailableSlot[] = [];
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(endHour, endMin, 0, 0);

    let currentTime = new Date(startDateTime);

    while (currentTime < endDateTime) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMins);

      // Verificar se está dentro do intervalo de pausa
      const isInBreak =
        breakStartTime &&
        breakEndTime &&
        currentTime >= breakStartTime &&
        currentTime < breakEndTime;

      if (!isInBreak && slotEnd <= endDateTime) {
        const timeStr = currentTime.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        slots.push({
          time: timeStr,
          timestamp: currentTime.getTime(),
        });
      }

      currentTime.setMinutes(currentTime.getMinutes() + 30); // Incrementar em 30min
    }

    // Filtrar slots que já têm agendamentos confirmados
    if (employeeId) {
      const existingSchedules = await prisma.schedule.findMany({
        where: {
          employeeId,
          startAt: {
            gte: startDateTime,
            lt: endDateTime,
          },
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
      });

      const bookedTimes = new Set(
        existingSchedules.map((s) => s.startAt.getTime())
      );

      return NextResponse.json({
        availableTimes: slots.filter((slot) => !bookedTimes.has(slot.timestamp)),
        serviceName: service.name,
        durationMins,
      });
    }

    return NextResponse.json({
      availableTimes: slots,
      serviceName: service.name,
      durationMins,
    });
  } catch (error) {
    console.error("Erro ao buscar horários disponíveis:", error);
    return NextResponse.json(
      { error: "Erro ao buscar horários disponíveis" },
      { status: 500 }
    );
  }
}
