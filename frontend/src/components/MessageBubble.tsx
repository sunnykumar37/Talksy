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
            <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
                <div className="max-w-[70%] rounded-lg px-4 py-2 bg-gray-100 text-gray-400 italic text-sm border-none">
                    This message was deleted
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4`}>
            <div
                className={`px-4 py-2 rounded-lg max-w-[85%] md:max-w-xs shadow-sm ${isMe
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-black"
                    }`}
            >
                <div className="text-sm md:text-base leading-relaxed break-words">
                    {message.content}
                </div>
                <div
                    className={`text-[10px] mt-1 text-right ${isMe ? "text-blue-100" : "text-gray-500"}`}
                >
                    {formatTimestamp(message.createdAt)}
                </div>
            </div>
        </div>
    );
}
