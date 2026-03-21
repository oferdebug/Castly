import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  podcasts: defineTable({
    creatorId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_published", ["isPublished"]),

  episodes: defineTable({
    podcastId: v.id("podcasts"),
    title: v.string(),
    description: v.optional(v.string()),
    audioUrl: v.string(),
    audioStorageId: v.optional(v.id("_storage")),
    durationSeconds: v.optional(v.number()),
    episodeNumber: v.optional(v.number()),
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),
    transcript: v.optional(v.string()),
    summary: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_podcast", ["podcastId"])
    .index("by_published", ["isPublished"]),

  podcastFollows: defineTable({
    userId: v.id("users"),
    podcastId: v.id("podcasts"),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_podcast", ["podcastId"]),

  listenEvents: defineTable({
    userId: v.optional(v.id("users")),
    episodeId: v.id("episodes"),
    podcastId: v.id("podcasts"),
    durationListened: v.number(),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_episode", ["episodeId"])
    .index("by_podcast", ["podcastId"]),
});
