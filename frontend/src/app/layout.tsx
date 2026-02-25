import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import UserInitializer from "@/components/UserInitializer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talksy - Real-time Chat App",
  description: "Built with Next.js, Convex, and Clerk",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
          <ConvexClientProvider>
            <UserInitializer />
            {children}
          </ConvexClientProvider>
        </ClerkProvider>

      </body>
    </html>
  );
}