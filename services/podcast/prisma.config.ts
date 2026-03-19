/**
 * Prisma Config: Podcast Service
 *
 * Configures Prisma schema location and DB connectivity for podcast domain data.
 *
 * Architecture Overview:
 * - Uses a service-owned schema to isolate podcast persistence contracts
 * - Resolves DB URL from env with local fallback for development workflows
 * - Shares one URL source between runtime datasource and migration context
 */
import path from "node:path";
import { defineConfig } from "prisma/config";

const dbUrl =
  process.env.PODCAST_DB_URL ||
  "postgresql://podcast:podcast_dev@localhost:5432/podcast_db";

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: dbUrl,
  },
});
