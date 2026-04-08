"use client";

import { ReactNode, useState } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatToggleButton } from "@/components/chat/chat-toggle-button";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ChatProvider } from "@/lib/chat/chat-context";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ChatProvider>
      <div className="min-h-screen bg-shell-bg text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
          <AppSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <AppHeader onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="flex-1 px-4 py-4 md:px-6 md:py-6">{children}</main>
          </div>
        </div>
      </div>
      <ChatToggleButton />
      <ChatPanel />
    </ChatProvider>
  );
}
