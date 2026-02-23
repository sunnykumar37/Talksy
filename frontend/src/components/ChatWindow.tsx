"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";

interface ChatWindowProps {
    conversationId: Id<"conversations">;
    onBack: () => void;
    currentUser: any;
}

export function ChatWindow({ conversationId, onBack, currentUser }: ChatWindowProps) {
    const [content, setContent] = useState("");
    const messages = useQuery(api.messages.getMessages, { conversationId });
    const sendMessage = useMutation(api.messages.sendMessage);
    const conversation = useQuery(api.conversations.getConversationById, { conversationId });

    // Get other user ID first (may be undefined while loading)
    const otherMemberId = conversation?.members?.find((id) => id !== currentUser?._id);
    // Move this hook to the top level
    const otherUser = useQuery(api.users.getUserById,
        otherMemberId ? { userId: otherMemberId } : "skip" as any
    );

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        await sendMessage({
            conversationId,
            content: content.trim(),
        });
        setContent("");
    };

    if (conversation === undefined || messages === undefined || currentUser === undefined) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                Loading chat...
            </div>
        );
    }

    if (conversation === null || currentUser === null) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
                {currentUser === null ? "Identity not found." : "Conversation not found."}
            </div>
        );
    }


    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="p-3 border-b bg-white flex items-center gap-3">
                <button onClick={onBack} className="md:hidden p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                    {otherUser?.imageUrl && <img src={otherUser.imageUrl} alt="Avatar" className="w-full h-full object-cover" />}
                </div>
                <div>
                    <div className="font-semibold text-gray-900">
                        {conversation.isGroup ? conversation.name : otherUser?.name || "..."}
                    </div>
                    <div className="text-xs text-gray-500">
                        {conversation.isGroup ? `${conversation.members.length} members` : (otherUser?.isOnline ? "Online" : "Away")}
                    </div>
                </div>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
                        <div className="mb-2 italic text-sm">No messages yet.</div>
                        <div className="text-xs">Say hi! 👋</div>
                    </div>
                ) : (
                    messages.map((m) => {
                        return (
                            <MessageBubble
                                key={m._id}
                                message={m}
                                currentUser={currentUser}
                            />
                        );
                    })

                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-100 border-none rounded-full py-2 px-4 outline-none focus:ring-2 focus:ring-blue-500 text-[#111827] placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={!content.trim()}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
