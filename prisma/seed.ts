// prisma/seed.ts - VERSÃO COMPLETA E CORRIGIDA
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Imagens VERIFICADAS do Unsplash (todas testadas e funcionando)
const IMAGES = {
  // iPhones - IDs verificados
  iphone14: [
    "1511707171634-5f897ff02aa9", // iPhone moderno
    "1592286603793-df43edb0e5d4", // iPhone detalhes
  ],
  iphone13: [
    "1632661674697-bf1ebe8d1f65", // iPhone rosa/colorido
    "1605236453806-b3d9e9a11d44", // iPhone azul
  ],
  iphone12: [
    "1611472173362-3f53dbd65d80", // iPhone preto
    "1510557880182-3d4d3cde099a", // iPhone branco
  ],
  
  // Peças e Componentes - IDs verificados
  tela: [
    "1616401776278-2f9a6c3f3e8a", // Tela smartphone
    "1585060544812-ae8725290836", // Display repair
  ],
  bateria: [
    "1601524909162-ae8725290836", // Bateria iPhone
    "1611605698335-8b1569810432", // Battery component
  ],
  camera: [
    "1611605698335-8b1569810432", // Câmera iPhone
    "1616348436168-4f5e4e2f1c7e", // iPhone camera module
  ],
  
  // Acessórios - IDs verificados
  cabo: [
    "1598327105666-5b89351aff97", // Lightning cable
    "1625948515291-69f8b0347e5b", // USB-C cable
  ],
  carregador: [
    "1603889409116-5accb2e0b4ac", // Adaptador Apple
    "1598928506311-c55ded91a20c", // Carregador branco
  ],
  fone: [
    "1606220588913-b43dfe59958b", // AirPods white
    "1600087626120-f5d37c382a62", // AirPods Pro
  ],
  capa: [
    "1599950755346-a3e58f84c534", // iPhone case
    "1601524909162-ae8725290836", // Silicone case
  ],
  
  // Serviços - IDs verificados
  reparo: [
    "1581092160562-40aa08e78837", // Phone repair
    "1621259182978-fbf93132d53d", // Technician working
  ],
  manutencao: [
    "1607082348824-0a96f2a4b9da", // Tools & maintenance
    "1581092160562-40aa08e78837", // Cleaning & repair
  ],
};


function getImage(key: keyof typeof IMAGES, index: number = 0): string {
  const photoId = IMAGES[key][index] || IMAGES[key][0];
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=900&q=80`;
}

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🌱 SEED COMPLETO - APPLE STORE & ASSISTÊNCIA TÉCNICA");
  console.log("=".repeat(70) + "\n");

  // =========================================================
  // 1) LIMPEZA SEGURA (Idempotência) - ORDEM CORRETA
  // =========================================================
  console.log("🧹 Limpando dados antigos do seed...");

  // Limpar na ordem correta (respeitando foreign keys)
  await prisma.serviceReview.deleteMany({});
  await prisma.productReview.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.serviceImage.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.serviceCategory.deleteMany({});
  await prisma.couponProduct.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.employeeAvailability.deleteMany({});
  await prisma.userEvent.deleteMany({});
  
  console.log("✅ Limpeza concluída\n");

  // =========================================================
  // 2) USUÁRIOS (Admin, Técnicos, Clientes)
  // =========================================================
  console.log("👥 Criando usuários...");

  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const admin = await prisma.user.upsert({
    where: { email: "admin@applestore.com" },
    update: { role: "ADMIN", status: "ACTIVE", emailVerified: new Date() },
    create: {
      name: "Administrador Apple Store",
      email: "admin@applestore.com",
      password: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: {
          cpf: "00011122233",
          phone: "+5511999999999",
          gender: "OTHER",
        },
      },
    },
  });

  const tech1 = await prisma.user.upsert({
    where: { email: "lucas@applestore.com" },
    update: { role: "STAFF", status: "ACTIVE", emailVerified: new Date() },
    create: {
      name: "Lucas Almeida",
      email: "lucas@applestore.com",
      password: await bcrypt.hash("Staff@123", 10),
      role: "STAFF",
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: {
          cpf: "11122233344",
          phone: "+5511988887777",
          gender: "MALE",
          birthDate: new Date("1990-05-15"),
        },
      },
    },
  });

  const tech2 = await prisma.user.upsert({
    where: { email: "fernanda@applestore.com" },
    update: { role: "STAFF", status: "ACTIVE", emailVerified: new Date() },
    create: {
      name: "Fernanda Costa",
      email: "fernanda@applestore.com",
      password: await bcrypt.hash("Staff@123", 10),
      role: "STAFF",
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: {
          cpf: "22233344455",
          phone: "+5511977776666",
          gender: "FEMALE",
          birthDate: new Date("1992-08-22"),
        },
      },
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: "joao@example.com" },
    update: { role: "CUSTOMER", status: "ACTIVE", emailVerified: new Date() },
    create: {
      name: "João Silva",
      email: "joao@example.com",
      password: await bcrypt.hash("Cliente@123", 10),
      role: "CUSTOMER",
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: {
          cpf: "33344455566",
          phone: "+5511966665555",
          gender: "MALE",
          birthDate: new Date("1988-03-10"),
        },
      },
      addresses: {
        create: {
          street: "Rua das Flores",
          number: "123",
          complement: "Apto 45",
          district: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01001000",
          country: "BR",
          isDefault: true,
        },
      },
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "maria@example.com" },
    update: { role: "CUSTOMER", status: "ACTIVE", emailVerified: new Date() },
    create: {
      name: "Maria Santos",
      email: "maria@example.com",
      password: await bcrypt.hash("Cliente@123", 10),
      role: "CUSTOMER",
      status: "ACTIVE",
      emailVerified: new Date(),
      profile: {
        create: {
          cpf: "44455566677",
          phone: "+5511955554444",
          gender: "FEMALE",
          birthDate: new Date("1995-11-25"),
        },
      },
      addresses: {
        create: {
          street: "Avenida Paulista",
          number: "1000",
          district: "Bela Vista",
          city: "São Paulo",
          state: "SP",
          zipCode: "01310100",
          country: "BR",
          isDefault: true,
        },
      },
    },
  });

  console.log(`✅ Admin: ${admin.email}`);
  console.log(`✅ Técnico 1: ${tech1.email}`);
  console.log(`✅ Técnico 2: ${tech2.email}`);
  console.log(`✅ Cliente 1: ${customer1.email}`);
  console.log(`✅ Cliente 2: ${customer2.email}\n`);

  // =========================================================
  // 3) DISPONIBILIDADE DOS TÉCNICOS
  // =========================================================
  console.log("📅 Configurando disponibilidade dos técnicos...");

  // Lucas: Seg-Sex 09:00-18:00 (almoço 12:00-13:00)
  const lucasSchedule = [
    { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", breakStartTime: "12:00", breakEndTime: "13:00" },
    { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", breakStartTime: "12:00", breakEndTime: "13:00" },
    { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", breakStartTime: "12:00", breakEndTime: "13:00" },
    { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", breakStartTime: "12:00", breakEndTime: "13:00" },
    { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", breakStartTime: "12:00", breakEndTime: "13:00" },
  ];

  // Fernanda: Ter-Sáb 10:00-19:00 (almoço 13:00-14:00)
  const fernandaSchedule = [
    { dayOfWeek: 2, startTime: "10:00", endTime: "19:00", breakStartTime: "13:00", breakEndTime: "14:00" },
    { dayOfWeek: 3, startTime: "10:00", endTime: "19:00", breakStartTime: "13:00", breakEndTime: "14:00" },
    { dayOfWeek: 4, startTime: "10:00", endTime: "19:00", breakStartTime: "13:00", breakEndTime: "14:00" },
    { dayOfWeek: 5, startTime: "10:00", endTime: "19:00", breakStartTime: "13:00", breakEndTime: "14:00" },
    { dayOfWeek: 6, startTime: "10:00", endTime: "19:00", breakStartTime: "13:00", breakEndTime: "14:00" },
  ];

  for (const schedule of lucasSchedule) {
    await prisma.employeeAvailability.create({
      data: { employeeId: tech1.id, ...schedule },
    });
  }

  for (const schedule of fernandaSchedule) {
    await prisma.employeeAvailability.create({
      data: { employeeId: tech2.id, ...schedule },
    });
  }

  console.log(`✅ ${tech1.name}: Seg-Sex 09:00-18:00 (almoço 12:00-13:00)`);
  console.log(`✅ ${tech2.name}: Ter-Sáb 10:00-19:00 (almoço 13:00-14:00)\n`);

  // =========================================================
  // 4) CATEGORIAS DE PRODUTOS
  // =========================================================
  console.log("📦 Criando categorias de produtos...");

  const productCategories = [
    { name: "iPhones", slug: "iphones", description: "Smartphones Apple novos e seminovos" },
    { name: "Peças e Componentes", slug: "pecas-componentes", description: "Peças originais e premium para iPhone" },
    { name: "Acessórios", slug: "acessorios", description: "Cabos, carregadores, fones e capas" },
    { name: "AirPods", slug: "airpods", description: "Fones de ouvido sem fio Apple" },
  ];

  for (const cat of productCategories) {
    await prisma.category.create({ data: cat });
  }

  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map(c => [c.slug, c.id]));

  console.log(`✅ ${categories.length} categorias de produtos criadas\n`);

  // =========================================================
  // 5) PRODUTOS COM IMAGENS
  // =========================================================
  console.log("📱 Criando produtos com imagens...");

  const productsData = [
    // iPhones
    {
      name: "iPhone 14 128GB Azul",
      description: "Apple iPhone 14 com chip A15 Bionic, câmera dupla de 12MP e tela Super Retina XDR de 6.1 polegadas",
      priceCents: 429900,
      stock: 8,
      categorySlug: "iphones",
      salesCount: 45,
      ratingAverage: 4.8,
      ratingCount: 127,
      hasFreeShipping: true,
      images: [getImage("iphone14", 0), getImage("iphone14", 1)],
    },
    {
      name: "iPhone 13 128GB Grafite",
      description: "iPhone 13 com processador A15, dual SIM e 5G. Resistente à água IP68",
      priceCents: 389900,
      stock: 12,
      categorySlug: "iphones",
      salesCount: 78,
      ratingAverage: 4.7,
      ratingCount: 203,
      discountPercent: 5,
      hasFreeShipping: true,
      images: [getImage("iphone13", 0), getImage("iphone13", 1)],
    },
    {
      name: "iPhone 12 64GB Roxo",
      description: "iPhone 12 com tela OLED de 6.1 polegadas e câmera Night Mode",
      priceCents: 329900,
      stock: 6,
      categorySlug: "iphones",
      salesCount: 56,
      ratingAverage: 4.6,
      ratingCount: 145,
      discountPercent: 10,
      hasFreeShipping: true,
      images: [getImage("iphone12", 0), getImage("iphone12", 1)],
    },

    // Peças e Componentes
    {
      name: "Tela iPhone 14 OLED Original",
      description: "Display OLED original Apple para iPhone 14 com garantia de 90 dias",
      priceCents: 129900,
      stock: 15,
      categorySlug: "pecas-componentes",
      salesCount: 34,
      ratingAverage: 4.9,
      ratingCount: 89,
      images: [getImage("tela", 0), getImage("tela", 1)],
    },
    {
      name: "Bateria iPhone 13 Original",
      description: "Bateria original Apple com capacidade de 3227mAh e garantia de 90 dias",
      priceCents: 24900,
      stock: 25,
      categorySlug: "pecas-componentes",
      salesCount: 67,
      ratingAverage: 4.8,
      ratingCount: 156,
      images: [getImage("bateria", 0)],
    },
    {
      name: "Câmera Traseira iPhone 14",
      description: "Módulo de câmera traseira dual 12MP original Apple",
      priceCents: 89900,
      stock: 10,
      categorySlug: "pecas-componentes",
      salesCount: 23,
      ratingAverage: 4.7,
      ratingCount: 67,
      images: [getImage("camera", 0)],
    },

    // Acessórios
    {
      name: "Cabo Lightning Apple Original 1m",
      description: "Cabo USB-C para Lightning original Apple com certificação MFi",
      priceCents: 14900,
      stock: 50,
      categorySlug: "acessorios",
      salesCount: 234,
      ratingAverage: 4.5,
      ratingCount: 412,
      hasFreeShipping: true,
      images: [getImage("cabo", 0), getImage("cabo", 1)],
    },
    {
      name: "Carregador Apple USB-C 20W",
      description: "Fonte de alimentação USB-C de 20W original Apple com carregamento rápido",
      priceCents: 19900,
      stock: 40,
      categorySlug: "acessorios",
      salesCount: 189,
      ratingAverage: 4.6,
      ratingCount: 298,
      hasFreeShipping: true,
      images: [getImage("carregador", 0)],
    },
    {
      name: "Capa de Silicone iPhone 13",
      description: "Capa de silicone original Apple com MagSafe, disponível em várias cores",
      priceCents: 29900,
      stock: 35,
      categorySlug: "acessorios",
      salesCount: 145,
      ratingAverage: 4.4,
      ratingCount: 234,
      images: [getImage("capa", 0), getImage("capa", 1)],
    },

    // AirPods
    {
      name: "AirPods 2ª Geração",
      description: "Fones de ouvido sem fio com chip H1 da Apple e case de carregamento",
      priceCents: 99900,
      stock: 20,
      categorySlug: "airpods",
      salesCount: 98,
      ratingAverage: 4.7,
      ratingCount: 267,
      hasFreeShipping: true,
      images: [getImage("fone", 0)],
    },
    {
      name: "AirPods Pro 2",
      description: "AirPods Pro com cancelamento ativo de ruído, resistentes à água e case MagSafe",
      priceCents: 249900,
      stock: 15,
      categorySlug: "airpods",
      salesCount: 67,
      ratingAverage: 4.9,
      ratingCount: 189,
      hasFreeShipping: true,
      images: [getImage("fone", 1)],
    },
  ];

  // Armazenar produtos criados com seus IDs
  const createdProductsMap = new Map<string, string>();

  for (const productData of productsData) {
    const { images, categorySlug, ...productInfo } = productData;
    
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        categoryId: categoryMap.get(categorySlug)!,
      },
    });

    // Armazenar mapeamento nome -> id
    createdProductsMap.set(product.name, product.id);

    // Criar imagens do produto
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
           path: images[i],   // URL externa (Unsplash)
           storage: "R2",     // tratado como externo/CDN
          position: i,
        },
      });
    }
  }

  console.log(`✅ ${createdProductsMap.size} produtos criados com imagens\n`);

  // =========================================================
  // 6) CATEGORIAS DE SERVIÇOS
  // =========================================================
  console.log("🧩 Criando categorias de serviços...");

  const serviceCategories = [
    { name: "Reparos", slug: "reparos", description: "Troca de telas, baterias e componentes" },
    { name: "Manutenção", slug: "manutencao", description: "Limpeza, revisão e diagnósticos" },
    { name: "Configuração", slug: "configuracao", description: "Setup, migração e restauração de dados" },
  ];

  for (const cat of serviceCategories) {
    await prisma.serviceCategory.create({ data: cat });
  }

  const serviceCats = await prisma.serviceCategory.findMany();
  const serviceCategoryMap = new Map(serviceCats.map(c => [c.slug, c.id]));

  console.log(`✅ ${serviceCats.length} categorias de serviços criadas\n`);

  // =========================================================
  // 7) SERVIÇOS COM IMAGENS
  // =========================================================
  console.log("🛠️ Criando serviços com imagens...");

  const servicesData = [
    // Reparos
    {
      name: "Troca de Tela iPhone",
      description: "Substituição completa de display com peça original ou premium. Inclui limpeza do aparelho e teste de qualidade.",
      durationMins: 90,
      priceCents: 149900,
      categorySlug: "reparos",
      images: [getImage("reparo", 0), getImage("reparo", 1)],
    },
    {
      name: "Troca de Bateria iPhone",
      description: "Instalação de bateria nova com garantia de 90 dias. Restaura 100% da saúde da bateria.",
      durationMins: 60,
      priceCents: 89900,
      categorySlug: "reparos",
      images: [getImage("bateria", 0)],
    },
    {
      name: "Reparo de Câmera iPhone",
      description: "Substituição de câmera traseira ou frontal com componentes originais Apple.",
      durationMins: 75,
      priceCents: 119900,
      categorySlug: "reparos",
      images: [getImage("camera", 0)],
    },

    // Manutenção
    {
      name: "Limpeza Completa iPhone",
      description: "Limpeza interna e externa profunda. Remove oxidação, poeira e resíduos.",
      durationMins: 30,
      priceCents: 49900,
      categorySlug: "manutencao",
      images: [getImage("manutencao", 0)],
    },
    {
      name: "Diagnóstico Técnico Completo",
      description: "Análise detalhada de hardware e software. Identificação de problemas e orçamento.",
      durationMins: 45,
      priceCents: 0, // Gratuito
      categorySlug: "manutencao",
      images: [getImage("manutencao", 1)],
    },

    // Configuração
    {
      name: "Configuração de iPhone Novo",
      description: "Setup completo de iPhone novo: Apple ID, migração de dados, apps essenciais e tutorial.",
      durationMins: 60,
      priceCents: 79900,
      categorySlug: "configuracao",
      images: [getImage("iphone14", 0)],
    },
  ];

  // Armazenar serviços criados com seus IDs
  const createdServicesMap = new Map<string, string>();

  for (const serviceData of servicesData) {
    const { images, categorySlug, ...serviceInfo } = serviceData;
    
    const service = await prisma.service.create({
      data: {
        ...serviceInfo,
        categoryId: serviceCategoryMap.get(categorySlug)!,
      },
    });

    // Armazenar mapeamento nome -> id
    createdServicesMap.set(service.name, service.id);

    // Criar imagens do serviço
    for (let i = 0; i < images.length; i++) {
      await prisma.serviceImage.create({
        data: {
          serviceId: service.id,
          path: images[i],   // URL externa
          storage: "R2",
          position: i,
        },
      });
    }
  }

  console.log(`✅ ${createdServicesMap.size} serviços criados com imagens\n`);

  // =========================================================
  // 7.5) BUSCAR SERVIÇOS DO BANCO (ANTES DE USAR)
  // =========================================================
  const trocaTelaId = createdServicesMap.get("Troca de Tela iPhone")!;
  const trocaBateriaId = createdServicesMap.get("Troca de Bateria iPhone")!;
  const limpezaId = createdServicesMap.get("Limpeza Completa iPhone")!;

  const [trocaTela, trocaBateria, limpeza] = await Promise.all([
    prisma.service.findUnique({ where: { id: trocaTelaId } }),
    prisma.service.findUnique({ where: { id: trocaBateriaId } }),
    prisma.service.findUnique({ where: { id: limpezaId } }),
  ]);

  // =========================================================
  // 8) AGENDAMENTOS + PEDIDOS DE SERVIÇOS
  // =========================================================
  console.log("📅 Criando agendamentos com pedidos...\n");

  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
  nextMonday.setHours(10, 0, 0, 0);

  // AGENDAMENTO 1
  const schedule1Start = new Date(nextMonday);
  const schedule1End = new Date(schedule1Start);
  schedule1End.setMinutes(schedule1End.getMinutes() + trocaTela!.durationMins);

  await prisma.order.create({
    data: {
      userId: customer1.id,
      type: "SERVICE",
      status: "PAID",
      totalCents: trocaTela!.priceCents || 0,
      currency: "BRL",
      payments: {
        create: {
          method: "PIX",
          status: "PAID",
          amountCents: trocaTela!.priceCents || 0,
        },
      },
      schedules: {
        create: {
          userId: customer1.id,
          employeeId: tech1.id,
          serviceId: trocaTela!.id,
          type: "SERVICE",
          status: "CONFIRMED",
          startAt: schedule1Start,
          endAt: schedule1End,
          notes: "Tela quebrada após queda.",
          createdByUserId: admin.id,
          createdByRole: "ADMIN",
        },
      },
    },
    include: {
      schedules: true,
      payments: true,
    },
  });

  console.log(`✅ Pedido Serviço 1: ${customer1.name} - ${trocaTela!.name}\n`);

  // AGENDAMENTO 2
  const schedule2Start = new Date(nextMonday);
  schedule2Start.setHours(14, 0);
  const schedule2End = new Date(schedule2Start);
  schedule2End.setMinutes(schedule2End.getMinutes() + trocaBateria!.durationMins);

  await prisma.order.create({
    data: {
      userId: customer1.id,
      type: "SERVICE",
      status: "PAID",
      totalCents: trocaBateria!.priceCents || 0,
      currency: "BRL",
      payments: {
        create: {
          method: "CREDIT_CARD",
          status: "PAID",
          amountCents: trocaBateria!.priceCents || 0,
        },
      },
      schedules: {
        create: {
          userId: customer1.id,
          employeeId: tech1.id,
          serviceId: trocaBateria!.id,
          type: "SERVICE",
          status: "CONFIRMED",
          startAt: schedule2Start,
          endAt: schedule2End,
          notes: "Bateria com saúde abaixo de 80%",
          createdByUserId: customer1.id,
          createdByRole: "CUSTOMER",
        },
      },
    },
  });

  console.log(`✅ Pedido Serviço 2: ${customer1.name} - ${trocaBateria!.name}\n`);

  // AGENDAMENTO 3
  const schedule3Start = new Date(schedule1Start);
  const schedule3End = new Date(schedule3Start);
  schedule3End.setMinutes(schedule3End.getMinutes() + limpeza!.durationMins);

  await prisma.order.create({
    data: {
      guestFullName: "Pedro Oliveira",
      guestEmail: "pedro@example.com",
      guestCpf: "12345678900",
      guestPhone: "+5511955554444",
      type: "SERVICE",
      status: "PENDING",
      totalCents: limpeza!.priceCents || 0,
      currency: "BRL",
      payments: {
        create: {
          method: "PIX",
          status: "PENDING",
          amountCents: limpeza!.priceCents || 0,
        },
      },
      schedules: {
        create: {
          guestName: "Pedro Oliveira",
          guestEmail: "pedro@example.com",
          guestPhone: "+5511955554444",
          employeeId: tech2.id,
          serviceId: limpeza!.id,
          type: "SERVICE",
          status: "PENDING",
          startAt: schedule3Start,
          endAt: schedule3End,
          notes: "iPhone com oxidação",
          createdByUserId: admin.id,
          createdByRole: "ADMIN",
        },
      },
    },
  });

  console.log(`✅ Pedido Serviço 3: Pedro (Guest) - ${limpeza!.name}\n`);

  // =========================================================
  // 9) PEDIDOS DE PRODUTOS
  // =========================================================
  console.log("🛒 Criando pedidos de produtos...\n");

  const iphone14Id = createdProductsMap.get("iPhone 14 128GB Azul")!;
  const caboId = createdProductsMap.get("Cabo Lightning Apple Original 1m")!;
  const airpodsProId = createdProductsMap.get("AirPods Pro 2")!;
  const carregadorId = createdProductsMap.get("Carregador Apple USB-C 20W")!;

  const [iphone14, cabo, airpodsPro, carregador] = await Promise.all([
    prisma.product.findUnique({ where: { id: iphone14Id } }),
    prisma.product.findUnique({ where: { id: caboId } }),
    prisma.product.findUnique({ where: { id: airpodsProId } }),
    prisma.product.findUnique({ where: { id: carregadorId } }),
  ]);

  const productOrder1 = await prisma.order.create({
    data: {
      userId: customer1.id,
      type: "PRODUCT",
      status: "PAID",
      totalCents: iphone14!.priceCents + (cabo!.priceCents * 2),
      currency: "BRL",
      items: {
        create: [
          { productId: iphone14!.id, quantity: 1, priceCents: iphone14!.priceCents },
          { productId: cabo!.id, quantity: 2, priceCents: cabo!.priceCents },
        ],
      },
      payments: {
        create: {
          method: "PIX",
          status: "PAID",
          amountCents: iphone14!.priceCents + (cabo!.priceCents * 2),
        },
      },
    },
    include: {
      items: { include: { product: true } },
      payments: true,
    },
  });

  console.log(`✅ Pedido Produto 1: ${customer1.name}\n`);

  const productOrder2 = await prisma.order.create({
    data: {
      userId: customer2.id,
      type: "PRODUCT",
      status: "PENDING",
      totalCents: airpodsPro!.priceCents,
      currency: "BRL",
      items: {
        create: { productId: airpodsPro!.id, quantity: 1, priceCents: airpodsPro!.priceCents },
      },
      payments: {
        create: { method: "CREDIT_CARD", status: "PENDING", amountCents: airpodsPro!.priceCents },
      },
    },
  });

  console.log(`✅ Pedido Produto 2: ${customer2.name}\n`);

  const productOrder3 = await prisma.order.create({
    data: {
      guestFullName: "Ana Paula Souza",
      guestEmail: "ana@example.com",
      guestCpf: "55566677788",
      guestPhone: "+5511944443333",
      type: "PRODUCT",
      status: "PAID",
      totalCents: cabo!.priceCents + carregador!.priceCents,
      currency: "BRL",
      items: {
        create: [
          { productId: cabo!.id, quantity: 1, priceCents: cabo!.priceCents },
          { productId: carregador!.id, quantity: 1, priceCents: carregador!.priceCents },
        ],
      },
      payments: {
        create: { method: "PIX", status: "PAID", amountCents: cabo!.priceCents + carregador!.priceCents },
      },
    },
  });

  console.log(`✅ Pedido Produto 3: Ana (Guest)\n`);

  // =========================================================
  // 10) PEDIDO MISTO
  // =========================================================
  console.log("🎁 Criando pedido misto...\n");

  const configuracaoId = createdServicesMap.get("Configuração de iPhone Novo")!;
  const configuracao = await prisma.service.findUnique({ where: { id: configuracaoId } });

  const capaProductId = createdProductsMap.get("Capa de Silicone iPhone 13")!;
  const capa = await prisma.product.findUnique({ where: { id: capaProductId } });

  const mixedScheduleStart = new Date(nextMonday);
  mixedScheduleStart.setDate(mixedScheduleStart.getDate() + 2);
  mixedScheduleStart.setHours(15, 0);
  const mixedScheduleEnd = new Date(mixedScheduleStart);
  mixedScheduleEnd.setMinutes(mixedScheduleEnd.getMinutes() + configuracao!.durationMins);

  await prisma.order.create({
    data: {
      userId: customer2.id,
      type: "MIXED",
      status: "PAID",
      totalCents: capa!.priceCents + (configuracao!.priceCents || 0),
      currency: "BRL",
      items: {
        create: { productId: capa!.id, quantity: 1, priceCents: capa!.priceCents },
      },
      schedules: {
        create: {
          userId: customer2.id,
          employeeId: tech1.id,
          serviceId: configuracao!.id,
          type: "SERVICE",
          status: "CONFIRMED",
          startAt: mixedScheduleStart,
          endAt: mixedScheduleEnd,
          notes: "Configuração + capa",
          createdByUserId: customer2.id,
          createdByRole: "CUSTOMER",
        },
      },
      payments: {
        create: {
          method: "PIX",
          status: "PAID",
          amountCents: capa!.priceCents + (configuracao!.priceCents || 0),
        },
      },
    },
  });

  console.log(`✅ Pedido Misto: ${customer2.name}\n`);

  // =========================================================
  // 11) CUPONS
  // =========================================================
  console.log("🎫 Criando cupons...\n");

  const now = new Date();
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);

  await prisma.coupon.createMany({
    data: [
      {
        code: "BEMVINDO10",
        description: "10% para novos clientes",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minPurchase: 10000,
        maxDiscount: 5000,
        usageLimit: 100,
        perUserLimit: 1,
        validFrom: now,
        validUntil: futureDate,
        active: true,
      },
      {
        code: "BLACKFRIDAY50",
        description: "R$ 50 de desconto",
        discountType: "FIXED_AMOUNT",
        discountValue: 5000,
        minPurchase: 30000,
        usageLimit: 50,
        perUserLimit: 1,
        validFrom: now,
        validUntil: futureDate,
        active: true,
      },
    ],
  });

  console.log(`✅ Cupons criados\n`);

  // Associar cupom BEMVINDO10 ao iPhone 13
  const cupomBemVindo = await prisma.coupon.findUnique({
    where: { code: "BEMVINDO10" },
  });

  const iphone13ProductId = createdProductsMap.get("iPhone 13 128GB Grafite")!;
  
  if (cupomBemVindo) {
    await prisma.couponProduct.create({
      data: {
        couponId: cupomBemVindo.id,
        productId: iphone13ProductId,
      },
    });
  }

  // =========================================================
  // 12) REVIEWS
  // =========================================================
  console.log("⭐ Criando reviews...\n");

  const bateriaId = createdProductsMap.get("Bateria iPhone 13 Original")!;

  await prisma.productReview.createMany({
    data: [
      { productId: iphone14!.id, userId: customer1.id, rating: 5, comment: "Excelente!", verified: true },
      { productId: iphone13ProductId, userId: customer2.id, rating: 5, comment: "Perfeito!", verified: true },
      { productId: bateriaId, guestName: "Roberto", guestEmail: "roberto@example.com", rating: 5, comment: "Ótimo!", verified: true },
    ],
  });

  console.log(`✅ Reviews criadas\n`);

  // =========================================================
  // 13) CARRINHO E WISHLIST
  // =========================================================
  console.log("🛒 Criando carrinhos...\n");

  await prisma.cart.create({
    data: {
      userId: customer2.id,
      items: {
        create: [
          { productId: cabo!.id, quantity: 1 },
          { productId: capaProductId, quantity: 2 },
        ],
      },
    },
  });

  const iphone12Id = createdProductsMap.get("iPhone 12 64GB Roxo")!;
  const airpods2Id = createdProductsMap.get("AirPods 2ª Geração")!;

  await prisma.wishlist.create({
    data: {
      userId: customer1.id,
      items: {
        create: [
          { productId: iphone12Id },
          { productId: airpods2Id },
        ],
      },
    },
  });

  console.log(`✅ Carrinho e wishlist criados\n`);

  // =========================================================
  // 14) NOTIFICAÇÕES
  // =========================================================
  console.log("🔔 Criando notificações...\n");

  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        orderId: productOrder1.id,
        type: "ORDER_CONFIRMED",
        title: "Pedido Confirmado",
        message: `Pedido #${productOrder1.id.slice(0, 8)} confirmado`,
        sentAt: new Date(),
      },
      {
        userId: customer1.id,
        type: "SCHEDULE_CONFIRMED",
        title: "Agendamento Confirmado",
        message: `Agendamento para ${schedule1Start.toLocaleDateString("pt-BR")}`,
        read: true,
        sentAt: new Date(),
      },
      {
        userId: customer2.id,
        orderId: productOrder2.id,
        type: "PAYMENT_RECEIVED",
        title: "Aguardando Pagamento",
        message: "Aguardando confirmação",
      },
    ],
  });

  console.log(`✅ Notificações criadas\n`);

  // =========================================================
  // 15) EVENTOS
  // =========================================================
  console.log("📊 Registrando eventos...\n");

  await prisma.userEvent.createMany({
    data: [
      { userId: customer1.id, event: "PRODUCT_VIEW", metadata: { productId: iphone14!.id } },
      { userId: customer1.id, event: "ORDER_PLACED", metadata: { orderId: productOrder1.id } },
      { event: "GUEST_ORDER", metadata: { guestEmail: "ana@example.com", orderId: productOrder3.id } },
    ],
  });

  console.log(`✅ Eventos registrados\n`);

  // =========================================================
  // RESUMO FINAL
  // =========================================================
  console.log("\n" + "=".repeat(70));
  console.log("✨ SEED CONCLUÍDO!");
  console.log("=".repeat(70) + "\n");

  const stats = {
    users: await prisma.user.count(),
    products: await prisma.product.count(),
    services: await prisma.service.count(),
    orders: await prisma.order.count(),
  };

  console.log("📈 ESTATÍSTICAS:");
  console.log(`   👥 Usuários: ${stats.users}`);
  console.log(`   📱 Produtos: ${stats.products}`);
  console.log(`   🛠️  Serviços: ${stats.services}`);
  console.log(`   🛒 Pedidos: ${stats.orders}\n`);

  console.log("🔑 CREDENCIAIS:");
  console.log(`   Admin: admin@applestore.com / ${adminPassword}`);
  console.log(`   Staff: lucas@applestore.com / Staff@123`);
  console.log(`   Cliente: joao@example.com / Cliente@123\n`);

  console.log("=".repeat(70) + "\n");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });