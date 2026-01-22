/**
 * Validador de Agendamentos
 * Previne conflitos de horários e valida disponibilidade
 */

import prisma from "@/lib/prisma";
import { ScheduleStatus } from "@prisma/client";

type ScheduleConflict = {
  hasConflict: boolean;
  conflictingSchedule?: {
    id: string;
    startAt: Date;
    endAt: Date;
    serviceName: string;
    customerName?: string;
  };
  message?: string;
};

type AvailabilityCheck = {
  isAvailable: boolean;
  reason?: string;
};

/**
 * Verifica se existe conflito de horário para um funcionário
 */
export async function checkScheduleConflict(
  employeeId: string,
  startAt: Date,
  endAt: Date,
  excludeScheduleId?: string
): Promise<ScheduleConflict> {
  const conflict = await prisma.schedule.findFirst({
    where: {
      employeeId,
      id: excludeScheduleId ? { not: excludeScheduleId } : undefined,
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        // Novo agendamento começa durante um existente
        {
          AND: [
            { startAt: { lte: startAt } },
            { endAt: { gt: startAt } },
          ],
        },
        // Novo agendamento termina durante um existente
        {
          AND: [
            { startAt: { lt: endAt } },
            { endAt: { gte: endAt } },
          ],
        },
        // Novo agendamento engloba um existente
        {
          AND: [
            { startAt: { gte: startAt } },
            { endAt: { lte: endAt } },
          ],
        },
      ],
    },
    include: {
      service: {
        select: { name: true },
      },
      user: {
        select: { name: true },
      },
    },
  });

  if (conflict) {
    return {
      hasConflict: true,
      conflictingSchedule: {
        id: conflict.id,
        startAt: conflict.startAt,
        endAt: conflict.endAt,
        serviceName: conflict.service.name,
        customerName: conflict.user?.name ?? conflict.guestName ?? "Cliente",
      },
      message: `Horário já ocupado por outro agendamento (${conflict.startAt.toLocaleTimeString("pt-BR")} - ${conflict.endAt.toLocaleTimeString("pt-BR")})`,
    };
  }

  return { hasConflict: false };
}

/**
 * Verifica se o funcionário está disponível no horário solicitado
 */
export async function checkEmployeeAvailability(
  employeeId: string,
  startAt: Date,
  endAt: Date
): Promise<AvailabilityCheck> {
  const dayOfWeek = startAt.getDay();
  const startTime = `${String(startAt.getHours()).padStart(2, "0")}:${String(startAt.getMinutes()).padStart(2, "0")}`;
  const endTime = `${String(endAt.getHours()).padStart(2, "0")}:${String(endAt.getMinutes()).padStart(2, "0")}`;

  const availability = await prisma.employeeAvailability.findFirst({
    where: {
      employeeId,
      dayOfWeek,
      active: true,
    },
  });

  if (!availability) {
    return {
      isAvailable: false,
      reason: "Funcionário não trabalha neste dia da semana",
    };
  }

  // Verificar se está dentro do horário de trabalho
  if (startTime < availability.startTime || endTime > availability.endTime) {
    return {
      isAvailable: false,
      reason: `Horário fora do expediente (${availability.startTime} - ${availability.endTime})`,
    };
  }

  // Verificar se não está no horário de almoço
  if (availability.breakStartTime && availability.breakEndTime) {
    if (
      (startTime >= availability.breakStartTime && startTime < availability.breakEndTime) ||
      (endTime > availability.breakStartTime && endTime <= availability.breakEndTime) ||
      (startTime <= availability.breakStartTime && endTime >= availability.breakEndTime)
    ) {
      return {
        isAvailable: false,
        reason: `Horário de almoço do funcionário (${availability.breakStartTime} - ${availability.breakEndTime})`,
      };
    }
  }

  return { isAvailable: true };
}

/**
 * Valida um agendamento completo (disponibilidade + conflitos)
 */
export async function validateSchedule(
  employeeId: string,
  startAt: Date,
  endAt: Date,
  excludeScheduleId?: string
): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  // Validações básicas
  if (startAt >= endAt) {
    errors.push("Data de início deve ser anterior à data de término");
  }

  if (startAt < new Date()) {
    errors.push("Não é possível agendar em datas passadas");
  }

  // Verificar disponibilidade do funcionário
  const availabilityCheck = await checkEmployeeAvailability(
    employeeId,
    startAt,
    endAt
  );

  if (!availabilityCheck.isAvailable) {
    errors.push(availabilityCheck.reason!);
  }

  // Verificar conflitos de horário
  const conflictCheck = await checkScheduleConflict(
    employeeId,
    startAt,
    endAt,
    excludeScheduleId
  );

  if (conflictCheck.hasConflict) {
    errors.push(conflictCheck.message!);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Busca horários disponíveis para um funcionário em um dia específico
 */
export async function getAvailableSlots(
  employeeId: string,
  date: Date,
  serviceDurationMins: number
): Promise<{ startTime: string; endTime: string }[]> {
  const dayOfWeek = date.getDay();

  const availability = await prisma.employeeAvailability.findFirst({
    where: {
      employeeId,
      dayOfWeek,
      active: true,
    },
  });

  if (!availability) {
    return [];
  }

  // Buscar agendamentos existentes neste dia
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existingSchedules = await prisma.schedule.findMany({
    where: {
      employeeId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startAt: { gte: startOfDay, lte: endOfDay },
    },
    select: {
      startAt: true,
      endAt: true,
    },
    orderBy: { startAt: "asc" },
  });

  // Gerar slots de 30 em 30 minutos
  const slots: { startTime: string; endTime: string }[] = [];
  const workStart = parseTime(availability.startTime);
  const workEnd = parseTime(availability.endTime);
  const breakStart = availability.breakStartTime
    ? parseTime(availability.breakStartTime)
    : null;
  const breakEnd = availability.breakEndTime
    ? parseTime(availability.breakEndTime)
    : null;

  let currentMinutes = workStart;

  while (currentMinutes + serviceDurationMins <= workEnd) {
    const slotStart = currentMinutes;
    const slotEnd = currentMinutes + serviceDurationMins;

    // Pular horário de almoço
    if (breakStart && breakEnd) {
      if (
        (slotStart >= breakStart && slotStart < breakEnd) ||
        (slotEnd > breakStart && slotEnd <= breakEnd) ||
        (slotStart <= breakStart && slotEnd >= breakEnd)
      ) {
        currentMinutes += 30;
        continue;
      }
    }

    // Verificar se não conflita com agendamentos existentes
    const slotStartDate = new Date(date);
    slotStartDate.setHours(0, 0, 0, 0);
    slotStartDate.setMinutes(slotStart);

    const slotEndDate = new Date(date);
    slotEndDate.setHours(0, 0, 0, 0);
    slotEndDate.setMinutes(slotEnd);

    const hasConflict = existingSchedules.some((schedule) => {
      return (
        (slotStartDate >= schedule.startAt && slotStartDate < schedule.endAt) ||
        (slotEndDate > schedule.startAt && slotEndDate <= schedule.endAt) ||
        (slotStartDate <= schedule.startAt && slotEndDate >= schedule.endAt)
      );
    });

    if (!hasConflict) {
      slots.push({
        startTime: formatTime(slotStart),
        endTime: formatTime(slotEnd),
      });
    }

    currentMinutes += 30;
  }

  return slots;
}

/**
 * Converte string de tempo para minutos desde meia-noite
 * "09:30" -> 570
 */
function parseTime(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Converte minutos desde meia-noite para string de tempo
 * 570 -> "09:30"
 */
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/**
 * Verifica se um horário está no passado
 */
export function isPastDate(date: Date): boolean {
  return date < new Date();
}

/**
 * Calcula a data de término baseado na duração do serviço
 */
export function calculateEndTime(startAt: Date, durationMins: number): Date {
  const endAt = new Date(startAt);
  endAt.setMinutes(endAt.getMinutes() + durationMins);
  return endAt;
}