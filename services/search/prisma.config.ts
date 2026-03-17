/**
 * Prisma Config: Search Service
 *
 * Configures Prisma schema and database connectivity for search domain storage.
 *
 * Architecture Overview:
 * - Service-local schema isolates search persistence model from other services
 * - DB URL is environment-driven with deterministic local fallback
 * - Shared URL source is used for datasource and migration execution
 */
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbUrl =
  process.env.SEARCH_DB_URL ||
  "postgresql://podcast:podcast_dev@localhost:5432/search_db";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
});
