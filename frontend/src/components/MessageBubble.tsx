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
            <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-4 opacity-50`}>
                <div className="max-w-[80%] rounded-2xl px-5 py-2 bg-slate-50 text-slate-400 italic text-xs border border-slate-100 shadow-sm">
                    This message was deleted
                </div>
            </div>
        );
    }

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3 group px-2 animate-message`}>
            <div className={`relative flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%] md:max-w-md lg:max-w-lg`}>
                <div
                    className={`px-5 py-3 shadow-md transition-all duration-300 group-hover:shadow-lg ${isMe
                        ? "bg-blue-100 text-slate-900 rounded-2xl rounded-br-sm shadow-blue-500/10 border border-blue-200"
                        : "bg-white text-slate-800 rounded-2xl rounded-bl-sm border border-slate-200 shadow-slate-200/50"
                        }`}
                >
                    <div className="text-sm md:text-[15px] leading-relaxed break-words font-medium">
                        {message.content}
                    </div>
                    <div
                        className={`text-[10px] mt-1.5 flex justify-end font-bold tracking-widest uppercase items-center gap-1 ${isMe ? "text-blue-100/90" : "text-slate-400"
                            }`}
                    >
                        {formatTimestamp(message.createdAt)}
                        {isMe && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-80"><path d="M20 6 9 17l-5-5" /></svg>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
