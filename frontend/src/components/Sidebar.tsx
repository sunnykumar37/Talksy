"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { ConversationItem } from "./ConversationItem";
import { UserButton } from "@clerk/nextjs";
import { Plus, User } from "lucide-react";

import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
    onSelectConversation: (id: string) => void;
    selectedId: string | null;
    onOpenUserList: () => void;
    currentUser: any;
}

export function Sidebar({ onSelectConversation, selectedId, onOpenUserList, currentUser }: SidebarProps) {
    const [search, setSearch] = useState("");
    const conversations = useQuery(api.conversations.getUserConversations);

    const filteredConversations = conversations?.filter((c) => {
        if (!search) return true;
        return c.name?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full bg-[var(--card)] relative transition-all duration-300">
            {/* Premium Header */}
            <div className="p-4 px-6 flex justify-between items-center sticky top-0 glass-morphism z-20 border-b border-[var(--card-border)] shadow-sm">
                <div className="flex flex-col group cursor-pointer">
                    <h1 className="text-2xl font-black bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent tracking-tighter animate-shine">Talksy</h1>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em] leading-none mt-0.5 group-hover:text-blue-500 transition-colors">Premium Messaging</span>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={onOpenUserList}
                        className="p-2.5 bg-[var(--input)] hover:bg-blue-50 dark:hover:bg-blue-900/30 text-[var(--muted)] hover:text-blue-600 rounded-full transition-all duration-300 active:scale-90 hover:rotate-90 group"
                        title="New Chat"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110" />
                    </button>
                    <div className="ring-2 ring-[var(--card-border)] rounded-full p-0.5 hover:ring-blue-100 transition-all cursor-pointer">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </div>


            <div className="px-5 py-3">
                <SearchBar value={search} onChange={setSearch} placeholder="Search messages..." />
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
                {filteredConversations === undefined ? (
                    <div className="flex flex-col gap-3 p-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-full h-16 bg-[var(--input)] animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                        <div className="w-16 h-16 bg-[var(--input)] rounded-full flex items-center justify-center mb-4 text-[var(--muted)]">
                            <Plus className="w-6 h-6 opacity-20" />
                        </div>
                        <p className="text-sm font-bold text-[var(--muted)] uppercase tracking-widest">No chats found</p>
                        <button
                            onClick={onOpenUserList}
                            className="mt-4 text-xs font-black text-blue-600 hover:text-blue-700 underline underline-offset-4 uppercase tracking-tighter"
                        >
                            Start a new one
                        </button>
                    </div>
                ) : (
                    <div className="space-y-0.5 pb-20">
                        {filteredConversations.map((conv) => (
                            <ConversationItem
                                key={conv._id}
                                conversation={conv}
                                isSelected={selectedId === conv._id}
                                onClick={() => onSelectConversation(conv._id)}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
