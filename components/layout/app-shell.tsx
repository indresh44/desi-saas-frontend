"use client";

import { ReactNode } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatToggleButton } from "@/components/chat/chat-toggle-button";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ChatProvider } from "@/lib/chat/chat-context";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-shell-bg text-foreground">
        <div className="flex min-h-screen w-full">
          <AppSidebar />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <AppHeader />
            {/* Bottom padding on mobile so content clears the fixed bottom nav
                (h-16 + safe-area-inset-bottom). Resets to py-6 on `md` where
                the bottom nav is hidden — desktop padding is unchanged. */}
            <main className="flex-1 px-4 pt-4 pb-[calc(4rem+env(safe-area-inset-bottom)+1rem)] md:px-6 md:py-6">
              {children}
            </main>
          </div>
        </div>
      </div>
      <ChatToggleButton />
      <ChatPanel />
      <AppBottomNav />
    </ChatProvider>
  );
}
