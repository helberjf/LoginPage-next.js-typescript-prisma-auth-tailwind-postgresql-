import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
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
    });

    if (!service || !service.active) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviço" },
      { status: 500 }
    );
  }
}
