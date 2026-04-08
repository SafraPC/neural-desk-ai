import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("admin", 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      username: "admin",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
