/**
 * Shared AI Pipeline Types
 *
 * Defines canonical contracts for transcription, summarization, embeddings,
 * and conversational AI artifacts.
 *
 * Architecture Overview:
 * - Captures asynchronous AI pipeline outputs as typed shared interfaces
 * - Supports cross-service communication for processing and retrieval stages
 * - Encodes status transitions for UI and job orchestration visibility
 */
export type TranscriptStatus = "pending" | "processing" | "done" | "failed";

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker: string | null;
}

export interface Transcript {
  id: string;
  episodeId: string;
  content: string;
  segments: TranscriptSegment[];
  status: TranscriptStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  title: string;
  start: number;
  end: number;
}

export interface Summary {
  id: string;
  episodeId: string;
  tldr: string;
  keyTakeaways: string[];
  chapters: Chapter[];
  showNotes: string;
  createdAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestampRef: number | null;
}

export interface Conversation {
  id: string;
  userId: string;
  episodeId: string;
  messages: ChatMessage[];
  createdAt: string;
}

export interface EpisodeEmbedding {
  id: string;
  episodeId: string;
  chunkText: string;
  chunkIndex: number;
  timestampStart: number | null;
  timestampEnd: number | null;
  createdAt: string;
}

export type PipelineStatus = {
  episodeId: string;
  transcription: TranscriptStatus;
  summarization: TranscriptStatus;
  embedding: TranscriptStatus;
};
