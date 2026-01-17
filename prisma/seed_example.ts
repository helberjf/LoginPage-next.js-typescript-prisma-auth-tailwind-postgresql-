// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});
const prisma = new PrismaClient({
  adapter
});

async function main() {
  const email = "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
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
  });

  console.log("✅ Admin criado/atualizado");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
