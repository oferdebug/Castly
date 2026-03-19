/**
 * S3 Client — Podcast Service
 *
 * Configures and exports an AWS S3-compatible client for audio file storage.
 *
 * Architecture Overview:
 * - Compatible with AWS S3 and Cloudflare R2 via configurable endpoint
 * - Credentials and bucket name are injected via environment variables
 * - Used exclusively by the episode upload flow for storing audio files
 *
 * Environment Variables:
 * - AWS_REGION: Storage region (defaults to 'auto' for R2)
 * - S3_ENDPOINT: Custom endpoint URL (required for R2 or MinIO)
 * - AWS_ACCESS_KEY_ID: Storage access key
 * - AWS_SECRET_ACCESS_KEY: Storage secret key
 * - S3_BUCKET_NAME: Target bucket for audio uploads
 */

import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME!;