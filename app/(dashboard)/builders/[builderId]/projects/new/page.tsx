import { ProjectForm } from "@/components/projects/project-form";
import { createProjectAction } from "@/actions/projects";

export default async function NewProjectPage({
  params,
}: {
  params: Promise<{ builderId: string }>;
}) {
  const { builderId } = await params;
  const action = createProjectAction.bind(null, builderId);

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mb-6 text-xl font-bold">Create Project</h2>
      <ProjectForm action={action} />
    </div>
  );
}
