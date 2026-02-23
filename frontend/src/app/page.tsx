"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { UserList } from "@/components/UserList";
import { Id } from "@convex/_generated/dataModel";

export default function Home() {
  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, { clerkId: clerkUser?.id || "" });

  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  // If no user is logged in (though middleware should prevent this), show nothing
  if (!clerkUser) return null;

  return (
    <div className="h-screen w-full bg-slate-100 flex items-center justify-center p-0 md:p-4 lg:p-6 transition-all duration-300">
      <main className="flex h-full w-full max-w-6xl bg-white shadow-2xl rounded-none md:rounded-2xl overflow-hidden glass-morphism border border-white/20">
        {/* Sidebar - Fixed width on large screens */}
        <div className={`w-full md:w-[320px] lg:w-[380px] flex-shrink-0 border-r border-slate-100 bg-white flex flex-col ${selectedConversationId ? "hidden md:flex" : "flex"
          }`}>
          {isUserListOpen ? (
            <UserList
              onSelectUser={(id) => {
                setSelectedConversationId(id);
                setIsUserListOpen(false);
              }}
            />
          ) : (
            <Sidebar
              currentUser={currentUser}
              selectedId={selectedConversationId}
              onSelectConversation={(id) => setSelectedConversationId(id as Id<"conversations">)}
              onOpenUserList={() => setIsUserListOpen(true)}
            />
          )}
        </div>

        {/* Main Chat Area - Responsive expansion */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 ${!selectedConversationId ? "hidden md:flex" : "flex"
          }`}>
          {selectedConversationId ? (
            <ChatWindow
              conversationId={selectedConversationId}
              currentUser={currentUser}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Welcome to Talksy</h2>
              <p className="text-slate-500 mt-2 max-w-xs leading-relaxed">
                Connect with your friends in real-time. Select a conversation to start chatting.
              </p>
              <button
                onClick={() => setIsUserListOpen(true)}
                className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-lg hover:shadow-blue-200"
              >
                Find People
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

