"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";


const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    return (
        <ConvexProviderWithClerkInner>{children}</ConvexProviderWithClerkInner>
    );
}


function ConvexProviderWithClerkInner({ children }: { children: ReactNode }) {
    const { isLoaded, isSignedIn } = useAuth();
    console.log("ConvexClientProvider: Auth State", { isLoaded, isSignedIn });

    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            {children}
        </ConvexProviderWithClerk>
    );
}

