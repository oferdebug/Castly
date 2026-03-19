/**
 * Prisma Config: Auth Service
 *
 * Configures Prisma schema and database connectivity for the auth domain.
 *
 * Architecture Overview:
 * - Uses a service-local schema file for clear bounded-context ownership
 * - Resolves database URL from environment with a dev-safe fallback
 * - Reuses the same URL for runtime queries and migration operations
 *
 * Reliability Notes:
 * - Centralized DB URL mapping keeps local/dev/prod config paths consistent
 * - Explicit schema path avoids accidental cross-service schema usage
 */
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbUrl =
  process.env.AUTH_DB_URL ||
  "postgresql://podcast:podcast_dev@localhost:5432/auth_db";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
});
