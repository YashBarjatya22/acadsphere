import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getThreadMessages } from "@/lib/chat.functions";
import { ChatLayout } from "@/components/chat/ChatLayout";
import { ChatWindow } from "@/components/chat/ChatWindow";
import type { UIMessage } from "ai";

export const Route = createFileRoute("/_authenticated/app/$threadId")({
  component: ThreadPage,
});

function ThreadPage() {
  const { threadId } = useParams({ from: "/_authenticated/app/$threadId" });
  const fetchMessages = useServerFn(getThreadMessages);
  const { data, isLoading } = useQuery({
    queryKey: ["thread", threadId],
    queryFn: () => fetchMessages({ data: { threadId } }),
  });

  const initialMessages: UIMessage[] = (
    (data?.messages ?? []) as { id: string; role: string; parts?: unknown }[]
  ).map((m) => ({
    id: m.id,
    role: m.role as UIMessage["role"],
    parts: (m.parts ?? []) as UIMessage["parts"],
  }));

  return (
    <ChatLayout activeThreadId={threadId}>
      {isLoading ? (
        <div className="grid h-full place-items-center text-muted-foreground">Loading…</div>
      ) : (
        <ChatWindow key={threadId} threadId={threadId} initialMessages={initialMessages} />
      )}
    </ChatLayout>
  );
}
