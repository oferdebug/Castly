/**
 * Shared Podcast Domain Types
 *
 * Defines canonical podcast, episode, and subscription contracts.
 *
 * Architecture Overview:
 * - Shared DTO-style interfaces used by podcast service and web clients
 * - Publish-state and metadata fields support creator and listener workflows
 * - Subscription shape provides a lightweight follow relationship contract
 */
export interface Podcast {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  category: string | null;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  id: string;
  podcastId: string;
  title: string;
  description: string | null;
  audioUrl: string;
  durationSeconds: number | null;
  episodeNumber: number | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PodcastSubscription {
  id: string;
  userId: string;
  podcastId: string;
  createdAt: string;
}
