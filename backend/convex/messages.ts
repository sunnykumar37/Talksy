import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./auth";

export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Not authenticated");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: user._id,
            content: args.content,
            createdAt: Date.now(),
            deleted: false,
        });

        await ctx.db.patch(args.conversationId, {
            lastMessageId: messageId,
            updatedAt: Date.now(),
        });

        // Also mark as read for the sender automatically
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

        return messageId;
    },
});

export const getMessages = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) return [];

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return [];

        if (!conversation.members?.includes(user._id)) {
            return [];
        }

        return await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();
    }
});


export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Not authenticated");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        if (message.senderId !== user._id) {
            throw new Error("Unauthorized to delete this message");
        }

        await ctx.db.patch(args.messageId, {
            deleted: true,
            content: "This message was deleted",
        });
    },
});

export const getLastMessage = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .order("desc")
            .first();
    },
});
