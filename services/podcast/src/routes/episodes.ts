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
 * - GET  /podcasts/:id/episodes     List episodes for a podcast
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

// Map MIME types to file extensions for S3 key construction
const AUDIO_MIME_TO_EXT: Record<string, string> = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
    'audio/x-flac': 'flac',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
};

router.post('/podcasts/:id/episodes', authenticate, audioUpload.single('audio'), async (req, res) => {
    try {
        const s3PublicUrl = process.env.S3_PUBLIC_URL;
        if (!s3PublicUrl) {
            res.status(500).json({ error: 'Server misconfiguration: S3_PUBLIC_URL is not set' });
            return;
        }

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

        if (episodeNumber !== undefined && episodeNumber !== '') {
            const parsed = parseInt(episodeNumber, 10);
            if (isNaN(parsed)) {
                res.status(400).json({ error: 'episodeNumber must be a valid integer' });
                return;
            }
        }

        const ext = AUDIO_MIME_TO_EXT[req.file.mimetype];
        if (!ext) {
            res.status(400).json({ error: 'Unsupported audio file type' });
            return;
        }

        const episode = await prisma.episode.create({
            data: {
                podcastId: podcast.id,
                title,
                description,
                episodeNumber: episodeNumber !== undefined && episodeNumber !== '' ? parseInt(episodeNumber, 10) : undefined,
                audioUrl: '',
            },
        });

        const s3key = `audio/${req.params.id}/${episode.id}.${ext}`;

        try {
            await s3.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3key,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }));
        } catch (uploadError) {
            // Roll back the episode record if the S3 upload fails
            await prisma.episode.delete({ where: { id: episode.id } });
            throw uploadError;
        }

        const audioUrl = `${s3PublicUrl}/${s3key}`;

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

router.get('/podcasts/:id/episodes', async (req, res): Promise<void> => {
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

// Single episode by id — must come after GET /podcasts/:id/episodes so :id isn't consumed by list route
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

    if (!episode.isPublished) {
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

    const s3PublicUrl = process.env.S3_PUBLIC_URL;
    if (s3PublicUrl && episode.audioUrl && episode.audioUrl.startsWith(`${s3PublicUrl}/`)) {
      const s3Key = episode.audioUrl.replace(`${s3PublicUrl}/`, '');
      await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key }));
    } else if (episode.audioUrl) {
      console.warn(`[DELETE /episodes/:id] Skipping S3 delete: audioUrl "${episode.audioUrl}" does not match S3_PUBLIC_URL`);
    }

    await prisma.episode.delete({ where: { id: req.params.id as string } });

    res.status(204).send();
  } catch (err) {
    console.error('[DELETE /episodes/:id]', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;