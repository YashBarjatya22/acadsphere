import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createThread } from "@/lib/chat.functions";
import { ChatLayout } from "@/components/chat/ChatLayout";

export const Route = createFileRoute("/_authenticated/app/")({
  component: AppIndex,
});

function AppIndex() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const createFn = useServerFn(createThread);
  const create = useMutation({
    mutationFn: () => createFn({ data: {} }),
    onSuccess: (t) => {
      qc.invalidateQueries({ queryKey: ["threads"] });
      navigate({ to: "/app/$threadId", params: { threadId: t.id }, replace: true });
    },
  });

  useEffect(() => {
    if (!create.isPending && !create.isSuccess) create.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ChatLayout activeThreadId={null}>
      <div className="grid h-full place-items-center text-muted-foreground">
        Spinning up a new chat…
      </div>
    </ChatLayout>
  );
}
