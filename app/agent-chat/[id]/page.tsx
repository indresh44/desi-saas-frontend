import { AgentChatSessionClient } from "@/components/agent-chat/agent-chat-session-client";

export const metadata = {
  title: "Agent chat session",
};

export default async function AgentChatSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AgentChatSessionClient sessionId={id} />;
}
