"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { formatShortTimestamp } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";

interface ConversationItemProps {
    conversation: any;
    isSelected: boolean;
    onClick: () => void;
    currentUser: any;
    search?: string;
}

export function ConversationItem({ conversation, isSelected, onClick, currentUser, search }: ConversationItemProps) {
    // Find the other member in a 1-on-1 chat
    const otherMemberId = conversation.members.find((id: string) => id !== currentUser?._id);
    // This is a simplified approach, usually you'd fetch the other user's info
    // In a real app, you might want to denormalize some data or do a join
    // For now, let's assume we have a query to get basic user info by ID
    const otherUser = useQuery(api.users.getUserById, { userId: otherMemberId });

    const unreadCount: number = conversation.unreadCount ?? 0;

    // Apply search filtering using conversation name or other user's name
    const searchTerm = (search || "").trim().toLowerCase();
    if (searchTerm) {
        const conversationName = (conversation.name || "").toLowerCase();
        const otherName = (otherUser?.name || "").toLowerCase();
        const matches =
            conversationName.includes(searchTerm) ||
            otherName.includes(searchTerm);

        if (!matches) {
            return null;
        }
    }

    return (
        <div
            onClick={onClick}
            className={`px-3 py-3 md:px-4 md:py-3 ml-2 mr-4 my-0.5 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden ${
                isSelected
                    ? "bg-[var(--accent)] text-white shadow-lg"
                    : "bg-transparent hover:bg-[var(--card-border)]/50"
            }`}
        >
            {/* Left accent bar for selected */}
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white/60 rounded-r" />
            )}

            <div className="flex items-center gap-3 md:gap-4 relative">
                <div className="relative flex-shrink-0">
                    <div
                        className={`w-12 h-12 md:w-12 md:h-12 rounded-full overflow-hidden ring-2 transition-all duration-200 ${
                            isSelected
                                ? "ring-[var(--card)]/90"
                                : "ring-[var(--card-border)] group-hover:ring-[var(--accent)]/60"
                        }`}
                    >
                        {otherUser?.imageUrl ? (
                            <img src={otherUser.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[var(--input)]">
                                <span className="text-[var(--foreground)] font-black text-lg">
                                    {conversation.isGroup ? "G" : otherUser?.name?.charAt(0) || "?"}
                                </span>
                            </div>
                        )}
                    </div>
                    {!conversation.isGroup && otherUser?.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[var(--background)]" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                        <h3
                            className={`font-bold text-sm truncate ${
                                isSelected ? "text-white" : "text-[var(--foreground)]"
                            }`}
                        >
                            {conversation.isGroup ? conversation.name : otherUser?.name || "..."}
                        </h3>
                        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            {conversation.lastMessageTime && (
                                <span
                                    className={`text-[10px] ${
                                        isSelected ? "text-white/80" : "text-[var(--muted)]"
                                    }`}
                                >
                                    {formatShortTimestamp(conversation.lastMessageTime)}
                                </span>
                            )}
                            {unreadCount > 0 && (
                                <span
                                    className={`ml-1 min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        isSelected
                                            ? "bg-white text-[var(--accent)]"
                                            : "bg-[var(--accent)] text-white"
                                    }`}
                                >
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </div>
                    </div>
                    <p
                        className={`text-xs truncate ${
                            isSelected ? "text-white/85" : "text-[var(--muted)]"
                        }`}
                    >
                        {conversation.lastMessageContent || "No messages yet"}
                    </p>
                </div>
            </div>
        </div>
    );
}
