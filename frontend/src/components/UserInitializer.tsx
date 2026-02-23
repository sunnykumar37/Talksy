"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";
import { api } from "@convex/_generated/api";

/**
 * UserInitializer handles:
 * 1. Syncing Clerk user profile to Convex on login (createOrGetUser)
 * 2. Managing online/offline status
 */
export default function UserInitializer() {
    const { user, isLoaded } = useUser();
    const syncUser = useMutation(api.users.createOrGetUser);
    const setOnline = useMutation(api.users.setUserOnline);
    const setOffline = useMutation(api.users.setUserOffline);

    useEffect(() => {
        if (!isLoaded || !user) return;

        // 1. Sync user data to Convex
        const performSync = async () => {
            console.log("UserInitializer: Starting sync for", user.id);
            try {
                const userId = await syncUser({
                    clerkId: user.id,
                    name: user.fullName || user.username || "Anonymous",
                    email: user.primaryEmailAddress?.emailAddress || "",
                    imageUrl: user.imageUrl,
                });
                console.log("UserInitializer: Sync successful, Convex ID:", userId);

                // 2. Once synced, set as online
                await setOnline({ clerkId: user.id });
                console.log("UserInitializer: Status set to online");
            } catch (error) {
                console.error("UserInitializer: Sync FAILED:", error);
            }
        };

        performSync();

        // 3. Handle offline status on unmount or tab close
        const handleOffline = () => {
            setOffline({ clerkId: user.id });
        };

        window.addEventListener("beforeunload", handleOffline);

        return () => {
            handleOffline();
            window.removeEventListener("beforeunload", handleOffline);
        };
    }, [user, isLoaded, syncUser, setOnline, setOffline]);

    return null;
}
