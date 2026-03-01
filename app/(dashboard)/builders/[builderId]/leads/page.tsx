import { getLeadsByBuilderId } from "@/lib/db/queries/leads";
import { LeadsTable } from "@/components/leads/leads-table";

export default async function LeadsPage({
  params,
}: {
  params: Promise<{ builderId: string }>;
}) {
  const { builderId } = await params;
  const leads = await getLeadsByBuilderId(builderId);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Leads</h2>
      <LeadsTable leads={leads} builderId={builderId} />
    </div>
  );
}
