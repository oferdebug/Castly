/**
 * Prisma Client — Podcast Service
 *
 * Exports a singleton Prisma client instance for use across the podcast service.
 *
 * Architecture Overview:
 * - Singleton pattern prevents multiple client instances during development hot-reloads
 * - globalThis cache is only active outside of production to avoid memory leaks
 * - Each microservice owns its own Prisma instance scoped to its database schema
 */

import { PrismaClient } from "../generated/prisma"

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();


if(process.env.NODE_ENV!=='production') {
    globalForPrisma.prisma = prisma;
}