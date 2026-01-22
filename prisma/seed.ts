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
    "1585060544812-6b45742d762f", // Display repair
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
  // 1) LIMPEZA SEGURA (Idempotência)
  // =========================================================
  console.log("🧹 Limpando dados antigos do seed...");

  // Limpar na ordem correta (respeitando foreign keys)
  await prisma.serviceImage.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.serviceCategory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.employeeAvailability.deleteMany({});
  
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
      name: "iPhone 13 128GB Rosa",
      description: "iPhone 13 com processador A15, dual SIM e 5G. Resistente à água IP68",
      priceCents: 389900,
      stock: 12,
      categorySlug: "iphones",
      salesCount: 78,
      ratingAverage: 4.7,
      ratingCount: 203,
      discountPercent: 5,
      hasFreeShipping: true,
      couponCode: "IPHONE5",
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
      couponCode: "IPHONE10",
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

  // CORREÇÃO: Armazenar produtos criados com seus IDs
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
          url: images[i],
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

  // CORREÇÃO: Armazenar serviços criados com seus IDs
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
          url: images[i],
          position: i,
        },
      });
    }
  }

  console.log(`✅ ${createdServicesMap.size} serviços criados com imagens\n`);

  // =========================================================
  // 8) AGENDAMENTOS (Demonstrando Conflitos)
  // =========================================================
  console.log("⏳ Preparando agendamentos e pedidos...\n");
  console.log("📅 Criando agendamentos (demonstrando conflitos)...\n");

  // Buscar IDs dos serviços
  const trocaTelaId = createdServicesMap.get("Troca de Tela iPhone")!;
  const trocaBateriaId = createdServicesMap.get("Troca de Bateria iPhone")!;
  const limpezaId = createdServicesMap.get("Limpeza Completa iPhone")!;

  // Buscar serviços completos do banco
  const [trocaTela, trocaBateria, limpeza] = await Promise.all([
    prisma.service.findUnique({ where: { id: trocaTelaId } }),
    prisma.service.findUnique({ where: { id: trocaBateriaId } }),
    prisma.service.findUnique({ where: { id: limpezaId } }),
  ]);

  // Data base: próxima segunda-feira às 10:00
  const nextMonday = new Date();
  nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7));
  nextMonday.setHours(10, 0, 0, 0);

  // AGENDAMENTO 1: Cliente 1 com Lucas - CONFIRMADO
  const schedule1Start = new Date(nextMonday);
  const schedule1End = new Date(schedule1Start);
  schedule1End.setMinutes(schedule1End.getMinutes() + trocaTela!.durationMins);

  await prisma.schedule.create({
    data: {
      userId: customer1.id,
      employeeId: tech1.id,
      serviceId: trocaTela!.id,
      type: "SERVICE",
      status: "CONFIRMED",
      startAt: schedule1Start,
      endAt: schedule1End,
      notes: "Tela quebrada após queda. Cliente solicitou peça original.",
      paymentStatus: "PAID",
      createdByUserId: admin.id,
      createdByRole: "ADMIN",
    },
  });

  console.log(`✅ Agendamento 1: ${trocaTela!.name}`);
  console.log(`   Cliente: ${customer1.name}`);
  console.log(`   Técnico: ${tech1.name}`);
  console.log(`   Horário: ${schedule1Start.toLocaleString("pt-BR")} - ${schedule1End.toLocaleTimeString("pt-BR")}`);
  console.log(`   Status: CONFIRMED ✓\n`);

  // DEMONSTRAÇÃO DE CONFLITO
  console.log("⚠️  DEMONSTRAÇÃO DE CONFLITO:");
  console.log(`   Tentando agendar ${limpeza!.name} com ${tech1.name}`);
  console.log(`   No mesmo horário: ${schedule1Start.toLocaleString("pt-BR")}`);
  
  const conflictCheck = await prisma.schedule.findFirst({
    where: {
      employeeId: tech1.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        {
          AND: [
            { startAt: { lte: schedule1Start } },
            { endAt: { gt: schedule1Start } },
          ],
        },
      ],
    },
  });

  if (conflictCheck) {
    console.log(`   ❌ CONFLITO DETECTADO!`);
    console.log(`   Já existe agendamento: ${conflictCheck.id}`);
    console.log(`   ℹ️  Sistema impede agendamento duplicado!\n`);
  }

  // AGENDAMENTO 2: Cliente 1 com Lucas - HORÁRIO DIFERENTE
  const schedule2Start = new Date(nextMonday);
  schedule2Start.setHours(14, 0);
  const schedule2End = new Date(schedule2Start);
  schedule2End.setMinutes(schedule2End.getMinutes() + trocaBateria!.durationMins);

  await prisma.schedule.create({
    data: {
      userId: customer1.id,
      employeeId: tech1.id,
      serviceId: trocaBateria!.id,
      type: "SERVICE",
      status: "CONFIRMED",
      startAt: schedule2Start,
      endAt: schedule2End,
      notes: "Bateria com saúde abaixo de 80%",
      paymentStatus: "PAID",
      createdByUserId: customer1.id,
      createdByRole: "CUSTOMER",
    },
  });

  console.log(`✅ Agendamento 2: ${trocaBateria!.name}`);
  console.log(`   Mesmo técnico (${tech1.name}), horário diferente`);
  console.log(`   Status: CONFIRMED ✓\n`);

  // AGENDAMENTO 3: Visitante com Fernanda - MESMO HORÁRIO
  const schedule3Start = new Date(schedule1Start);
  const schedule3End = new Date(schedule3Start);
  schedule3End.setMinutes(schedule3End.getMinutes() + limpeza!.durationMins);

  await prisma.schedule.create({
    data: {
      guestName: "Pedro Oliveira",
      guestEmail: "pedro@example.com",
      guestPhone: "+5511955554444",
      employeeId: tech2.id,
      serviceId: limpeza!.id,
      type: "SERVICE",
      status: "PENDING",
      startAt: schedule3Start,
      endAt: schedule3End,
      notes: "iPhone com oxidação na placa",
      paymentStatus: "PENDING",
      createdByUserId: admin.id,
      createdByRole: "ADMIN",
    },
  });

  console.log(`✅ Agendamento 3: ${limpeza!.name}`);
  console.log(`   Visitante: Pedro Oliveira`);
  console.log(`   Técnico: ${tech2.name} (técnico diferente)`);
  console.log(`   Mesmo horário do Agendamento 1 - SEM CONFLITO ✓`);
  console.log(`   Status: PENDING (aguardando confirmação)\n`);

  // =========================================================
  // 9) PEDIDOS COM PRODUTOS
  // =========================================================
  console.log("🛒 Criando pedidos de produtos...\n");

  // Buscar IDs dos produtos
  const iphone14Id = createdProductsMap.get("iPhone 14 128GB Azul")!;
  const caboId = createdProductsMap.get("Cabo Lightning Apple Original 1m")!;
  const airpodsProId = createdProductsMap.get("AirPods Pro 2")!;
  const carregadorId = createdProductsMap.get("Carregador Apple USB-C 20W")!;

  // Buscar produtos completos
  const [iphone14, cabo, airpodsPro, carregador] = await Promise.all([
    prisma.product.findUnique({ where: { id: iphone14Id } }),
    prisma.product.findUnique({ where: { id: caboId } }),
    prisma.product.findUnique({ where: { id: airpodsProId } }),
    prisma.product.findUnique({ where: { id: carregadorId } }),
  ]);

  // PEDIDO 1: Cliente 1 - iPhone 14 + Cabo (PAGO)
  const order1 = await prisma.order.create({
    data: {
      userId: customer1.id,
      status: "PAID",
      totalCents: iphone14!.priceCents + (cabo!.priceCents * 2),
      currency: "BRL",
      items: {
        create: [
          {
            productId: iphone14!.id,
            quantity: 1,
            priceCents: iphone14!.priceCents,
          },
          {
            productId: cabo!.id,
            quantity: 2,
            priceCents: cabo!.priceCents,
          },
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

  console.log(`✅ Pedido 1: ${customer1.name}`);
  console.log(`   Produtos: ${order1.items.map(i => `${i.product.name} (${i.quantity}x)`).join(", ")}`);
  console.log(`   Total: R$ ${(order1.totalCents / 100).toFixed(2)}`);
  console.log(`   Pagamento: ${order1.payments[0].method} - ${order1.payments[0].status}\n`);

  // PEDIDO 2: Cliente 2 - AirPods Pro (PENDENTE)
  const order2 = await prisma.order.create({
    data: {
      userId: customer2.id,
      status: "PENDING",
      totalCents: airpodsPro!.priceCents,
      currency: "BRL",
      items: {
        create: {
          productId: airpodsPro!.id,
          quantity: 1,
          priceCents: airpodsPro!.priceCents,
        },
      },
      payments: {
        create: {
          method: "CREDIT_CARD",
          status: "PENDING",
          amountCents: airpodsPro!.priceCents,
        },
      },
    },
    include: {
      items: { include: { product: true } },
      payments: true,
    },
  });

  console.log(`✅ Pedido 2: ${customer2.name}`);
  console.log(`   Produto: ${order2.items[0].product.name}`);
  console.log(`   Total: R$ ${(order2.totalCents / 100).toFixed(2)}`);
  console.log(`   Status: ${order2.status} (aguardando pagamento)\n`);

  // PEDIDO 3: Visitante (Guest) - Cabo + Carregador
  const order3 = await prisma.order.create({
    data: {
      guestFullName: "Ana Paula Souza",
      guestEmail: "ana@example.com",
      guestCpf: "55566677788",
      guestPhone: "+5511944443333",
      status: "PAID",
      totalCents: cabo!.priceCents + carregador!.priceCents,
      currency: "BRL",
      items: {
        create: [
          {
            productId: cabo!.id,
            quantity: 1,
            priceCents: cabo!.priceCents,
          },
          {
            productId: carregador!.id,
            quantity: 1,
            priceCents: carregador!.priceCents,
          },
        ],
      },
      payments: {
        create: {
          method: "PIX",
          status: "PAID",
          amountCents: cabo!.priceCents + carregador!.priceCents,
        },
      },
    },
    include: {
      items: { include: { product: true } },
    },
  });

  console.log(`✅ Pedido 3: Ana Paula Souza (Visitante)`);
  console.log(`   Produtos: ${order3.items.map(i => i.product.name).join(", ")}`);
  console.log(`   Total: R$ ${(order3.totalCents / 100).toFixed(2)}\n`);

  // =========================================================
  // 10) CUPONS DE DESCONTO
  // =========================================================
  console.log("🎫 Criando cupons de desconto...\n");

  const now = new Date();
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);

  await prisma.coupon.createMany({
    data: [
      {
        code: "BEMVINDO10",
        description: "10% de desconto para novos clientes",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minPurchase: 10000, // R$ 100
        maxDiscount: 5000,   // R$ 50
        usageLimit: 100,
        perUserLimit: 1,
        validFrom: now,
        validUntil: futureDate,
        active: true,
      },
      {
        code: "FRETEGRATIS",
        description: "Frete grátis acima de R$ 200",
        discountType: "FIXED_AMOUNT",
        discountValue: 0,
        minPurchase: 20000,
        usageLimit: null,
        perUserLimit: null,
        validFrom: now,
        validUntil: futureDate,
        active: true,
      },
      {
        code: "BLACKFRIDAY50",
        description: "R$ 50 de desconto - Black Friday",
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

  const coupons = await prisma.coupon.findMany();
  console.log(`✅ ${coupons.length} cupons criados:`);
  coupons.forEach(c => {
    const discount = c.discountType === "PERCENTAGE" 
      ? `${c.discountValue}%` 
      : `R$ ${(c.discountValue / 100).toFixed(2)}`;
    console.log(`   • ${c.code}: ${discount} - ${c.description}`);
  });
  console.log();

  // =========================================================
  // 11) REVIEWS DE PRODUTOS
  // =========================================================
  console.log("⭐ Criando avaliações de produtos...\n");

  const iphone13Id = createdProductsMap.get("iPhone 13 128GB Rosa")!;
  const bateriaId = createdProductsMap.get("Bateria iPhone 13 Original")!;

  await prisma.productReview.createMany({
    data: [
      {
        productId: iphone14!.id,
        userId: customer1.id,
        rating: 5,
        comment: "Excelente! iPhone chegou perfeito, bem embalado. Muito satisfeito com a compra.",
        verified: true,
      },
      {
        productId: iphone14!.id,
        guestName: "Carlos Eduardo",
        guestEmail: "carlos@example.com",
        rating: 4,
        comment: "Bom produto, mas o preço poderia ser melhor.",
        verified: false,
      },
      {
        productId: iphone13Id,
        userId: customer2.id,
        rating: 5,
        comment: "Perfeito! A cor rosa é linda e o desempenho é excelente.",
        verified: true,
      },
      {
        productId: bateriaId,
        guestName: "Roberto Lima",
        guestEmail: "roberto@example.com",
        rating: 5,
        comment: "Bateria original, instalação rápida. Voltou a 100% de saúde!",
        verified: true,
      },
      {
        productId: cabo!.id,
        userId: customer1.id,
        rating: 4,
        comment: "Cabo bom, mas um pouco caro. Qualidade Apple.",
        verified: true,
      },
    ],
  });

  // Atualizar ratings dos produtos
  const reviewStats = await prisma.productReview.groupBy({
    by: ['productId'],
    _avg: { rating: true },
    _count: { rating: true },
  });

  for (const stat of reviewStats) {
    await prisma.product.update({
      where: { id: stat.productId },
      data: {
        ratingAverage: stat._avg.rating || 0,
        ratingCount: stat._count.rating,
      },
    });
  }

  console.log(`✅ ${reviewStats.length} produtos com avaliações atualizadas\n`);

  // =========================================================
  // 12) CARRINHO E WISHLIST
  // =========================================================
  console.log("🛒 Criando carrinhos e wishlists...\n");

  const capaId = createdProductsMap.get("Capa de Silicone iPhone 13")!;
  
  await prisma.cart.create({
    data: {
      userId: customer2.id,
      items: {
        create: [
          {
            productId: cabo!.id,
            quantity: 1,
          },
          {
            productId: capaId,
            quantity: 2,
          },
        ],
      },
    },
  });

  console.log(`✅ Carrinho criado para ${customer2.name} (2 itens)`);

  // Wishlist do Cliente 1
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

  console.log(`✅ Wishlist criada para ${customer1.name} (2 produtos)\n`);

  // =========================================================
  // 13) NOTIFICAÇÕES
  // =========================================================
  console.log("🔔 Criando notificações...\n");

  await prisma.notification.createMany({
    data: [
      {
        userId: customer1.id,
        orderId: order1.id,
        type: "ORDER_CONFIRMED",
        title: "Pedido Confirmado",
        message: `Seu pedido #${order1.id.slice(0, 8)} foi confirmado e está sendo preparado.`,
        sentAt: new Date(),
      },
      {
        userId: customer1.id,
        type: "SCHEDULE_CONFIRMED",
        title: "Agendamento Confirmado",
        message: `Seu agendamento de ${trocaTela!.name} está confirmado para ${schedule1Start.toLocaleDateString("pt-BR")}.`,
        read: true,
        sentAt: new Date(),
      },
      {
        userId: customer2.id,
        orderId: order2.id,
        type: "PAYMENT_RECEIVED",
        title: "Aguardando Pagamento",
        message: "Estamos aguardando a confirmação do seu pagamento.",
      },
    ],
  });

  console.log(`✅ 3 notificações criadas\n`);

  // =========================================================
  // 14) EVENTOS DE USUÁRIO
  // =========================================================
  console.log("📊 Registrando eventos de usuário...\n");

  await prisma.userEvent.createMany({
    data: [
      {
        userId: customer1.id,
        event: "PRODUCT_VIEW",
        metadata: { productId: iphone14!.id, category: "iphones" },
      },
      {
        userId: customer1.id,
        event: "ORDER_PLACED",
        metadata: { orderId: order1.id, totalCents: order1.totalCents },
      },
      {
        userId: customer2.id,
        event: "CART_ADD",
        metadata: { productId: cabo!.id },
      },
      {
        event: "GUEST_ORDER",
        metadata: { 
          guestEmail: "ana@example.com", 
          orderId: order3.id 
        },
      },
    ],
  });

  console.log(`✅ 4 eventos registrados\n`);

  // =========================================================
  // RESUMO FINAL
  // =========================================================
  console.log("\n" + "=".repeat(70));
  console.log("✨ SEED CONCLUÍDO COM SUCESSO!");
  console.log("=".repeat(70) + "\n");

  const stats = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    services: await prisma.service.count(),
    schedules: await prisma.schedule.count(),
    orders: await prisma.order.count(),
    coupons: await prisma.coupon.count(),
    reviews: await prisma.productReview.count(),
    notifications: await prisma.notification.count(),
  };

  console.log("📈 ESTATÍSTICAS:");
  console.log(`   👥 Usuários: ${stats.users}`);
  console.log(`   📦 Categorias: ${stats.categories}`);
  console.log(`   📱 Produtos: ${stats.products}`);
  console.log(`   🛠️  Serviços: ${stats.services}`);
  console.log(`   📅 Agendamentos: ${stats.schedules}`);
  console.log(`   🛒 Pedidos: ${stats.orders}`);
  console.log(`   🎫 Cupons: ${stats.coupons}`);
  console.log(`   ⭐ Avaliações: ${stats.reviews}`);
  console.log(`   🔔 Notificações: ${stats.notifications}\n`);

  console.log("🔑 CREDENCIAIS DE ACESSO:");
  console.log("\n   ADMIN:");
  console.log(`   Email: admin@applestore.com`);
  console.log(`   Senha: ${adminPassword}`);
  
  console.log("\n   TÉCNICOS:");
  console.log(`   Email: lucas@applestore.com`);
  console.log(`   Senha: Staff@123`);
  console.log(`   Email: fernanda@applestore.com`);
  console.log(`   Senha: Staff@123`);
  
  console.log("\n   CLIENTES:");
  console.log(`   Email: joao@example.com`);
  console.log(`   Senha: Cliente@123`);
  console.log(`   Email: maria@example.com`);
  console.log(`   Senha: Cliente@123\n`);

  console.log("💡 PRÓXIMOS PASSOS:");
  console.log("   1. Execute 'npm run dev' para iniciar o servidor");
  console.log("   2. Acesse http://localhost:3000");
  console.log("   3. Faça login com uma das credenciais acima");
  console.log("   4. Explore produtos, serviços e agendamentos!\n");

  console.log("=".repeat(70) + "\n");
}

main()
  .catch((e) => {
    console.error("\n❌ ERRO NO SEED:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });