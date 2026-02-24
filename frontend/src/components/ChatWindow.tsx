"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { ArrowLeft, Send, Trash2 } from "lucide-react";
import { Id } from "@convex/_generated/dataModel";
import { formatDateHeader } from "@/lib/utils";

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
  const markAsSeen = useMutation(api.messages.markAsSeen);
  const lastMessageId = useRef<string | null>(null);

  // Mark as seen & play sound when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];

      // Sound logic
      if (lastMessageId.current && lastMsg._id !== lastMessageId.current) {
        if (lastMsg.senderId !== currentUser?._id) {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
          audio.volume = 0.5;
          audio.play().catch(e => console.log("Audio play failed:", e));
        }
      }
      lastMessageId.current = lastMsg._id;

      // Seen logic
      const hasUnseen = messages.some(m => !m.seenBy?.includes(currentUser?._id));
      if (hasUnseen) {
        markAsSeen({ conversationId });
      }
    }
  }, [messages, conversationId, currentUser?._id, markAsSeen]);


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
    <div className="flex flex-col h-full bg-[var(--background)] relative overflow-hidden transition-all duration-300">
      {/* Header - Standardized Height & Centered Content */}
      <div className="h-[88px] px-6 border-b border-[var(--card-border)] glass-morphism sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 group cursor-pointer h-full">
          <button onClick={onBack} className="md:hidden p-2 text-[var(--muted)] hover:bg-[var(--card-border)] rounded-full transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="relative group/avatar">
              <div className="w-12 h-12 rounded-full bg-[var(--card)] ring-2 ring-[var(--card-border)] overflow-hidden shadow-xl transition-all duration-300 group-hover/avatar:scale-105">
                {otherUser?.imageUrl ? (
                  <img src={otherUser.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--input)]">
                    <span className="text-[var(--muted)] font-black">{conversation.isGroup ? "G" : (otherUser?.name?.charAt(0) || "?")}</span>
                  </div>
                )}
              </div>
              {!conversation.isGroup && otherUser?.isOnline && (
                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[var(--card)] shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
              )}
            </div>

            <div className="flex flex-col justify-center">
              <div className="text-lg font-black text-[var(--foreground)] leading-tight tracking-tighter group-hover:text-[var(--accent)] transition-colors">
                {conversation.isGroup ? conversation.name : otherUser?.name || "..."}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${otherUser?.isOnline ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' : 'text-[var(--muted)] border-[var(--card-border)]'}`}>
                  {conversation.isGroup ? `${conversation.members.length} members` : (otherUser?.isOnline ? "Active Now" : "Offline")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Messages Stream - Subtle Layered Background */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col custom-scrollbar relative bg-[var(--background)] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.05),_transparent_60%)]">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col text-slate-300 dark:text-slate-700 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-[var(--card)] rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white dark:ring-slate-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
            </div>
            <p className="text-base font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Start your premium conversation</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((m, index) => {
              const prevMsg = messages[index - 1];
              const nextMsg = messages[index + 1];
              const isFirstInGroup = !prevMsg || prevMsg.senderId !== m.senderId;
              const isLastInGroup = !nextMsg || nextMsg.senderId !== m.senderId;

              const currentDate = new Date(m.createdAt).toDateString();
              const previousDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
              const showDateHeader = !prevMsg || currentDate !== previousDate;

              return (
                <div key={m._id}>
                  {showDateHeader && (
                    <div className="flex justify-center my-6">
                      <span className="px-4 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] bg-[var(--card)] border border-[var(--card-border)] rounded-full">
                        {formatDateHeader(m.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={m}
                    currentUser={currentUser}
                    isFirstInGroup={isFirstInGroup}
                    isLastInGroup={isLastInGroup}
                  />
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Typing Indicator */}
      <div className={`px-8 py-3 bg-gradient-to-t from-[var(--background)] to-transparent absolute bottom-[104px] left-0 right-0 z-20 transition-all duration-300 ease-in-out ${otherTypingUsers.length > 0 ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}>
        <div className="flex items-center gap-2 text-[var(--accent)] text-[10px] font-black italic uppercase tracking-widest drop-shadow-sm">
          <div className="flex gap-1.5 bg-[var(--accent)]/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--accent)]/20 shadow-lg">
            <div className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-1 h-1 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="bg-[var(--card)]/90 border border-[var(--card-border)] backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xl">
            {otherTypingUsers.length === 1
              ? `${otherTypingUsers[0]} is typing...`
              : `${otherTypingUsers.length} people are typing...`}
          </span>
        </div>
      </div>

      {/* Premium Input Section - Anchored & Depth */}
      <div className="p-5 md:p-6 bg-[var(--card)] border-t border-[var(--card-border)] sticky bottom-0 z-30 shadow-[0_-12px_40px_rgba(0,0,0,0.08)]">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-4">
          <div className="flex-1 bg-[var(--input)] hover:bg-[var(--input)]/80 focus-within:bg-[var(--background)] focus-within:ring-2 focus-within:ring-[var(--accent)]/30 border border-[var(--card-border)] rounded-[28px] transition-all duration-300 shadow-inner px-6 py-3 flex items-center min-h-[56px] group/input">
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
              placeholder="Message your partner..."
              className="flex-1 bg-transparent border-none outline-none text-[var(--foreground)] placeholder:text-[var(--muted)] text-sm md:text-base resize-none py-1.5 group-focus-within/input:placeholder:text-[var(--accent)]/50"
            />
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className={`p-4 rounded-full transition-all duration-300 shadow-2xl active:scale-90 flex items-center justify-center ${content.trim()
              ? "bg-[var(--accent)] text-white hover:opacity-90 hover:scale-110 hover:-rotate-12 cursor-pointer shadow-blue-500/40"
              : "bg-[var(--input)] text-[var(--muted)] cursor-not-allowed opacity-50"
              }`}
          >
            <Send className={`w-5 h-5 ${content.trim() ? "translate-x-0.5 -translate-y-0.5" : ""}`} />
          </button>
        </form>
      </div>
    </div>
  );


}
