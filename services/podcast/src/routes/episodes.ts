/**
 * Episode Routes
 *
 * Defines HTTP endpoints for episode management and audio file uploads
 * in the podcast service.
 *
 * Architecture Overview:
 * - Audio files are buffered in memory via Multer and streamed directly to S3
 * - Episode upload triggers an event that the AI service consumes asynchronously
 * - Creator ownership is verified against the parent podcast before any write
 *
 * Security & Reliability:
 * - Only the podcast owner or admin can upload, update, or delete episodes
 * - Audio file type and size are validated at the Multer layer before S3 upload
 * - S3 keys follow a deterministic pattern: audio/{podcastId}/{episodeId}.{ext}
 *
 * Endpoints (mounted at /api/v1/episodes):
 * - POST /podcasts/:id/episodes     Upload new episode with audio file
 * - GET  /:id/episodes             List episodes for a podcast
 * - GET  /:id                      Get single episode details
 * - PUT  /:id                      Update episode metadata
 * - DELETE /:id                    Delete episode and remove audio from S3
 */

import { Router, Response } from 'express';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../lib/prisma';
import { s3, BUCKET_NAME } from '../lib/s3';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { audioUpload } from '../utils/upload';


const router: Router = Router();

router.post('/podcasts/:id/episodes', authenticate, audioUpload.single('audio'), async (req, res) => {
    try {
        const podcast = await prisma.podcast.findUnique({ where: { id: req.params.id as string } });


        if (!podcast) {
            res.status(404).json({ error: 'Podcast Not Found,Please Try Again' });
            return;
        }

        if (podcast.creatorId !== (req as AuthRequest).userId && (req as AuthRequest).userRole !== 'admin') {
            res.status(403).json({ error: 'Forbidden: You do not have permission to upload episodes for this podcast' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: 'Audio FIle Is Required' });
            return;
        }


        const { title, description, episodeNumber } = req.body;

        if (!title) {
            res.status(400).json({ error: 'Title Is Required!' });
            return;
        }


        const episode = await prisma.episode.create({
            data: {
                podcastId: podcast.id,
                title,
                description,
                episodeNumber: episodeNumber ? parseInt(episodeNumber) : undefined,
                audioUrl: '',
            },
        });

        const ext = req.file?.originalname?.split('.').pop();
        const s3key = `audio/${req.params.id}/${episode.id}.${ext}`;

        await s3.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3key,
            Body: req.file?.buffer,
            ContentType: req.file?.mimetype || 'application/octet-stream',
        }));

        const audioUrl = `${process.env.S3_PUBLIC_URL}/${s3key}`;

        const updatedEpisode = await prisma.episode.update({
            where: { id: episode.id },
            data: { audioUrl },
        });

        res.status(201).json({ message: 'Episode uploaded successfully', episode: updatedEpisode });
    } catch (error) {
        console.error('Error creating episode:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/:id/episodes', async (req, res): Promise<void> => {
  try {
    const podcast = await prisma.podcast.findUnique({ where: { id: req.params.id } });

    if (!podcast) {
      res.status(404).json({ error: 'Podcast not found' });
      return;
    }

    const episodes = await prisma.episode.findMany({
      where: { podcastId: req.params.id, isPublished: true },
      orderBy: { episodeNumber: 'asc' },
    });

    res.json({ episodes });
  } catch (err) {
    console.error('[GET /podcasts/:id/episodes]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Single episode by id — must come after GET /:id/episodes so :id isn't consumed by list route
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const episode = await prisma.episode.findUnique({
      where: { id: req.params.id },
      include: { podcast: true },
    });

    if (!episode) {
      res.status(404).json({ error: 'Episode not found' });
      return;
    }

    res.json({ episode });
  } catch (err) {
    console.error('[GET /episodes/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episode = await prisma.episode.findUnique({
      where: { id: req.params.id as string },
    });

    if (!episode) {
      res.status(404).json({ error: 'Episode not found' });
      return;
    }

    const podcast = await prisma.podcast.findUnique({ where: { id: episode.podcastId } });

    if (!podcast || (podcast.creatorId !== req.userId && req.userRole !== 'admin')) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { title, description, episodeNumber, isPublished, publishedAt } = req.body;

    const updated = await prisma.episode.update({
      where: { id: req.params.id as string },
      data: { title, description, episodeNumber, isPublished, publishedAt },
    });

    res.json({ episode: updated });
  } catch (err) {
    console.error('[PUT /episodes/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const episode = await prisma.episode.findUnique({
      where: { id: req.params.id as string },
    });

    if (!episode) {
      res.status(404).json({ error: 'Episode not found' });
      return;
    }

    const podcast = await prisma.podcast.findUnique({ where: { id: episode.podcastId } });

    if (!podcast || (podcast.creatorId !== req.userId && req.userRole !== 'admin')) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const s3Key = episode.audioUrl.replace(`${process.env.S3_PUBLIC_URL}/`, '');
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key }));

    await prisma.episode.delete({ where: { id: req.params.id as string } });

    res.status(204).send();
  } catch (err) {
    console.error('[DELETE /episodes/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;