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
}

export function ConversationItem({ conversation, isSelected, onClick, currentUser }: ConversationItemProps) {
    // Find the other member in a 1-on-1 chat
    const otherMemberId = conversation.members.find((id: string) => id !== currentUser?._id);
    // This is a simplified approach, usually you'd fetch the other user's info
    // In a real app, you might want to denormalize some data or do a join
    // For now, let's assume we have a query to get basic user info by ID
    const otherUser = useQuery(api.users.getUserById, { userId: otherMemberId });
    const lastMessage = useQuery(api.messages.getLastMessage, { conversationId: conversation._id });

    const name = conversation.isGroup ? conversation.name : otherUser?.name || "Loading...";
    const imageUrl = conversation.isGroup ? "/group-avatar.png" : otherUser?.imageUrl || "";

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-4 transition-colors border-b last:border-0 hover:bg-gray-50 ${isSelected ? "bg-blue-50" : "bg-white"
                }`}
        >
            <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    {imageUrl && <img src={imageUrl} alt={name} className="w-full h-full object-cover" />}
                </div>
                {!conversation.isGroup && otherUser?.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                )}
            </div>
            <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                    <div className="font-semibold text-gray-900 truncate">{name}</div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">
                        {formatShortTimestamp(conversation.updatedAt)}
                    </div>
                </div>
                <div className="text-sm text-gray-500 truncate">
                    {lastMessage ? lastMessage.content : "No messages yet"}
                </div>
            </div>
        </button>
    );
}
