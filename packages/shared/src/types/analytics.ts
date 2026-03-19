/**
 * Shared Analytics Types
 *
 * Defines event and aggregate contracts for listening analytics surfaces.
 *
 * Architecture Overview:
 * - Raw listen event model supports ingestion and event-level analysis
 * - Aggregate podcast/episode views power creator dashboards
 * - Trending payload shape aligns backend ranking with UI rendering needs
 */
export interface ListenEvent {
  id: string;
  userId: string;
  episodeId: string;
  startedAt: string;
  durationListened: number;
  completed: boolean;
  createdAt: string;
}

export interface PodcastAnalytics {
  podcastId: string;
  totalListens: number;
  uniqueListeners: number;
  avgListenDuration: number;
  completionRate: number;
  episodes: EpisodeAnalytics[];
}

export interface EpisodeAnalytics {
  episodeId: string;
  totalListens: number;
  uniqueListeners: number;
  avgListenDuration: number;
  completionRate: number;
}

export interface TrendingEpisode {
  episode: {
    id: string;
    title: string;
    podcastId: string;
    podcastTitle: string;
    coverImageUrl: string | null;
  };
  listenCount: number;
}
