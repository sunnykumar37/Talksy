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
            className={`w-full flex items-center gap-4 p-3 px-5 transition-all duration-200 border-b border-slate-50/50 hover:bg-slate-50 group relative ${isSelected ? "bg-blue-50/80" : "bg-white"
                }`}
        >
            {isSelected && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-blue-600 rounded-r-full" />}

            <div className="relative flex-shrink-0">
                <div className={`w-14 h-14 rounded-full overflow-hidden bg-slate-100 ring-2 ${isSelected ? "ring-blue-200 shadow-lg shadow-blue-100" : "ring-slate-50"
                    } transition-all group-hover:shadow-md`}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200">
                            <span className="text-slate-500 font-bold">{name.charAt(0)}</span>
                        </div>
                    )}
                </div>
                {!conversation.isGroup && otherUser?.isOnline && (
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                )}
            </div>
            <div className="flex-1 text-left min-w-0 py-1">
                <div className="flex justify-between items-baseline gap-2 mb-1">
                    <div className={`font-bold truncate ${isSelected ? "text-blue-900" : "text-slate-800"}`}>{name}</div>
                    <div className="text-[11px] font-medium text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                        {formatShortTimestamp(conversation.updatedAt)}
                    </div>
                </div>
                <div className={`text-xs truncate leading-tight ${isSelected ? "text-blue-700 font-medium" : "text-slate-500"
                    }`}>
                    {lastMessage ? lastMessage.content : "Start a new chat"}
                </div>
            </div>
        </button>
    );

}
