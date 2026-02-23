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
  const [isTyping, setIsTyping] = useState(false);
  const typingUsers = useQuery(api.conversations.getTypingUsers, { conversationId });
  const setTyping = useMutation(api.conversations.setTyping);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing Indicator Logic
  useEffect(() => {
    if (!content.trim()) {
      if (isTyping) {
        setIsTyping(false);
        setTyping({ conversationId, isTyping: false });
      }
      return;
    }

    if (!isTyping) {
      setIsTyping(true);
      setTyping({ conversationId, isTyping: true });
    }

    const timeout = setTimeout(() => {
      setIsTyping(false);
      setTyping({ conversationId, isTyping: false });
    }, 3000);

    return () => clearTimeout(timeout);
  }, [content, conversationId, isTyping, setTyping]);

  if (conversation === undefined || messages === undefined || currentUser === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 font-medium text-sm tracking-wide">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          Loading secure chat...
        </div>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await sendMessage({
        conversationId,
        content: content.trim(),
      });
      setContent("");
      setIsTyping(false);
      setTyping({ conversationId, isTyping: false });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };


  if (conversation === null || currentUser === null) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-slate-400 font-medium">
        {currentUser === null ? "Identity not found." : "Conversation not found."}
      </div>
    );
  }


  const otherTypingUsers = typingUsers?.filter(name => name !== currentUser?.name) || [];


  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden transition-all duration-300">
      {/* Premium Sticky Header */}
      <div className="p-4 px-6 border-b border-slate-100 glass-morphism sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 group cursor-pointer">
          <button onClick={onBack} className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative group/avatar">
            <div className="w-12 h-12 rounded-full bg-slate-100 ring-2 ring-white overflow-hidden shadow-md transition-all duration-300 group-hover/avatar:scale-110 group-hover/avatar:rotate-3">
              {otherUser?.imageUrl ? (
                <img src={otherUser.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200">
                  <span className="text-slate-400 font-bold">{conversation.isGroup ? "G" : (otherUser?.name?.charAt(0) || "?")}</span>
                </div>
              )}
            </div>
            {!conversation.isGroup && otherUser?.isOnline && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm" />
            )}
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
              {conversation.isGroup ? conversation.name : otherUser?.name || "..."}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {!conversation.isGroup && otherUser?.isOnline && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
              <div className={`text-[11px] font-bold uppercase tracking-widest ${otherUser?.isOnline ? 'text-green-500' : 'text-slate-400'}`}>
                {conversation.isGroup ? `${conversation.members.length} members` : (otherUser?.isOnline ? "Active Now" : "Last seen recently")}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Stream - Subtle Gradient Background */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col custom-scrollbar bg-gradient-to-b from-slate-50 to-white/50 relative">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col text-slate-300 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
            </div>
            <p className="text-base font-bold text-slate-400">Start your premium conversation</p>
            <p className="text-xs text-slate-300 mt-1 uppercase tracking-widest">Messages are end-to-end synced</p>
          </div>
        ) : (
          <div className="space-y-3">
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

      {/* Typing Indicator - Improved Visibility & Correct Logic */}
      <div className={`px-8 py-3 bg-gradient-to-t from-white to-transparent absolute bottom-[92px] left-0 right-0 z-20 transition-all duration-300 ease-in-out ${otherTypingUsers.length > 0 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-2 text-blue-600/80 text-xs font-bold italic drop-shadow-sm">
          <div className="flex gap-1 bg-blue-50 px-2 py-1 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg">
            {otherTypingUsers.length === 1
              ? `${otherTypingUsers[0]} is typing...`
              : `${otherTypingUsers.length} people are typing...`}
          </span>
        </div>
      </div>

      {/* Premium Input Section */}
      <div className="p-4 md:p-6 bg-white border-t border-slate-100 sticky bottom-0 z-30 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-4">
          <div className="flex-1 bg-slate-100 hover:bg-slate-200/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-100 border border-transparent rounded-2xl transition-all duration-300 shadow-inner px-5 py-2.5 flex items-center min-h-[52px] group/input">
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
              placeholder="Type a modern message..."
              className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-sm md:text-base resize-none py-1 group-focus-within/input:placeholder:text-blue-300"
            />
          </div>
          <button
            type="submit"
            disabled={!content.trim()}
            className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all duration-300 shadow-xl shadow-blue-200/50 disabled:shadow-none hover:scale-105 active:scale-90 group/btn shrink-0"
          >
            <Send className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );


}
