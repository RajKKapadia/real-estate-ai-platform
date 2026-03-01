import { notFound } from "next/navigation";
import {
  getSessionById,
  getSessionItemsBySessionId,
} from "@/lib/db/queries/sessions";
import { ConversationView } from "@/components/sessions/conversation-view";
import { Badge } from "@/components/ui/badge";
import { maskNumber } from "@/lib/mask";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ builderId: string; sessionId: string }>;
}) {
  const { builderId, sessionId } = await params;
  const session = await getSessionById(sessionId);
  if (!session || session.builderId !== builderId) notFound();

  const items = await getSessionItemsBySessionId(sessionId);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold">Conversation</h2>
        <Badge
          variant={session.platform === "whatsapp" ? "default" : "secondary"}
        >
          {session.platform}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {maskNumber(session.userId)}
        </span>
      </div>
      <ConversationView items={items} />
    </div>
  );
}
