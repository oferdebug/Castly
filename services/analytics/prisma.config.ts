/**
 * Prisma Config: Analytics Service
 *
 * Configures Prisma schema and DB connectivity for analytics data pipelines.
 *
 * Architecture Overview:
 * - Service-scoped schema keeps analytics persistence contracts isolated
 * - DB URL is sourced from environment with local fallback for dev workflows
 * - Single URL source is reused across datasource and migration context
 */
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbUrl =
  process.env.ANALYTICS_DB_URL ||
  "postgresql://podcast:podcast_dev@localhost:5432/analytics_db";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
});
