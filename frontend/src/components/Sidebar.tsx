"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { ConversationItem } from "./ConversationItem";
import { UserButton } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  onSelectConversation: (id: string) => void;
  selectedId: string | null;
  onOpenUserList: () => void;
  currentUser: any;
}

export function Sidebar({
  onSelectConversation,
  selectedId,
  onOpenUserList,
  currentUser,
}: SidebarProps) {

  const [search, setSearch] = useState("");
  const conversations = useQuery(api.conversations.getUserConversations);

  return (

    <div className="w-full md:w-[320px] lg:w-[360px] h-full flex flex-col bg-[var(--card)] border-r border-[var(--card-border)] overflow-hidden">


      {/* HEADER */}
      <div className="h-[88px] border-b border-[var(--card-border)]">

        <div className="h-full px-6 flex items-center justify-between">

          <div className="flex flex-col">

            <h1 className="text-2xl font-black bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent">
              Talksy
            </h1>

            <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">
              Premium Messaging
            </span>

          </div>


          <div className="flex items-center gap-2">

            <ThemeToggle />

            <button
              onClick={onOpenUserList}
              className="p-2 rounded-full hover:bg-[var(--input)] transition"
            >
              <Plus className="w-5 h-5"/>
            </button>

            <UserButton afterSignOutUrl="/" />

          </div>

        </div>

      </div>



      {/* SEARCH BAR */}
      <div className="px-6 py-3">

        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search messages..."
        />

      </div>



      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">

        {conversations === undefined ? (

          <div className="flex justify-center py-20">

            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"/>

          </div>

        ) : !conversations || conversations.length === 0 ? (


          <div className="mt-6 p-8 rounded-3xl border border-[var(--card-border)] text-center flex flex-col items-center bg-[var(--background)]">

            <div className="w-16 h-16 bg-[var(--input)] rounded-full flex items-center justify-center mb-4">

              <Plus className="w-8 h-8 text-[var(--muted)]"/>

            </div>


            <h3 className="font-bold text-[var(--foreground)] mb-1">

              No chats found

            </h3>


            <p className="text-xs text-[var(--muted)] uppercase font-semibold">

              Start your first premium chat

            </p>


            <button
              onClick={onOpenUserList}
              className="mt-6 px-6 py-2.5 bg-[var(--accent)] text-white text-xs font-bold rounded-full hover:opacity-90 transition"
            >

              Find People

            </button>


          </div>


        ) : (

          conversations.map((conv) => (

            <ConversationItem
              key={conv._id}
              conversation={conv}
              isSelected={selectedId === conv._id}
              onClick={() => onSelectConversation(conv._id)}
              currentUser={currentUser}
              search={search}
            />

          ))

        )}

      </div>

    </div>

  );
}