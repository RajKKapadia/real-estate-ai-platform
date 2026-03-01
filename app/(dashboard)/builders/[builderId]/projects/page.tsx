import { getProjectsByBuilderId } from "@/lib/db/queries/projects";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Plus, FolderOpen } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ builderId: string }>;
}) {
  const { builderId } = await params;
  const projects = await getProjectsByBuilderId(builderId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Projects</h2>
        <Button asChild>
          <Link href={`/builders/${builderId}/projects/new`}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">No projects yet</p>
          <Button asChild>
            <Link href={`/builders/${builderId}/projects/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              builderId={builderId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
