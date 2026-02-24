"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { SearchBar } from "./SearchBar";

export function UserList({ onSelectUser }: { onSelectUser: (id: string) => void }) {
    const [search, setSearch] = useState("");
    const users = useQuery(api.users.searchUsers, { query: search });
    const createConversation = useMutation(api.conversations.createOrGetConversation);


    console.log("UserList State - Search:", search);
    console.log("UserList State - Received Users:", users);

    const handleUserClick = async (userId: any) => {
        console.log("Creating conversation with:", userId);
        const conversationId = await createConversation({
            otherUserId: userId,
            isGroup: false,
        });
        onSelectUser(conversationId);
    };


    return (
        <div className="flex flex-col h-full bg-[var(--background)] relative overflow-hidden">
            <div className="p-4 px-6 border-b border-[var(--card-border)] glass-morphism sticky top-0 z-20 shadow-lg">
                <h2 className="text-xl font-black text-[var(--foreground)] tracking-tighter">Find People</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] mt-0.5">Start a premium conversation</p>
            </div>

            <div className="p-3">
                <SearchBar value={search} onChange={setSearch} placeholder="Search users by name..." />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {users === undefined ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-10 h-10 border-4 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin shadow-lg" />
                        <p className="text-xs font-black uppercase tracking-widest text-[var(--muted)] animate-pulse">Searching users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 py-20 text-center glass-morphism rounded-3xl mx-2 border border-[var(--card-border)] shadow-xl">
                        <div className="w-16 h-16 bg-[var(--input)] rounded-full flex items-center justify-center mb-4 ring-1 ring-[var(--card-border)]">
                            <span className="text-2xl text-[var(--muted)]">?</span>
                        </div>
                        <h3 className="text-[var(--foreground)] font-black mb-1">No one found</h3>
                        <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-tighter">Try a different name or email</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => handleUserClick(user._id)}
                            className="w-full flex items-center gap-4 p-4 hover:bg-[var(--card-border)]/30 rounded-2xl transition-all duration-300 group border-b border-[var(--card-border)]/10 last:border-0"
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-[var(--card-border)] group-hover:ring-[var(--accent)] transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:scale-105">
                                    <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                                </div>
                                {user.isOnline && (
                                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[var(--background)] shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                                )}
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-black text-[var(--foreground)] text-base tracking-tighter group-hover:text-[var(--accent)] transition-colors">{user.name}</div>
                                <div className="text-xs text-[var(--muted)] font-medium tracking-tight mt-0.5">{user.email}</div>
                            </div>
                            <div className="p-2 bg-[var(--input)] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)]"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

