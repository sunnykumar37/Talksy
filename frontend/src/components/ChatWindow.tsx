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
    <div className="flex flex-col h-full bg-slate-50/50 relative">
      {/* Header */}
      <div className="p-4 px-6 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-slate-100 ring-2 ring-slate-50 overflow-hidden shadow-sm">
              {otherUser?.imageUrl ? (
                <img src={otherUser.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <span className="text-slate-400 font-bold">{conversation.isGroup ? "G" : (otherUser?.name?.charAt(0) || "?")}</span>
                </div>
              )}
            </div>
            {!conversation.isGroup && otherUser?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
            )}
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight tracking-tight">
              {conversation.isGroup ? conversation.name : otherUser?.name || "..."}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {(!conversation.isGroup && otherUser?.isOnline) && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />}
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {conversation.isGroup ? `${conversation.members.length} members` : (otherUser?.isOnline ? "Online" : "Last seen recently")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col text-slate-300">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
            </div>
            <p className="text-sm font-medium italic">No messages in this conversation yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((m) => (
              <MessageBubble
                key={m._id}
                message={m}
                currentUser={currentUser}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white/80 backdrop-blur-md border-t border-slate-100 sticky bottom-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 bg-slate-100 hover:bg-slate-200/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 rounded-2xl transition-all duration-200 shadow-inner px-4 py-2 flex items-center min-h-[48px]">
            <textarea
              rows={1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm md:text-base resize-none py-1"
            />
          </div>
          <button
            type="submit"
            disabled={!content.trim()}
            className="bg-blue-600 text-white p-3.5 rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all duration-200 shadow-lg shadow-blue-200 disabled:shadow-none active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );

}
