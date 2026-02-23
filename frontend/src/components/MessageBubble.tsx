"use client";

import { formatTimestamp } from "@/lib/utils";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { MoreVertical, Trash2, X } from "lucide-react";

interface MessageBubbleProps {
    message: any;
    currentUser: any;
}

export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
    const isMe = message.senderId === currentUser?._id;
    const [showMenu, setShowMenu] = useState(false);
    const deleteForEveryone = useMutation(api.messages.deleteForEveryone);
    const deleteForMe = useMutation(api.messages.deleteForMe);

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
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-3 group px-2 animate-message relative ${showMenu ? "z-50" : "z-0"}`}>
            {/* Click outside to close menu overlay */}
            {showMenu && <div className="fixed inset-0 z-40 bg-slate-900/5 backdrop-blur-[2px]" onClick={() => setShowMenu(false)} />}

            <div className={`relative flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[75%] md:max-w-md lg:max-w-lg`}>
                <div
                    className={`px-5 py-3 shadow-md transition-all duration-300 group-hover:shadow-xl ${isMe
                        ? "bg-[var(--bubble-me)] text-[var(--bubble-me-text)] rounded-2xl rounded-br-sm shadow-blue-500/10 border border-blue-200 dark:border-blue-900/30"
                        : "bg-[var(--bubble-them)] text-[var(--bubble-them-text)] rounded-2xl rounded-bl-sm border border-slate-200 dark:border-slate-800 shadow-slate-200/50"
                        }`}
                >
                    <div className="text-[15px] leading-relaxed break-words font-medium tracking-tight">
                        {message.content}
                    </div>
                    <div
                        className={`text-[10px] mt-2 flex justify-end font-bold tracking-widest uppercase items-center gap-1 ${isMe ? "text-blue-500/70" : "text-slate-400 dark:text-slate-500"
                            }`}
                    >
                        {formatTimestamp(message.createdAt)}
                        {isMe && (
                            <div className="flex -space-x-1.5 items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={message.seenBy?.length > 1 ? "text-[var(--accent)]" : "opacity-80"}><path d="M20 6 9 17l-5-5" /></svg>
                                {message.seenBy?.length > 1 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]"><path d="M20 6 9 17l-5-5" /></svg>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Hover Delete Action */}
                <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`absolute bottom-2 ${isMe ? "-left-10" : "-right-10"} p-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all duration-300 rounded-full hover:bg-slate-100 z-30`}
                >
                    <MoreVertical className="w-4 h-4" />
                </button>

                {/* Deletion Context Menu - Positioned "UPON" the bubble with high z-index */}
                {showMenu && (
                    <div className={`absolute z-50 top-0 ${isMe ? "right-0" : "left-0"} bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] rounded-3xl border border-slate-100 p-2 min-w-[210px] animate-in fade-in zoom-in-95 duration-200 origin-center`}>
                        <div className="px-3 py-2.5 mb-1 border-b border-slate-50 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Message Options</span>
                            <X className="w-3 h-3 text-slate-300 cursor-pointer hover:text-slate-500" onClick={() => setShowMenu(false)} />
                        </div>
                        <button
                            onClick={async () => {
                                await deleteForMe({ messageId: message._id });
                                setShowMenu(false);
                            }}
                            className="w-full text-left px-3 py-3 text-xs font-bold text-slate-600 hover:bg-blue-50/50 rounded-2xl flex items-center gap-3 transition-all duration-200 active:scale-95 group/item"
                        >
                            <div className="p-2 bg-slate-50 rounded-xl group-hover/item:bg-white border border-transparent group-hover/item:border-blue-100 transition-colors">
                                <Trash2 className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-blue-500" />
                            </div>
                            Delete for me
                        </button>
                        {isMe && (
                            <button
                                onClick={async () => {
                                    await deleteForEveryone({ messageId: message._id });
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-3 py-3 text-xs font-bold text-red-600 hover:bg-red-50/50 rounded-2xl flex items-center gap-3 transition-all duration-200 active:scale-95 group/item"
                            >
                                <div className="p-2 bg-red-50 rounded-xl group-hover/item:bg-white border border-transparent group-hover/item:border-red-100 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5 group-hover/item:scale-110 transition-transform" />
                                </div>
                                Delete for everyone
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}




