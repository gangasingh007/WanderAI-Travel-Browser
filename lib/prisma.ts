import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton for database operations
 * 
 * This prevents multiple instances of Prisma Client in development
 * and ensures we have a single connection pool in production.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ["query", "error", "warn"],
});

// Prevent creating multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

