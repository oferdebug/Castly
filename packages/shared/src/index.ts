/**
 * Shared Package Exports
 *
 * Public entrypoint that re-exports shared contracts consumed by all apps/services.
 *
 * Architecture Overview:
 * - Provides a stable import surface for types, constants, and validation schemas
 * - Reduces deep relative imports and keeps package boundaries explicit
 * - Enables consistent versioned contracts across the monorepo
 */
export * from "./types";
export * from "./constants";
export * from "./validation";
