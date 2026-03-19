/**
 * Podcast Routes
 *
 * Defines HTTP endpoints for podcast and library management in the podcast service.
 *
 * Architecture Overview:
 * - Stateless route handlers backed by Prisma ORM for PostgreSQL access
 * - Creator identity is derived from gateway-injected headers, not JWT claims
 * - Cross-service user references (creatorId, userId) are stored as UUIDs
 *   without foreign keys, following the microservice data isolation pattern
 *
 * Security & Reliability:
 * - Write operations verify resource ownership before applying changes
 * - Admin role bypasses ownership checks for moderation purposes
 * - Follow/unfollow is idempotent — repeated calls toggle state safely
 *
 * Endpoints:
 * - GET    /podcasts              List published podcasts (paginated + filterable)
 * - POST   /podcasts              Create podcast (creator/admin only)
 * - GET    /podcasts/:id          Get podcast with episodes and follower count
 * - PUT    /podcasts/:id          Update podcast (owner/admin only)
 * - DELETE /podcasts/:id          Delete podcast (owner/admin only)
 * - POST   /podcasts/:id/follow   Toggle follow/unfollow for authenticated user
 * - GET    /podcasts/library      List podcasts followed by authenticated user
 */

import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/authenticate";

const router: Router = Router();

router.get('/', async (req, res): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const category = req.query.category as string | undefined;
        const skip = (page - 1) * limit;
 
        
        const where = {
            isPublished: true,
            ...(category && { category }),
        };


        const [podcasts, total] = await Promise.all([
            prisma.podcast.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { episodes: true, followers: true } } },
            }),
            prisma.podcast.count({ where }),
        ]);

        res.json({ podcasts, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error('[GET /podcasts]', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.userRole !== 'creator' && req.userRole !== 'admin') {
      res.status(403).json({ error: 'Only creators can create podcasts' });
      return;
    }

    const { title, description, coverImageUrl, category, tags } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const podcast = await prisma.podcast.create({
      data: {
        creatorId: req.userId!,
        title,
        description,
        coverImageUrl,
        category,
        tags: tags || [],
      },
    });

    res.status(201).json({ podcast });
  } catch (err) {
    console.error('[POST /podcasts]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res): Promise<void> => {
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: req.params.id },
      include: {
        episodes: {
          where: { isPublished: true },
          orderBy: { episodeNumber: 'asc' },
        },
        _count: { select: { followers: true } },
      },
    });

    if (!podcast) {
      res.status(404).json({ error: 'Podcast not found' });
      return;
    }

    res.json({ podcast });
  } catch (err) {
    console.error('[GET /podcasts/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const podcast = await prisma.podcast.findUnique({ where: { id: req.params.id as string } });

    if (!podcast) {
      res.status(404).json({ error: 'Podcast not found' });
      return;
    }

    if (podcast.creatorId !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { title, description, coverImageUrl, category, tags, isPublished } = req.body;

    const updated = await prisma.podcast.update({
      where: { id: req.params.id as string },
      data: { title, description, coverImageUrl, category, tags, isPublished },
    });

    res.json({ podcast: updated });
  } catch (err) {
    console.error('[PUT /podcasts/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const podcast = await prisma.podcast.findUnique({ where: { id: req.params.id as string } });

    if (!podcast) {
      res.status(404).json({ error: 'Podcast not found' });
      return;
    }

    if (podcast.creatorId !== req.userId && req.userRole !== 'admin') {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await prisma.podcast.delete({ where: { id: req.params.id as string } });

    res.status(204).send();
  } catch (err) {
    console.error('[DELETE /podcasts/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/follow', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.podcastFollow.findUnique({
      where: { userId_podcastId: { userId: req.userId!, podcastId: req.params.id as string } },
    });

    if (existing) {
      await prisma.podcastFollow.delete({ where: { id: existing.id } });
      res.json({ following: false });
    } else {
      await prisma.podcastFollow.create({
        data: { userId: req.userId!, podcastId: req.params.id as string },
      });
      res.json({ following: true });
    }
  } catch (err) {
    console.error('[POST /podcasts/:id/follow]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/library', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const follows = await prisma.podcastFollow.findMany({
      where: { userId: req.userId },
      include: {
        podcast: {
          include: { _count: { select: { episodes: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ podcasts: follows.map(f => f.podcast) });
  } catch (err) {
    console.error('[GET /library]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;