// app/api/admin/schedules/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) return admin.response;

  const { searchParams } = new URL(req.url);

  const employeeId = searchParams.get("employeeId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  const schedules = await prisma.schedule.findMany({
    where: {
      ...(employeeId ? { employeeId } : {}),
      ...(start && end
        ? {
            startAt: { gte: new Date(start) },
            endAt: { lte: new Date(end) },
          }
        : {}),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      employee: {
        select: { id: true, name: true, email: true },
      },
      service: {
        select: { id: true, name: true },
      },
      order: {
        select: { id: true, status: true },
      },
    },
    orderBy: {
      startAt: "asc",
    },
  });

  return NextResponse.json(schedules);
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const body = await req.json();
    const {
      userId,
      guestName,
      guestEmail,
      guestPhone,
      serviceId,
      employeeId,
      startAt,
      endAt,
      notes,
    } = body ?? {};

    if (!serviceId) {
      return NextResponse.json({ error: "serviceId é obrigatório" }, { status: 400 });
    }

    if (!startAt || !endAt) {
      return NextResponse.json({ error: "startAt e endAt são obrigatórios" }, { status: 400 });
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return NextResponse.json({ error: "Datas inválidas" }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json({ error: "endAt deve ser maior que startAt" }, { status: 400 });
    }

    const schedule = await prisma.schedule.create({
      data: {
        userId: userId || null,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        serviceId,
        employeeId: employeeId || null,
        startAt: start,
        endAt: end,
        notes: notes || null,
        createdByUserId: admin.session.user.id,
        createdByRole: admin.session.user.role,
      },
    });

    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar agendamento:", error);
    return NextResponse.json({ error: "Erro ao criar agendamento" }, { status: 500 });
  }
}
