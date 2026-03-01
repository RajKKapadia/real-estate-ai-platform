import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/db/queries/projects";
import { getDocumentsByProjectId } from "@/lib/db/queries/documents";
import { ProjectForm } from "@/components/projects/project-form";
import { DocumentUpload } from "@/components/projects/document-upload";
import {
  updateProjectAction,
  deleteProjectAction,
} from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ builderId: string; projectId: string }>;
}) {
  const { builderId, projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project || project.builderId !== builderId) notFound();

  const documents = await getDocumentsByProjectId(projectId);

  const updateAction = updateProjectAction.bind(null, builderId, projectId);
  const deleteAction = deleteProjectAction.bind(null, builderId, projectId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <ProjectForm project={project} action={updateAction} />

      <DocumentUpload
        builderId={builderId}
        projectId={projectId}
        documents={documents}
      />

      <form action={deleteAction}>
        <Button variant="destructive" type="submit">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Project
        </Button>
      </form>
    </div>
  );
}
