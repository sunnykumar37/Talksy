"use client";

import { formatTimestamp } from "@/lib/utils";

interface MessageBubbleProps {
    message: any;
    currentUser: any;
}

export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
    // Current user's messages on the right, others on the left
    const isMe = message.senderId === currentUser?._id;

    if (message.deleted) {
        return (
            <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-slate-50 text-slate-400 italic text-xs border border-slate-100">
                    This message was deleted
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2 group px-2`}>
            <div
                className={`px-4 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md ${isMe
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                    : "bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100"
                    } max-w-[85%] md:max-w-md lg:max-w-lg shadow-blue-50/50`}
            >
                <div className="text-sm md:text-[15px] leading-relaxed break-words font-medium">
                    {message.content}
                </div>
                <div
                    className={`text-[10px] mt-1 text-right font-medium tracking-tight ${isMe ? "text-blue-100/80" : "text-slate-400"
                        }`}
                >
                    {formatTimestamp(message.createdAt)}
                </div>
            </div>
        </div>
    );
}

