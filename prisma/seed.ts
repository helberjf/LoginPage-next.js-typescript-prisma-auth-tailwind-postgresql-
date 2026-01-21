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
        create: { 
          gender: "OTHER",
          phone: "+5532999887766",
        },
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
// 2.1) EMPLOYEES / FUNCIONÁRIOS (STAFF) – SEM SENHA
// =========================================================
  const employee1 = await prisma.user.upsert({
    where: { email: "funcionario1@example.com" },
    update: {
      role: "STAFF",
      status: "ACTIVE",
      emailVerified: null, // sem login
    },
    create: {
      name: "Funcionário 1",
      email: "funcionario1@example.com",
      role: "STAFF",
      status: "ACTIVE",
      emailVerified: null,
      profile: {
        create: {
          gender: "OTHER",
          phone: "+5511981111111",
        },
      },
    },
    select: { id: true, email: true },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: "funcionario2@example.com" },
    update: {
      role: "STAFF",
      status: "ACTIVE",
      emailVerified: null,
    },
    create: {
      name: "Funcionário 2",
      email: "funcionario2@example.com",
      role: "STAFF",
      status: "ACTIVE",
      emailVerified: null,
      profile: {
        create: {
          gender: "OTHER",
          phone: "+5511982222222",
        },
      },
    },
    select: { id: true, email: true },
  });

  console.log("✅ Funcionários criados:", employee1.email, employee2.email);


  // =========================================================
  // 2.5) CATEGORY (COM ATENDIMENTO)
  // =========================================================
  const categories = [
    { name: "Roupas", slug: "roupas", description: "Vestuário em geral" },
    { name: "Calçados", slug: "calcados", description: "Tênis e calçados urbanos" },
    { name: "Acessórios", slug: "acessorios", description: "Mochilas e eletrônicos" },
    { name: "Atendimento", slug: "atendimento", description: "Serviços de manutenção e conserto" },
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
    where: { slug: { in: ["roupas", "calcados", "acessorios", "atendimento", "outros"] } },
    select: { id: true, slug: true },
  });

  const categoryBySlug = new Map(categoryList.map(c => [c.slug, c.id]));

  const roupasId = categoryBySlug.get("roupas")!;
  const calcadosId = categoryBySlug.get("calcados")!;
  const acessoriosId = categoryBySlug.get("acessorios")!;
  const atendimentoId = categoryBySlug.get("atendimento")!;
  const outrosId = categoryBySlug.get("outros")!;

  // =========================================================
  // 3) LIMPEZA (idempotência real)
  // =========================================================
  await prisma.schedule.deleteMany({
    where: { userId: customer.id },
  });

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
    "Conserto de Placa",
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
  // 4) CRIA PRODUTOS (COM SERVIÇO DE CONSERTO)
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
      {
        name: "Conserto de Placa",
        description: "Serviço especializado de manutenção e conserto de placas eletrônicas. Diagnóstico completo, troca de componentes e testes de qualidade.",
        priceCents: 15000,
        stock: 999,
        active: true,
        categoryId: atendimentoId,
        salesCount: 34,
        ratingAverage: 4.8,
        ratingCount: 67,
        discountPercent: null,
        hasFreeShipping: false,
        couponCode: null,
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
  const conserto = byName.get("Conserto de Placa")!;

  // =========================================================
  // 5) IMAGENS DO PRODUTO - IDs Verificados do Unsplash
  // =========================================================
  await prisma.productImage.createMany({
    data: [
      // Camiseta Premium - Camisetas dobradas e penduradas
      { productId: tshirt.id, position: 0, url: unsplashPhoto("1521572163474-6864f9cf17ab") },
      { productId: tshirt.id, position: 1, url: unsplashPhoto("1556821840-3a63f95609a7") },
      { productId: tshirt.id, position: 2, url: unsplashPhoto("1503342217505-b0a15ec3261c") },

      // Tênis Urbano - Sneakers modernos
      { productId: tenis.id, position: 0, url: unsplashPhoto("1542291026-7eec264c27ff") },
      { productId: tenis.id, position: 1, url: unsplashPhoto("1460353581641-37baddab0fa2") },
      { productId: tenis.id, position: 2, url: unsplashPhoto("1549298916-b41d501d3772") },

      // Mochila Tech - Mochilas urbanas e tech
      { productId: mochila.id, position: 0, url: unsplashPhoto("1553062407-98eeb64c6a62") },
      { productId: mochila.id, position: 1, url: unsplashPhoto("1622560480605-d83c853bc5c3") },
      { productId: mochila.id, position: 2, url: unsplashPhoto("1546938576-6e6a64f317cc") },

      // Fone Bluetooth - Headphones/Earbuds
      { productId: fone.id, position: 0, url: unsplashPhoto("1484704849700-f032a568e944") },
      { productId: fone.id, position: 1, url: unsplashPhoto("1545127398-14699f92334b") },
      { productId: fone.id, position: 2, url: unsplashPhoto("1590658165737-15a047b1f6ff") },

      // Conserto de Placa - Eletrônica e circuitos
      { productId: conserto.id, position: 0, url: unsplashPhoto("1581092160562-40aa08e78837") },
      { productId: conserto.id, position: 1, url: unsplashPhoto("1518770660439-4636190af475") },
      { productId: conserto.id, position: 2, url: unsplashPhoto("1581092335397-9583eb92d232") },
    ],
  });

  console.log("✅ Imagens criadas");

  // =========================================================
  // 6) PEDIDOS (customer + guest) COM AGENDAMENTO
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

  // Pedido 5 (customer) - PAID - Serviço de Conserto com Agendamento
  const consertoTotalCents = conserto.priceCents;

  const orderConserto = await prisma.order.create({
    data: {
      userId: customer.id,
      status: "PAID",
      totalCents: consertoTotalCents,
      currency: "BRL",
      items: {
        create: [
          { productId: conserto.id, quantity: 1, priceCents: conserto.priceCents },
        ],
      },
      payments: {
        create: [
          {
            method: "PIX",
            status: "PAID",
            amountCents: consertoTotalCents,
            mpPaymentId: "MP_SEED_CONSERTO_001",
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
  console.log(" -", orderConserto.id, orderConserto.status, "(Conserto de Placa)");

  // =========================================================
  // 7) AGENDAMENTOS (SCHEDULES)
  // =========================================================

  // Agendamento 1 - CONFIRMED para o conserto de placa
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(16, 0, 0, 0);

  const scheduleConfirmed = await prisma.schedule.create({
    data: {
      userId: customer.id,
      employeeId: employee1.id, // FUNCIONÁRIO 1
      orderId: orderConserto.id,
      type: "SERVICE",
      status: "CONFIRMED",
      startAt: tomorrow,
      endAt: tomorrowEnd,
      notes: "Conserto de placa-mãe - Cliente aguardando orçamento detalhado após diagnóstico",
      createdBy: "CUSTOMER",
    },
    select: { id: true, status: true, startAt: true },
  });

  // Agendamento 2 - PENDING sem pedido vinculado
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(10, 0, 0, 0);
  
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setHours(11, 30, 0, 0);

  const schedulePending = await prisma.schedule.create({
    data: {
      userId: customer.id,
      employeeId: employee2.id,
      type: "MEETING",
      status: "PENDING",
      startAt: nextWeek,
      endAt: nextWeekEnd,
      notes: "Reunião para orçamento de manutenção preventiva",
      createdBy: "CUSTOMER",
    },
    select: { id: true, status: true, startAt: true },
  });

  // Agendamento 3 - COMPLETED (entrega realizada)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(15, 0, 0, 0);
  
  const yesterdayEnd = new Date(yesterday);
  yesterdayEnd.setHours(15, 30, 0, 0);

  const scheduleCompleted = await prisma.schedule.create({
    data: {
      userId: customer.id,
      employeeId: employee1.id,
      orderId: orderPaid.id,
      type: "DELIVERY",
      status: "COMPLETED",
      startAt: yesterday,
      endAt: yesterdayEnd,
      notes: "Entrega realizada com sucesso - Mochila Tech",
      createdBy: "ADMIN",
    },
    select: { id: true, status: true, startAt: true },
  });

  console.log("✅ Agendamentos criados:");
  console.log(" -", scheduleConfirmed.id, scheduleConfirmed.status, "em", scheduleConfirmed.startAt.toISOString());
  console.log(" -", schedulePending.id, schedulePending.status, "em", schedulePending.startAt.toISOString());
  console.log(" -", scheduleCompleted.id, scheduleCompleted.status, "em", scheduleCompleted.startAt.toISOString());

  console.log("✅ Seed finalizada com sucesso.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });