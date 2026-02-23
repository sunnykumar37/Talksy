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
            className={`w-full flex items-center gap-4 p-3.5 px-5 transition-all duration-300 group relative rounded-2xl my-1 overflow-hidden shrink-0 ${isSelected
                ? "bg-blue-500 shadow-[0_10px_30px_-5px_rgba(59,130,246,0.3)] scale-[0.98] border-none"
                : "bg-transparent hover:bg-slate-50 border-l-4 border-transparent hover:border-blue-100"
                }`}

        >
            <div className="relative flex-shrink-0">
                <div className={`w-14 h-14 rounded-full overflow-hidden bg-slate-100 ring-2 ${isSelected ? "ring-white/30" : "ring-slate-50"
                    } transition-all duration-300 group-hover:scale-110 group-active:scale-95 shadow-md`}>
                    {imageUrl ? (
                        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200">
                            <span className="text-slate-500 font-black">{name.charAt(0)}</span>
                        </div>
                    )}
                </div>
                {!conversation.isGroup && otherUser?.isOnline && (
                    <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm ring-1 ring-emerald-50 z-10" />
                )}
            </div>
            <div className={`flex-1 text-left min-w-0 py-1 flex flex-col justify-center transition-all duration-300 ${isSelected ? "translate-x-1" : "group-hover:translate-x-1"}`}>
                <div className="flex justify-between items-baseline gap-2 mb-0.5">
                    <div className={`font-black tracking-tight transition-colors ${isSelected ? "text-white" : "text-slate-800 group-hover:text-blue-700"}`}>{name}</div>
                    <div className={`text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap ${isSelected ? "text-blue-50" : "text-slate-400 group-hover:text-blue-300"}`}>
                        {formatShortTimestamp(conversation.updatedAt)}
                    </div>
                </div>
                <div className={`text-xs truncate leading-tight transition-colors ${isSelected ? "text-blue-100 font-bold" : "text-slate-500 font-medium group-hover:text-slate-700"
                    }`}>
                    {lastMessage ? lastMessage.content : "Start a new conversation"}
                </div>
            </div>
        </button>

    );


}
