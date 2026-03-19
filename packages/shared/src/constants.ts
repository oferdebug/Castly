/**
 * Shared Constants
 *
 * Centralized runtime constants used across services and web app boundaries.
 *
 * Architecture Overview:
 * - Defines service ports, auth expiries, AI pipeline thresholds, and headers
 * - Lives in shared package to keep cross-service values synchronized
 * - Exposes immutable values for compile-time safety and predictable behavior
 *
 * Operational Notes:
 * - Adjusting these values affects multiple services; treat changes as contract updates
 * - Header keys and token expiries are part of inter-service protocol assumptions
 */
export const SERVICE_PORTS = {
  WEB: 3000,
  AUTH: 4001,
  PODCAST: 4002,
  AI: 4003,
  SEARCH: 4004,
  ANALYTICS: 4005,
} as const;

export const FREE_TIER_CHAT_LIMIT = 3;

export const RAG_TOP_K = 8;
export const RAG_SIMILARITY_THRESHOLD = 0.7;
export const RAG_MIN_CHUNKS = 3;
export const RAG_TIMEOUT_MS = 5000;

export const TRANSCRIPT_CHUNK_TOKENS = 500;
export const MAX_EPISODE_DURATION_HOURS = 4;
export const WHISPER_MAX_FILE_SIZE_MB = 25;
export const AUDIO_CHUNK_DURATION_MIN = 10;
export const AUDIO_CHUNK_OVERLAP_SEC = 30;

export const JWT_ACCESS_EXPIRY = "15m";
export const JWT_REFRESH_EXPIRY = "7d";

export const BULLMQ_RETRY_ATTEMPTS = 3;
export const BULLMQ_RETRY_DELAYS = [30_000, 120_000, 600_000] as const;

export const INTERNAL_HEADERS = {
  USER_ID: "x-user-id",
  USER_ROLE: "x-user-role",
  INTERNAL_KEY: "x-internal-key",
} as const;
