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
        // Basic search - ideally would search by member names
        return c.name?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="flex flex-col h-full bg-white border-r">
            <div className="p-4 flex justify-between items-center border-b">
                <h1 className="text-xl font-bold text-blue-600">Talksy</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenUserList}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="New Chat"
                    >
                        <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </div>

            <SearchBar value={search} onChange={setSearch} placeholder="Search chats..." />

            <div className="flex-1 overflow-y-auto">
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
