import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createPodcast = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("podcasts", {
      creatorId: user._id,
      title: args.title,
      description: args.description,
      coverImageUrl: args.coverImageUrl,
      category: args.category,
      tags: args.tags,
      isPublished: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updatePodcast = mutation({
  args: {
    id: v.id("podcasts"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { id, ...updates } = args;
    return await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const deletePodcast = mutation({
  args: { id: v.id("podcasts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    await ctx.db.delete(args.id);
  },
});

export const getMyPodcasts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("podcasts")
      .withIndex("by_creator", (q) => q.eq("creatorId", user._id))
      .collect();
  },
});

export const getPodcastById = query({
  args: { id: v.id("podcasts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getPublishedPodcasts = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("podcasts")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .collect();
  },
});