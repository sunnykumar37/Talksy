import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createOrGetUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl,
                lastSeen: Date.now(),
            });
            return user._id;
        }

        const userId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl,
            isOnline: true,
            lastSeen: Date.now(),
        });

        return userId;
    },
});

export const getUsers = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        const users = await ctx.db.query("users").collect();
        return users.filter((u) => u._id !== currentUser._id);
    },
});



export const searchUsers = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) return [];

        if (args.query === "") {
            const users = await ctx.db.query("users").collect();
            return users.filter((user) => user._id !== currentUser._id);
        }

        const users = await ctx.db
            .query("users")
            .withSearchIndex("search_name", (q) => q.search("name", args.query))
            .collect();

        return users.filter((user) => user._id !== currentUser._id);
    },
});


export const setUserOnline = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                isOnline: true,
                lastSeen: Date.now(),
            });
        }
    },
});

export const setUserOffline = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                isOnline: false,
                lastSeen: Date.now(),
            });
        }
    },
});

export const getUserById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        console.log("getUserByClerkId: Searching for", args.clerkId);
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
        console.log("getUserByClerkId: Result", user ? "User found" : "User not found");
        return user;
    },
});


