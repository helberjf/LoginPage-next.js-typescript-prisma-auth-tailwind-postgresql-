import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const stockMovementSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  type: z.enum(["ENTRY", "EXIT", "ADJUSTMENT"]),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  reason: z.string().min(1, "Motivo é obrigatório"),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Não autorizado. Apenas administradores podem realizar movimentações de estoque." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = stockMovementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { productId, type, quantity, reason, notes } = validation.data;

    const userId = session.user.id
      ?? (session.user.email
        ? (await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } }))?.id
        : null);

    if (!userId) {
      return NextResponse.json(
        { error: "Não foi possível identificar o usuário" },
        { status: 401 }
      );
    }

    // Verificar se o produto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Calcular nova quantidade de estoque
    let newStock = product.stock;
    let adjustedQuantity = quantity;

    if (type === "ENTRY") {
      newStock += quantity;
    } else if (type === "EXIT") {
      newStock -= quantity;
      adjustedQuantity = -quantity; // Negativo para saída
    } else if (type === "ADJUSTMENT") {
      // Para ajuste, a quantidade é o valor final desejado
      adjustedQuantity = quantity - product.stock;
      newStock = quantity;
    }

    if (newStock < 0) {
      return NextResponse.json(
        { error: "Estoque não pode ficar negativo" },
        { status: 400 }
      );
    }

    // Usar transação para garantir consistência
    const result = await prisma.$transaction([
      // Criar registro de movimentação
      prisma.stockMovement.create({
        data: {
          productId,
          type,
          quantity: adjustedQuantity,
          reason,
          notes: notes || null,
          userId,
        },
        include: {
          product: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      // Atualizar estoque do produto
      prisma.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
    ]);

    return NextResponse.json({
      success: true,
      movement: result[0],
      newStock,
    });
  } catch (error) {
    console.error("Erro ao criar movimentação de estoque:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021") {
        return NextResponse.json(
          { error: "Tabela de movimentações não encontrada. Rode as migrações do Prisma." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: "Erro ao processar movimentação de estoque",
          code: error.code,
          meta: process.env.NODE_ENV === "development" ? error.meta : undefined,
        },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          error: "Erro de validação Prisma",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao processar movimentação de estoque" },
      { status: 500 }
    );
  }
}

// Listar histórico de movimentações
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const parsedLimit = parseInt(searchParams.get("limit") || "50");
    const limit = Number.isNaN(parsedLimit) ? 50 : parsedLimit;

    const movements = await prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: {
        product: {
          select: {
            name: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ movements });
  } catch (error) {
    console.error("Erro ao buscar movimentações:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021") {
        return NextResponse.json(
          { error: "Tabela de movimentações não encontrada. Rode as migrações do Prisma." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: "Erro ao buscar movimentações",
          code: error.code,
          meta: process.env.NODE_ENV === "development" ? error.meta : undefined,
        },
        { status: 500 }
      );
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          error: "Erro de validação Prisma",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao buscar movimentações" },
      { status: 500 }
    );
  }
}
