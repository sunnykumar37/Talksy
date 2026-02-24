"use client";

import { formatTimestamp } from "@/lib/utils";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { MoreVertical, Trash2, X } from "lucide-react";

interface MessageBubbleProps {
    message: any;
    currentUser: any;
    isFirstInGroup?: boolean;
    isLastInGroup?: boolean;
}

export function MessageBubble({ message, currentUser, isFirstInGroup = true, isLastInGroup = true }: MessageBubbleProps) {
    const isMe = message.senderId === currentUser?._id;
    const [showMenu, setShowMenu] = useState(false);
    const deleteForEveryone = useMutation(api.messages.deleteForEveryone);
    const deleteForMe = useMutation(api.messages.deleteForMe);

    // Messages deleted "for everyone" are now fully hidden in the query,
    // so we don't render a special placeholder bubble here anymore.

    return (
        <div className={`flex ${isMe ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-4" : "mt-1"} group relative animate-message`}>
            {/* Click outside to close menu overlay */}
            {showMenu && <div className="fixed inset-0 z-40 bg-slate-900/5 backdrop-blur-[2px]" onClick={() => setShowMenu(false)} />}

            <div className={`flex ${isMe ? "flex-row-reverse" : "flex-row"} items-start max-w-[80%] gap-3`}>
                {/* Avatar - Only on first message in group */}
                <div className="w-8 h-8 flex-shrink-0">
                    {!isMe && isFirstInGroup && (
                        <div className="w-8 h-8 rounded-full bg-slate-800 ring-1 ring-white/10 overflow-hidden shadow-lg transition-transform group-hover:scale-110">
                            <img src={message.senderImageUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + message.senderId} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                <div className={`relative flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div
                        className={`px-5 py-3 transition-colors duration-200 ${
                            isMe
                                ? `bg-[var(--bubble-me)] text-[var(--bubble-me-text)] border border-[var(--accent)]/20 ${
                                      isFirstInGroup
                                          ? "rounded-t-2xl rounded-bl-2xl rounded-br-sm"
                                          : isLastInGroup
                                          ? "rounded-b-2xl rounded-tl-2xl rounded-tr-sm"
                                          : "rounded-l-2xl rounded-r-sm"
                                  }`
                                : `bg-[var(--bubble-them)] text-[var(--bubble-them-text)] border border-[var(--card-border)] ${
                                      isFirstInGroup
                                          ? "rounded-t-2xl rounded-br-2xl rounded-bl-sm"
                                          : isLastInGroup
                                          ? "rounded-b-2xl rounded-tr-2xl rounded-tl-sm"
                                          : "rounded-r-2xl rounded-l-sm"
                                  }`
                        }`}
                    >
                        <div className="text-[15px] leading-relaxed break-words font-medium tracking-tight">
                            {message.content}
                        </div>
                        <div
                            className={`text-[10px] mt-2 flex justify-end font-black tracking-[0.2em] uppercase items-center gap-1.5 ${isMe ? "text-blue-500/70" : "text-slate-400 dark:text-slate-500"
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
                        className={`absolute top-2 ${isMe ? "-left-10" : "-right-10"} p-2 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-all duration-300 rounded-full hover:bg-white/5 z-30`}
                    >
                        <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Deletion Context Menu */}
                    {showMenu && (
                        <div className={`absolute z-50 top-0 ${isMe ? "right-0" : "left-0"} bg-white dark:bg-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-3xl border border-slate-100 dark:border-slate-800 p-2 min-w-[210px] animate-in fade-in zoom-in-95 duration-200 origin-center`}>
                            <div className="px-3 py-2.5 mb-1 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Message Options</span>
                                <X className="w-3 h-3 text-slate-300 cursor-pointer hover:text-slate-500" onClick={() => setShowMenu(false)} />
                            </div>
                            <button
                                onClick={async () => {
                                    await deleteForMe({ messageId: message._id });
                                    setShowMenu(false);
                                }}
                                className="w-full text-left px-3 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/30 rounded-2xl flex items-center gap-3 transition-all duration-200 active:scale-95 group/item"
                            >
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover/item:bg-white dark:group-hover/item:bg-slate-700 border border-transparent group-hover/item:border-blue-100 transition-colors">
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
                                    className="w-full text-left px-3 py-3 text-xs font-bold text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/30 rounded-2xl flex items-center gap-3 transition-all duration-200 active:scale-95 group/item"
                                >
                                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl group-hover/item:bg-white dark:group-hover/item:bg-red-900/30 border border-transparent group-hover/item:border-red-100 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5 group-hover/item:scale-110 transition-transform" />
                                    </div>
                                    Delete for everyone
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
