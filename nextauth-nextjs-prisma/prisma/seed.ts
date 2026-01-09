// prisma/seed.ts
import "dotenv/config"
import { PrismaClient, Role } from "../app/generated/prisma"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = "admin@example.com".toLowerCase()
  const plainPassword = process.env.ADMIN_PASSWORD ?? "Admin@123"

  const passwordHash = await bcrypt.hash(plainPassword, 12)

  await prisma.user.upsert({
    where: { email },
    update: {
      role: Role.ADMIN, // garante privilégio
    },
    create: {
      name: "Admin",
      email,
      password: passwordHash,
      role: Role.ADMIN,
    },
  })

  console.log("✅ Seed executado com sucesso (ADMIN garantido)")
}

main()
  .catch((error) => {
    console.error("❌ Erro no seed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
