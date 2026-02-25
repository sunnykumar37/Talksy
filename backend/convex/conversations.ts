import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./auth";

export const createOrGetConversation = mutation({
    args: {
        otherUserId: v.id("users"),
        isGroup: v.boolean(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Not authenticated");

        if (!args.isGroup) {
            // Check for existing 1-on-1 conversation
            const allConversations = await ctx.db
                .query("conversations")
                .filter((q) => q.eq(q.field("isGroup"), false))
                .collect();

            const existing = allConversations.find((c) =>
                c.members.includes(user._id) && c.members.includes(args.otherUserId) && c.members.length === 2
            );

            if (existing) return existing._id;

            const conversationId = await ctx.db.insert("conversations", {
                isGroup: false,
                members: [user._id, args.otherUserId],
                updatedAt: Date.now(),
            });

            // Initialize members tracking for unread counts
            await ctx.db.insert("conversationMembers", {
                conversationId,
                userId: user._id,
                lastReadAt: Date.now(),
            });
            await ctx.db.insert("conversationMembers", {
                conversationId,
                userId: args.otherUserId,
                lastReadAt: 0,
            });

            return conversationId;
        }

        // Group conversation logic
        const conversationId = await ctx.db.insert("conversations", {
            isGroup: true,
            name: args.name,
            members: [user._id, args.otherUserId],
            updatedAt: Date.now(),
        });


        // Initialize members for group
        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: user._id,
            lastReadAt: Date.now(),
        });
        await ctx.db.insert("conversationMembers", {
            conversationId,
            userId: args.otherUserId,
            lastReadAt: 0,
        });

        return conversationId;
    },
});

export const getUserConversations = query({
    args: {},
    handler: async (ctx) => {
        console.log("getUserConversations: Query started");
        const user = await getCurrentUser(ctx);
        if (!user) {
            console.log("getUserConversations: No user found, returning empty list");
            return [];
        }
        console.log("getUserConversations: User found", user._id);

        const conversations = await ctx.db
            .query("conversations")
            .collect();

        console.log("getUserConversations: Total conversations found in DB", conversations.length);

        // Filter conversations where the user is a member and sort by updatedAt
        const userConversations = conversations
            .filter((c) => c.members.includes(user._id))
            .sort((a, b) => b.updatedAt - a.updatedAt);

        // For each conversation, compute last message + unread count
        const enriched = await Promise.all(
            userConversations.map(async (conversation) => {
                const messages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) =>
                        q.eq("conversationId", conversation._id)
                    )
                    .order("desc")
                    .collect();

                // Apply same visibility rules as getMessages
                const visibleMessages = messages.filter(
                    (m) => !m.deleted && !(m.deletedFor?.includes(user._id))
                );

                const lastMessage = visibleMessages[0];

                const unreadCount = visibleMessages.filter((m) => {
                    const seenBy = m.seenBy ?? [];
                    return !seenBy.includes(user._id as string);
                }).length;

                return {
                    ...conversation,
                    lastMessageContent: lastMessage?.content ?? null,
                    lastMessageTime: lastMessage?.createdAt ?? null,
                    unreadCount,
                };
            })
        );

        return enriched;
    },
});

export const markConversationAsRead = mutation({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Not authenticated");

        const member = await ctx.db
            .query("conversationMembers")
            .withIndex("by_conversationId_and_userId", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", user._id)
            )
            .unique();

        if (member) {
            await ctx.db.patch(member._id, {
                lastReadAt: Date.now(),
            });
        }
    },
});

export const getConversationById = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.conversationId);
    },
});

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Not authenticated");

        const existing = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId_and_userId", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", user._id)
            )
            .unique();

        if (args.isTyping) {
            if (existing) {
                await ctx.db.patch(existing._id, { lastUpdated: Date.now() });
            } else {
                await ctx.db.insert("typingIndicators", {
                    conversationId: args.conversationId,
                    userId: user._id,
                    lastUpdated: Date.now(),
                });
            }
        } else {
            if (existing) {
                await ctx.db.delete(existing._id);
            }
        }
    },
});

export const getTypingUsers = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const indicators = await ctx.db
            .query("typingIndicators")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const fiveSecondsAgo = Date.now() - 5000;
        const activeIndicators = indicators.filter((i) => i.lastUpdated > fiveSecondsAgo);

        const users = await Promise.all(
            activeIndicators.map(async (i) => {
                const user = await ctx.db.get(i.userId);
                return user?.name || "Someone";
            })
        );

        return users;
    },
});


