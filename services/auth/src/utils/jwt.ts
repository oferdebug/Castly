/**
 * JWT Utilities
 *
 * Defines token helpers for authentication flows in the auth service:
 * access-token signing/verification and refresh-token generation.
 *
 * Architecture Overview:
 * - Access tokens are signed JWTs carrying user identity and role claims
 * - Refresh tokens are opaque UUID values persisted in the database
 * - Expiry windows are driven by shared config for cross-service consistency
 *
 * Security & Reliability:
 * - Separate secrets are used for access and refresh token contexts
 * - Access-token verification is centralized to keep auth behavior consistent
 * - Refresh expiry is computed deterministically from configured policy
 *
 * Token Flow:
 * 1. Auth route signs access token with user claims
 * 2. Auth route creates opaque refresh token for session continuation
 * 3. Middleware verifies access token on protected requests
 * 4. Refresh endpoints issue new token pairs when rotation succeeds
 */
  import jwt from "jsonwebtoken";
  import { v4 as uuidv4 } from "uuid";
  import { JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY } from "@ai-podcast/shared";
  import type { JwtPayload } from "@ai-podcast/shared";

  const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret";
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

  export function generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
  }

  export function generateRefreshToken(): string {
    return uuidv4();
  }

  export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  }

  export function getRefreshExpiry(): Date {
    const days = parseInt(JWT_REFRESH_EXPIRY.replace("d", ""), 10);
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  }
