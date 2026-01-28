import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { position: "asc" },
          select: { path: true, storage: true, position: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const servicesWithUrls = services.map((service) => ({
      ...service,
      images: service.images.map((img) => ({
        url:
          img.storage === "R2" || img.path.startsWith("http")
            ? img.path
            : img.path.startsWith("/uploads/")
            ? img.path
            : `/uploads/${img.path}`,
        position: img.position,
      })),
    }));

    return NextResponse.json(servicesWithUrls);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
      { status: 500 }
    );
  }
}
