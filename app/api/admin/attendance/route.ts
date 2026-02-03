import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Concluído",
  NO_SHOW: "Não compareceu",
};

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");
    const view = searchParams.get("view") || "day";

    const now = new Date();
    const month = monthParam ? Number(monthParam) : now.getMonth();
    const year = yearParam ? Number(yearParam) : now.getFullYear();

    const startOfPeriod = new Date(year, month, 1);
    const endOfPeriod = new Date(year, month + 1, 1);

    const schedules = await prisma.schedule.findMany({
      where: {
        startAt: { gte: startOfPeriod, lt: endOfPeriod },
        ...(employeeId && employeeId !== "unassigned" ? { employeeId } : {}),
        ...(employeeId === "unassigned" ? { employeeId: null } : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            priceCents: true,
          },
        },
        order: {
          select: {
            id: true,
            status: true,
            totalCents: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    });

    const professionalsSource = await prisma.schedule.findMany({
      where: {
        startAt: { gte: startOfPeriod, lt: endOfPeriod },
        employeeId: { not: null },
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const byDayMap = new Map<string, { date: string; count: number; revenue: number }>();
    const byMonthMap = new Map<string, { month: string; count: number; revenue: number }>();
    const statusCounts: Record<string, number> = {};
    const professionalsMap = new Map<string, { id: string; name: string; count: number; totalDuration: number; revenue: number }>();

    let totalDuration = 0;
    let totalRevenueCents = 0;

    schedules.forEach((schedule) => {
      const durationMins = Math.max(0, Math.round((new Date(schedule.endAt).getTime() - new Date(schedule.startAt).getTime()) / (1000 * 60)));
      const revenueCents = schedule.order?.totalCents ?? schedule.service?.priceCents ?? 0;

      totalDuration += durationMins;
      totalRevenueCents += revenueCents;

      const dayKey = schedule.startAt.toISOString().split("T")[0];
      const monthKey = `${schedule.startAt.getFullYear()}-${String(schedule.startAt.getMonth() + 1).padStart(2, "0")}`;
      const dayEntry = byDayMap.get(dayKey) ?? { date: dayKey, count: 0, revenue: 0 };
      dayEntry.count += 1;
      dayEntry.revenue += revenueCents / 100;
      byDayMap.set(dayKey, dayEntry);

      const monthEntry = byMonthMap.get(monthKey) ?? { month: monthKey, count: 0, revenue: 0 };
      monthEntry.count += 1;
      monthEntry.revenue += revenueCents / 100;
      byMonthMap.set(monthKey, monthEntry);

      statusCounts[schedule.status] = (statusCounts[schedule.status] ?? 0) + 1;

      const profId = schedule.employee?.id ?? "sem-profissional";
      const profName = schedule.employee?.name ?? "Sem profissional";
      const profEntry = professionalsMap.get(profId) ?? {
        id: profId,
        name: profName,
        count: 0,
        totalDuration: 0,
        revenue: 0,
      };
      profEntry.count += 1;
      profEntry.totalDuration += durationMins;
      profEntry.revenue += revenueCents / 100;
      professionalsMap.set(profId, profEntry);
    });

    const professionals = Array.from(
      professionalsSource.reduce((acc, schedule) => {
        if (!schedule.employee) return acc;
        acc.set(schedule.employee.id, schedule.employee.name ?? "Sem profissional");
        return acc;
      }, new Map<string, string>())
    )
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    function formatDateKey(date: Date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }

    const byDay = [] as { date: string; count: number; revenue: number }[];
    for (let cursor = new Date(startOfPeriod); cursor < endOfPeriod; cursor.setDate(cursor.getDate() + 1)) {
      const key = formatDateKey(cursor);
      const entry = byDayMap.get(key) ?? { date: key, count: 0, revenue: 0 };
      byDay.push(entry);
    }

    const byMonth = Array.from(byMonthMap.values()).sort(
      (a, b) => a.month.localeCompare(b.month)
    );

    const schedulesList = schedules.map((schedule) => ({
      id: schedule.id,
      startAt: schedule.startAt,
      endAt: schedule.endAt,
      status: schedule.status,
      paid: schedule.order?.status === "PAID",
      orderStatus: schedule.order?.status ?? null,
      customerName: schedule.user?.name ?? schedule.guestName ?? "Cliente",
      employeeName: schedule.employee?.name ?? "Sem profissional",
      serviceName: schedule.service?.name ?? "Serviço",
    }));

    const byStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      label: statusLabels[status] ?? status,
      count,
    }));

    const byProfessional = Array.from(professionalsMap.values())
      .map((prof) => ({
        id: prof.id,
        name: prof.name,
        count: prof.count,
        avgDuration: prof.count ? Math.round(prof.totalDuration / prof.count) : 0,
        revenue: prof.revenue,
      }))
      .sort((a, b) => b.count - a.count);

    const totals = {
      total: schedules.length,
      pending: statusCounts.PENDING ?? 0,
      completed: statusCounts.COMPLETED ?? 0,
      averageDuration: schedules.length ? Math.round(totalDuration / schedules.length) : 0,
      totalRevenue: totalRevenueCents / 100,
    };

    return NextResponse.json({
      totals,
      byDay,
      byMonth,
      byStatus,
      byProfessional,
      professionals,
      schedulesList,
      period: {
        month,
        year,
        view,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados de atendimentos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados de atendimentos" },
      { status: 500 }
    );
  }
}
