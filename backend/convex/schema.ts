import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        isOnline: v.boolean(),
        lastSeen: v.number(),
    })
        .index("by_clerkId", ["clerkId"])
        .index("by_isOnline", ["isOnline"])
        .searchIndex("search_name", {
            searchField: "name",
        }),

    conversations: defineTable({
        isGroup: v.boolean(),
        name: v.optional(v.string()), // for group chats
        members: v.array(v.id("users")),
        lastMessageId: v.optional(v.id("messages")),
        updatedAt: v.number(),
    }).index("by_updatedAt", ["updatedAt"]),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        createdAt: v.number(),
        deleted: v.boolean(),
    }).index("by_conversationId", ["conversationId"]),

    conversationMembers: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastReadAt: v.number(),
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_userId", ["userId"])
        .index("by_conversationId_and_userId", ["conversationId", "userId"]),

    typingIndicators: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastUpdated: v.number(), // timestamp for cleanup
    })
        .index("by_conversationId", ["conversationId"])
        .index("by_userId", ["userId"])
        .index("by_conversationId_and_userId", ["conversationId", "userId"]),
});

