import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function checkDbConnection() {
  await prisma.$queryRaw`SELECT 1`;
  return { connection: "healthy" };
}

export { prisma };