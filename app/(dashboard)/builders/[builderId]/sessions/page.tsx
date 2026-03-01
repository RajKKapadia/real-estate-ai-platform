import { getSessionsByBuilderId } from "@/lib/db/queries/sessions";
import { SessionsTable } from "@/components/sessions/sessions-table";

export default async function SessionsPage({
  params,
}: {
  params: Promise<{ builderId: string }>;
}) {
  const { builderId } = await params;
  const sessions = await getSessionsByBuilderId(builderId);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Sessions</h2>
      <SessionsTable sessions={sessions} builderId={builderId} />
    </div>
  );
}
