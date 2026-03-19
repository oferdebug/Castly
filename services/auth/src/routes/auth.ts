/**
 * Authentication Routes
 *
 * Defines HTTP endpoints for account registration, login, token refresh, and
 * authenticated profile/role operations in the auth service.
 *
 * Architecture Overview:
 * - Stateless access-token auth with DB-backed refresh-token rotation
 * - Centralized route module that owns auth session lifecycle endpoints
 * - Shared JWT payload contract for downstream service authorization
 *
 * Security & Reliability:
 * - Passwords are hashed before persistence and never returned in responses
 * - Refresh tokens are one-time rotated on `/refresh` to limit replay risk
 * - Protected routes require bearer token validation via auth middleware
 *
 * Request Flow:
 * 1. Client registers/logs in → receives access token + refresh token
 * 2. Access token expires → client calls `/refresh` with refresh token
 * 3. Service validates + rotates token pair → returns fresh session tokens
 * 4. Client calls protected routes (`/me`, `/upgrade-to-creator`) with bearer token
 */
import { NextFunction, Request, Response, Router } from "express";
import type { SubscriptionTier, UserRole } from "@ai-podcast/shared";
import { prisma } from "../lib/prisma";
import { hashPassword, verifyPassword } from "../utils/password";
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from "../utils/jwt";

const router: Router = Router();

const VALID_ROLES = ['listener', 'creator', 'admin'] as const;
const VALID_TIERS = ['free', 'premium'] as const;

function toUserRole(value: string): UserRole {
  if (VALID_ROLES.includes(value as any)) {
    return value as UserRole;
  }
  throw new Error(`Invalid user role: ${value}`);
}

function toSubscriptionTier(value: string): SubscriptionTier {
  if (VALID_TIERS.includes(value as any)) {
    return value as SubscriptionTier;
  }
  throw new Error(`Invalid subscription tier: ${value}`);
}

interface AuthRequest extends Request {
  userId?: string;
  email?: string;
  userRole?: string;
}

const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
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
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email,passsord,and Name Are Required' });
            return;
        }
        const exsiting = await prisma.user.findUnique({ where: { email } });
        if (exsiting) {
            res.status(409).json({ error: 'Email Already In Use' });
            return;
        }

        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: { email, passwordHash, name },
        });

        const accessToken = generateAccessToken({
            userId: user.id,
            role: toUserRole(user.role),
            email: user.email,
            subscriptionTier: toSubscriptionTier(user.subscriptionTier),
        });
        const refreshToken = generateRefreshToken();
        
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        res.status(201).json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                subscriptionTier: user.subscriptionTier,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});


router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email&Password Are Required!' });
            return;
        }
 
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid Credentials' })
            return;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid Credentials' })
            return;
        }



        const accessToken = generateAccessToken({
            userId: user.id,
            role: toUserRole(user.role),
            email: user.email,
            subscriptionTier: toSubscriptionTier(user.subscriptionTier),
        });


        const refreshToken = generateRefreshToken();
        
        await prisma.refreshToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        
        res.status(200).json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                subscriptionTier: user.subscriptionTier,
            },
        });
    } catch (error) {
        console.error('[Login error]:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});



router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({ error: 'Refresh token is required' });
            return;
        }

        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });


        if (!storedToken || storedToken.expiresAt < new Date()) {
            res.status(401).json({ error: 'Invalid Or Expired Refresh Token' });
            return;
        }

        await prisma.refreshToken.delete({ where: { id: storedToken.id } });

        const newAccessToken = generateAccessToken({
            userId: storedToken.user.id,
            role: toUserRole(storedToken.user.role),
            email: storedToken.user.email,
            subscriptionTier: toSubscriptionTier(storedToken.user.subscriptionTier),
        });

        const newRefreshToken = generateRefreshToken();

        await prisma.refreshToken.create({
            data: {
                userId: storedToken.user.id,
                token: newRefreshToken,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (error) {
        console.error('[Refresh error]:', error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});


router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        subscriptionTier: true,
        subscriptionExpiresAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('[me]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/upgrade-to-creator', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.role === 'creator' || user.role === 'admin') {
      res.status(400).json({ error: 'User is already a creator or admin' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { role: 'creator' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionTier: true,
      },
    });

    res.json({ user: updated, message: 'Role upgraded to creator. Please refresh your token.' });
  } catch (err) {
    console.error('[upgrade-to-creator]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;