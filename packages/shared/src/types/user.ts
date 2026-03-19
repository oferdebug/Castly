/**
 * Shared User/Auth Types
 *
 * Defines user-facing auth contracts shared across services and frontend.
 *
 * Architecture Overview:
 * - Central user identity model consumed by auth/profile/session flows
 * - Token payload contract used by JWT signer/verifier paths
 * - Role/tier unions provide strict compile-time authorization constraints
 */
export type UserRole = "listener" | "creator" | "admin";
export type SubscriptionTier = "free" | "premium";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
}
