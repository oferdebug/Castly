/**
 * Authentication Middleware — Podcast Service
 *
 * Extracts and validates user identity from gateway-injected request headers.
 *
 * Architecture Overview:
 * - Trusts x-user-id and x-user-role headers forwarded by the Next.js API gateway
 * - Does not perform JWT verification — that responsibility belongs to the gateway
 * - Internal services are only reachable via the private Docker network, making
 *   header trust safe within this architecture
 *
 * Security Note:
 * - Direct external access to this service bypassing the gateway is prevented
 *   by network isolation defined in docker-compose
 *
 * Request Flow:
 * 1. Gateway validates JWT and injects x-user-id + x-user-role headers
 * 2. This middleware reads those headers and enriches the request context
 * 3. Protected route handlers access req.userId and req.userRole directly
 */
import { verifyAccessToken } from "../utils/jwt";

type NextFunction = () => void;

interface ResponseLike {
    status: (code: number) => { json: (body: { message: string }) => void };
}

export interface AuthRequest {
    headers: { authorization?: string };
    userId?: string;
    email?: string;
    userRole?: string;
}


export const authenticate = (req: AuthRequest, res: ResponseLike, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyAccessToken(token);
        req.userId = payload.userId;
        req.email = payload.email;
        req.userRole = payload.role;
        next();
    } catch {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
