import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createEpisode = mutation({
  args: {
    podcastId: v.id("podcasts"),
    title: v.string(),
    description: v.optional(v.string()),
    audioUrl: v.string(),
    audioStorageId: v.optional(v.id("_storage")),
    durationSeconds: v.optional(v.number()),
    episodeNumber: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("episodes", {
      ...args,
      isPublished: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateEpisode = mutation({
  args: {
    id: v.id("episodes"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    audioUrl: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    episodeNumber: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
    publishedAt: v.optional(v.number()),
    transcript: v.optional(v.string()),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { id, ...updates } = args;
    return await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const deleteEpisode = mutation({
  args: { id: v.id("episodes") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

export const getEpisodesByPodcast = query({
  args: { podcastId: v.id("podcasts") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("episodes")
      .withIndex("by_podcast", (q) => q.eq("podcastId", args.podcastId))
      .collect();
  },
});

export const getEpisodeById = query({
  args: { id: v.id("episodes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    return await ctx.storage.generateUploadUrl();
  },
});
