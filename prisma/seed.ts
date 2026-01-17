// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

function unsplashPhoto(photoId: string) {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=900&q=80`;
}

async function main() {
  // =========================================================
  // 1) ADMIN (mantendo seu seed base)
  // =========================================================
  const email = "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
    create: {
      name: "Administrador",
      email,
      password: hash,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: {
          gender: "OTHER",
        },
      },
      addresses: {
        create: {
          street: "Admin Street",
          number: "0",
          district: "Admin District",
          city: "Admin City",
          state: "SP",
          zipCode: "00000000",
          country: "BR",
          isDefault: true,
        },
      },
    },
    select: { id: true, email: true },
  });

  console.log("✅ Admin criado/atualizado:", admin.email);

  // =========================================================
  // 2) CUSTOMER (para gerar pedidos)
  // =========================================================
  const customer = await prisma.user.upsert({
    where: { email: "cliente@example.com" },
    update: {
      role: "CUSTOMER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
    create: {
      name: "Cliente Demo",
      email: "cliente@example.com",
      password: await bcrypt.hash("Cliente@123", 10),
      role: "CUSTOMER",
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: { gender: "OTHER" },
      },
      addresses: {
        create: {
          street: "Rua do Cliente",
          number: "123",
          district: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01001000",
          country: "BR",
          isDefault: true,
        },
      },
    },
    select: { id: true, email: true },
  });

  console.log("✅ Customer criado/atualizado:", customer.email);

  // =========================================================
  // 2.5) CATEGORY (ADICIONADO — SEM ALTERAR O RESTO)
  // =========================================================
  const categories = [
    { name: "Roupas", slug: "roupas", description: "Vestuário em geral" },
    { name: "Calçados", slug: "calcados", description: "Tênis e calçados urbanos" },
    { name: "Acessórios", slug: "acessorios", description: "Mochilas e eletrônicos" },
    { name: "Outros", slug: "outros", description: "Outros produtos" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        active: true,
        deletedAt: null,
      },
      create: category,
    });
  }

  const categoryList = await prisma.category.findMany({
    where: { slug: { in: ["roupas", "calcados", "acessorios", "outros"] } },
    select: { id: true, slug: true },
  });

  const categoryBySlug = new Map(categoryList.map(c => [c.slug, c.id]));

  const roupasId = categoryBySlug.get("roupas")!;
  const calcadosId = categoryBySlug.get("calcados")!;
  const acessoriosId = categoryBySlug.get("acessorios")!;
  const outrosId = categoryBySlug.get("outros")!;

  // =========================================================
  // 3) LIMPEZA (idempotência real)
  // =========================================================
  await prisma.order.deleteMany({
    where: {
      OR: [{ userId: customer.id }, { guestEmail: "guest@example.com" }],
    },
  });

  const productNames = [
    "Camiseta Premium",
    "Tênis Urbano",
    "Mochila Tech",
    "Fone Bluetooth",
  ];

  const existingSeedProducts = await prisma.product.findMany({
    where: { name: { in: productNames } },
    select: { id: true },
  });

  if (existingSeedProducts.length > 0) {
    const ids = existingSeedProducts.map((p) => p.id);

    await prisma.productImage.deleteMany({
      where: { productId: { in: ids } },
    });

    await prisma.product.deleteMany({
      where: { id: { in: ids } },
    });
  }

  console.log("✅ Limpeza do seed concluída");

  // =========================================================
  // 4) CRIA PRODUTOS (APENAS categoryId ADICIONADO)
  // =========================================================
  const products = await prisma.product.createMany({
    data: [
      {
        name: "Camiseta Premium",
        description: "Camiseta premium com tecido confortável e caimento moderno.",
        priceCents: 7990,
        stock: 25,
        active: true,
        categoryId: roupasId,
        salesCount: 18,
        ratingAverage: 4.7,
        ratingCount: 142,
        discountPercent: 10,
        hasFreeShipping: true,
        couponCode: "BEMVINDO10",
      },
      {
        name: "Tênis Urbano",
        description: "Tênis versátil para o dia a dia. Confortável e resistente.",
        priceCents: 21990,
        stock: 12,
        active: true,
        categoryId: calcadosId,
        salesCount: 6,
        ratingAverage: 4.4,
        ratingCount: 51,
        discountPercent: null,
        hasFreeShipping: false,
        couponCode: null,
      },
      {
        name: "Mochila Tech",
        description: "Mochila resistente com compartimento para notebook e acessórios.",
        priceCents: 15990,
        stock: 7,
        active: true,
        categoryId: acessoriosId,
        salesCount: 9,
        ratingAverage: 4.6,
        ratingCount: 88,
        discountPercent: 15,
        hasFreeShipping: true,
        couponCode: "TECH15",
      },
      {
        name: "Fone Bluetooth",
        description: "Fone sem fio com boa bateria e graves fortes.",
        priceCents: 12990,
        stock: 30,
        active: true,
        categoryId: outrosId,
        salesCount: 21,
        ratingAverage: 4.5,
        ratingCount: 203,
        discountPercent: 5,
        hasFreeShipping: true,
        couponCode: "SOM5",
      },
    ],
  });

  console.log("✅ Produtos criados:", products.count);

  // Buscar IDs dos produtos pra criar imagens e itens de pedido
  const createdProducts = await prisma.product.findMany({
    where: { name: { in: productNames } },
    select: { id: true, name: true, priceCents: true },
  });

  const byName = new Map(createdProducts.map((p) => [p.name, p]));

  const tshirt = byName.get("Camiseta Premium")!;
  const tenis = byName.get("Tênis Urbano")!;
  const mochila = byName.get("Mochila Tech")!;
  const fone = byName.get("Fone Bluetooth")!;

  // =========================================================
  // 5) IMAGENS DO PRODUTO (ProductImage) — compatível schema
  // =========================================================
  await prisma.productImage.createMany({
  data: [
    // Camiseta
    { productId: tshirt.id, position: 0, url: unsplashPhoto("1520975958225-7f0f0a0ab262") },
    { productId: tshirt.id, position: 1, url: unsplashPhoto("1521572163474-6864f9cf17ab") },

    // Tênis
    { productId: tenis.id, position: 0, url: unsplashPhoto("1528701800489-20be9c76c00d") },
    { productId: tenis.id, position: 1, url: unsplashPhoto("1542291026-7eec264c27ff") },

    // Mochila
    { productId: mochila.id, position: 0, url: unsplashPhoto("1526481280695-3c687fd643ed") },
    { productId: mochila.id, position: 1, url: unsplashPhoto("1553062407-98eeb64c6a62") },

    // Fone
    { productId: fone.id, position: 0, url: unsplashPhoto("1484704849700-f032a568e944") },
    { productId: fone.id, position: 1, url: unsplashPhoto("1518441902117-f0a75f2489a1") },
  ],
});


  console.log("✅ Imagens criadas");

  // =========================================================
  // 6) PEDIDOS (customer + guest)
  // =========================================================

  // Pedido 1 (customer) - PENDING
  const pendingTotalCents = tshirt.priceCents + tenis.priceCents;

  const orderPending = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "PENDING",
      totalCents: pendingTotalCents,
      currency: "BRL",
      items: {
        create: [
          { productId: tshirt.id, quantity: 1, priceCents: tshirt.priceCents },
          { productId: tenis.id, quantity: 1, priceCents: tenis.priceCents },
        ],
      },
    },
    select: { id: true, status: true },
  });

  // Pedido 2 (customer) - PAID com pagamento
  const paidTotalCents = mochila.priceCents + tshirt.priceCents * 2;

  const orderPaid = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "PAID",
      totalCents: paidTotalCents,
      currency: "BRL",
      items: {
        create: [
          { productId: mochila.id, quantity: 1, priceCents: mochila.priceCents },
          { productId: tshirt.id, quantity: 2, priceCents: tshirt.priceCents },
        ],
      },
      payments: {
        create: [
          {
            method: "PIX",
            status: "PAID",
            amountCents: paidTotalCents,
            mpPaymentId: "MP_SEED_PAID_001",
            rawPayload: { seed: true },
          },
        ],
      },
    },
    select: { id: true, status: true },
  });

  // Pedido 3 (guest) - CANCELLED com pagamento cancelado
  const guestTotalCents = fone.priceCents;

  const orderGuestCancelled = await prisma.order.create({
    data: {
      guestFullName: "Cliente Visitante",
      guestEmail: "guest@example.com",
      guestCpf: "00000000000",
      guestPhone: "+5511999999999",
      status: "CANCELLED",
      totalCents: guestTotalCents,
      currency: "BRL",
      items: {
        create: [
          { productId: fone.id, quantity: 1, priceCents: fone.priceCents },
        ],
      },
      payments: {
        create: [
          {
            method: "BOLETO",
            status: "CANCELLED",
            amountCents: guestTotalCents,
            mpPaymentId: "MP_SEED_CANCELLED_001",
            rawPayload: { seed: true },
          },
        ],
      },
    },
    select: { id: true, status: true },
  });

  // Pedido 4 (customer) - REFUNDED com pagamento refund
  const refundedTotalCents = tenis.priceCents;

  const orderRefunded = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "REFUNDED",
      totalCents: refundedTotalCents,
      currency: "BRL",
      items: {
        create: [
          { productId: tenis.id, quantity: 1, priceCents: tenis.priceCents },
        ],
      },
      payments: {
        create: [
          {
            method: "CREDIT_CARD",
            status: "REFUNDED",
            amountCents: refundedTotalCents,
            mpPaymentId: "MP_SEED_REFUNDED_001",
            rawPayload: { seed: true },
          },
        ],
      },
    },
    select: { id: true, status: true },
  });

  console.log("✅ Pedidos criados:");
  console.log(" -", orderPending.id, orderPending.status);
  console.log(" -", orderPaid.id, orderPaid.status);
  console.log(" -", orderGuestCancelled.id, orderGuestCancelled.status);
  console.log(" -", orderRefunded.id, orderRefunded.status);

  console.log("✅ Seed finalizada com sucesso.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
