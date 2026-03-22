import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
      });
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
    });
  },
});

export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const setUserRole=mutation({
  args:{
    clerkId:v.string(),
    role:v.union(v.literal('listener'),v.literal('creator')),
  },
  handler:async(ctx,args)=>{
    const user=await ctx.db
    .query('users')
    .withIndex('by_clerk_id',(q)=>q.eq('clerkId',args.clerkId))
    .unique();

    if(!user) throw new Error('User Not Found');

    return await ctx.db.patch(user._id,{
      role:args.role,
      onBoardingCompleted:true,
    });
  },
});