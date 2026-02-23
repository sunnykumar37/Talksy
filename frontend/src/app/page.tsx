"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Sidebar } from "@/components/Sidebar";
import { ChatWindow } from "@/components/ChatWindow";
import { UserList } from "@/components/UserList";
import { Id } from "@convex/_generated/dataModel";
import { Plus } from "lucide-react";

export default function Home() {
  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.users.getUserByClerkId, { clerkId: clerkUser?.id || "" });

  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  // If no user is logged in (though middleware should prevent this), show nothing
  if (!clerkUser) return null;

  return (
    <div className="h-screen w-full bg-slate-100 flex items-center justify-center p-0 md:p-6 lg:p-10 transition-all duration-500 ease-in-out">
      <main className="flex h-full max-h-[900px] w-full max-w-6xl bg-white shadow-2xl rounded-none md:rounded-3xl overflow-hidden border border-slate-200/60 relative group">
        {/* Sidebar - Fixed width on large screens */}
        <div className={`w-full md:w-[320px] lg:w-[360px] flex-shrink-0 border-r border-slate-100 bg-white flex flex-col transition-all duration-300 ${selectedConversationId ? "hidden md:flex" : "flex"
          }`}>
          {isUserListOpen ? (
            <UserList
              onSelectUser={(id) => {
                setSelectedConversationId(id as Id<"conversations">);
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

        {/* Main Chat Area - Premium responsive expansion */}
        <div className={`flex-1 flex flex-col bg-slate-50/30 ${!selectedConversationId ? "hidden md:flex" : "flex"
          }`}>
          {selectedConversationId ? (
            <ChatWindow
              conversationId={selectedConversationId}
              currentUser={currentUser}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-50 to-indigo-50 text-blue-600 rounded-full flex items-center justify-center mb-8 shadow-inner ring-4 ring-white relative">
                <div className="absolute inset-0 bg-blue-500/5 rounded-full animate-ping opacity-20" />
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-3">Welcome to Talksy</h2>
              <p className="text-slate-500 max-w-sm leading-relaxed text-sm md:text-base">
                A modern way to connect with friends. Select a conversation to start a seamless real-time chat experience.
              </p>
              <button
                onClick={() => setIsUserListOpen(true)}
                className="mt-10 bg-blue-600 text-white px-10 py-3.5 rounded-full font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-xl hover:shadow-blue-200/50 flex items-center gap-2 group/btn"
              >
                Find People
                <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
