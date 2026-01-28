import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { position: "asc" },
          select: { path: true, storage: true, position: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await params;
    const body = await request.json();
    const { name, description, categoryId, durationMins, priceCents, active, images } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o serviço existe
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Deletar imagens antigas
    await prisma.serviceImage.deleteMany({
      where: { serviceId: id },
    });

    // Atualizar serviço
    if (!categoryId) {
      return NextResponse.json(
        { error: "Categoria é obrigatória" },
        { status: 400 }
      );
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        categoryId,
        durationMins: durationMins || 30,
        priceCents: priceCents || 0,
        active: active ?? true,
        images: {
          createMany: {
            data: images?.map((img: { url: string; position: number }) => ({
              path: img.url,
              storage: img.url.startsWith("http") ? "R2" : "LOCAL",
              position: img.position,
            })) || [],
          },
        },
      },
      include: {
        images: {
          orderBy: { position: "asc" },
          select: { path: true, storage: true, position: true },
        },
      },
    });

    return NextResponse.json({
      ...updatedService,
      images: updatedService.images.map((img) => ({
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
    console.error("Erro ao atualizar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar serviço" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) return admin.response;

    const { id } = await params;

    // Verificar se o serviço existe
    const existingService = await prisma.service.findUnique({
      where: { id },
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }

    // Deletar serviço (imagens são deletadas automaticamente via cascade)
    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar serviço:", error);
    return NextResponse.json(
      { error: "Erro ao deletar serviço" },
      { status: 500 }
    );
  }
}
