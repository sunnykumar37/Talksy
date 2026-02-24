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
        <div className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-[var(--card)] border-r border-[var(--card-border)] relative overflow-hidden group/sidebar">
            {/* Subtle Neon Edge Glow */}
            <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent group-hover/sidebar:via-blue-500/40 transition-all duration-1000" />

            {/* Premium Header - Standardized Height & Centered Content */}
            <div className="h-[88px] px-6 flex items-center justify-between sticky top-0 glass-morphism z-30 border-b border-[var(--card-border)] shadow-sm">
                <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-black bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 bg-clip-text text-transparent tracking-tighter animate-shine leading-none">Talksy</h1>
                    <span className="text-[10px] font-extrabold text-[var(--muted)] uppercase tracking-[0.2em] leading-none mt-1.5 group-hover:text-[var(--accent)] transition-colors">Premium Messaging</span>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={onOpenUserList}
                        className="p-2.5 rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)] transition-all duration-300 active:scale-90"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>

            {/* Scanline / Grain Overlay for depth (optional but adds texture) */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div className="p-3 mt-1">
                <SearchBar value={search} onChange={setSearch} placeholder="Search messages..." />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-2 space-y-1">
                {filteredConversations === undefined ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-12 h-12 border-4 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin shadow-lg" />
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--muted)] animate-pulse">Syncing Conversations</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 py-20 text-center glass-morphism rounded-3xl mx-2 border border-[var(--card-border)] shadow-xl">
                        <div className="w-16 h-16 bg-[var(--input)] rounded-full flex items-center justify-center mb-4 ring-1 ring-[var(--card-border)]">
                            <Plus className="w-8 h-8 text-[var(--muted)]" />
                        </div>
                        <h3 className="text-[var(--foreground)] font-black mb-1">No chats found</h3>
                        <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-tighter">Start your first premium chat</p>
                        <button
                            onClick={onOpenUserList}
                            className="mt-6 px-6 py-2.5 bg-[var(--accent)] hover:opacity-90 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                        >
                            Find People
                        </button>
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <ConversationItem
                            key={conv._id}
                            conversation={conv}
                            isSelected={selectedId === conv._id}
                            onClick={() => onSelectConversation(conv._id)}
                            currentUser={currentUser}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

