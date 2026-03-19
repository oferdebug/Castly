/**
 * Password Utilities
 *
 * Defines password hashing and verification helpers used by auth routes.
 *
 * Architecture Overview:
 * - Uses bcrypt with a fixed work factor for deterministic service behavior
 * - Keeps password operations centralized to avoid duplicated auth logic
 * - Exposes async helpers for registration and login flows
 *
 * Security & Reliability:
 * - Plain passwords are never stored or returned beyond request scope
 * - Hash comparisons use bcrypt-safe verification semantics
 * - A single utility surface reduces inconsistent password handling
 *
 * Usage Flow:
 * 1. Registration hashes incoming password before DB write
 * 2. Login verifies provided password against stored hash
 */
import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
}

export const verifyPassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
}