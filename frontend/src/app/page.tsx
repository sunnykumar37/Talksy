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
    <main className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Hidden on mobile if a conversation is selected */}
      <div className={`w-full md:w-[350px] lg:w-[400px] flex-shrink-0 ${selectedConversationId ? "hidden md:flex" : "flex"
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

      {/* Main Chat Area - Hidden on mobile if no conversation is selected */}
      <div className={`flex-1 ${!selectedConversationId ? "hidden md:flex" : "flex"
        }`}>
        {selectedConversationId ? (
          <ChatWindow
            conversationId={selectedConversationId}
            currentUser={currentUser}
            onBack={() => setSelectedConversationId(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Your Messages</h2>
            <p className="text-gray-500 mt-2">Select a conversation or start a new one.</p>
            <button
              onClick={() => setIsUserListOpen(true)}
              className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Get Started
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
