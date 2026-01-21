// app/api/admin/schedules/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // ajuste se seu path for outro

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const employeeId = searchParams.get("employeeId");
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!employeeId) {
    return NextResponse.json(
      { error: "employeeId é obrigatório" },
      { status: 400 }
    );
  }

  const schedules = await prisma.schedule.findMany({
    where: {
      employeeId,
      ...(start && end
        ? {
            startAt: { gte: new Date(start) },
            endAt: { lte: new Date(end) },
          }
        : {}),
    },
    include: {
      user: {
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
