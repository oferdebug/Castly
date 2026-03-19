/**
 * Prisma Config: AI Service
 *
 * Configures Prisma schema resolution and DB connectivity for AI workloads.
 *
 * Architecture Overview:
 * - Service-local schema keeps AI data model isolated from other services
 * - DB URL is sourced from env with a local development fallback
 * - Migration URL is resolved through an async provider for config parity
 *
 * Reliability Notes:
 * - Explicit schema path avoids accidental schema drift in monorepo context
 * - Single dbUrl source keeps datasource/migration behavior aligned
 */
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbUrl =
  process.env.AI_DB_URL ||
  "postgresql://podcast:podcast_dev@localhost:5432/ai_db";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
});
