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
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-black">Other Users</h2>
            </div>
            <SearchBar value={search} onChange={setSearch} placeholder="Search users by name..." />
            <div className="flex-1 overflow-y-auto">
                {users === undefined ? (
                    <div className="p-4 text-center text-gray-500">Loading users...</div>
                ) : users.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No other users found</div>
                ) : (
                    users.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => handleUserClick(user._id)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b last:border-0"
                        >
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                <img src={user.imageUrl} alt={user.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 text-left">
                                <div className="font-semibold text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

