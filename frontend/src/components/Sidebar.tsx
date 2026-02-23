"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { ConversationItem } from "./ConversationItem";
import { UserButton } from "@clerk/nextjs";
import { Plus, User } from "lucide-react";

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
        <div className="flex flex-col h-full bg-white relative transition-all duration-300">
            {/* Premium Header */}
            <div className="p-4 px-6 flex justify-between items-center sticky top-0 glass-morphism z-20 border-b border-slate-50 shadow-sm">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tighter">Talksy</h1>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Premium Messaging</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onOpenUserList}
                        className="p-2.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-full transition-all duration-300 active:scale-90 hover:rotate-90 group"
                        title="New Chat"
                    >
                        <Plus className="w-5 h-5 group-hover:scale-110" />
                    </button>
                    <div className="ring-2 ring-slate-100 rounded-full p-0.5 hover:ring-blue-100 transition-all cursor-pointer">
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </div>

            <div className="px-5 py-3">
                <SearchBar value={search} onChange={setSearch} placeholder="Search messages..." />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 px-1">

                {conversations === undefined ? (
                    <div className="p-4 text-center text-gray-500 text-sm">Loading conversations...</div>
                ) : conversations.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 mb-2 italic">No conversations yet.</div>
                        <button
                            onClick={onOpenUserList}
                            className="text-blue-500 text-sm font-semibold hover:underline"
                        >
                            Start chatting!
                        </button>
                    </div>
                ) : (
                    filteredConversations?.map((c) => (
                        <ConversationItem
                            key={c._id}
                            conversation={c}
                            isSelected={selectedId === c._id}
                            onClick={() => onSelectConversation(c._id)}
                            currentUser={currentUser}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
