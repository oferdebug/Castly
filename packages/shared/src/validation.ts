/**
 * Shared Validation Schemas
 *
 * Defines reusable Zod schemas for request validation across services.
 *
 * Architecture Overview:
 * - Centralized input contracts reduce duplicated validation logic
 * - Shared schemas align API behavior between backend services and clients
 * - Coercion/defaults provide consistent pagination/search behavior
 *
 * Reliability Notes:
 * - Schema updates are contract changes and should be coordinated with consumers
 * - Limits and string bounds help protect endpoints from malformed payloads
 */
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(255),
  role: z.enum(["listener", "creator"]).default("listener"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createPodcastSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const updatePodcastSchema = createPodcastSchema.partial();

export const createEpisodeSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(5000).optional(),
  episodeNumber: z.number().int().positive().optional(),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(500),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
