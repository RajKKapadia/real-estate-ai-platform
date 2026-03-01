import { notFound } from "next/navigation";
import { getBuilderById } from "@/lib/db/queries/builders-detail";
import { BuilderForm } from "@/components/builders/builder-form";
import { deleteBuilderAction, updateBuilderAction } from "@/actions/builders";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default async function BuilderDetailPage({
  params,
}: {
  params: Promise<{ builderId: string }>;
}) {
  const { builderId } = await params;
  const builder = await getBuilderById(builderId);
  if (!builder) notFound();

  const updateAction = updateBuilderAction.bind(null, builderId);
  const deleteAction = deleteBuilderAction.bind(null, builderId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <BuilderForm builder={builder} action={updateAction} />
      <form action={deleteAction}>
        <Button variant="destructive" type="submit">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Builder
        </Button>
      </form>
    </div>
  );
}
