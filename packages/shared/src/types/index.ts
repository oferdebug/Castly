/**
 * Shared Type Exports
 *
 * Barrel file for all shared domain type modules.
 *
 * Architecture Overview:
 * - Provides a single import path for user, podcast, AI, and analytics types
 * - Keeps consumers decoupled from internal file layout changes
 * - Supports consistent contract adoption across services and frontend
 */
export * from "./user";
export * from "./podcast";
export * from "./ai";
export * from "./analytics";
