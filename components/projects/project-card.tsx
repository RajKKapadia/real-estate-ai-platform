import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/lib/db/schema";

function formatPrice(amount: number | null): string {
  if (!amount) return "";
  if (amount >= 10_000_000) return `${(amount / 10_000_000).toFixed(1)} Cr`;
  if (amount >= 100_000) return `${(amount / 100_000).toFixed(1)} L`;
  return amount.toLocaleString("en-IN");
}

export function ProjectCard({
  project,
  builderId,
}: {
  project: Project;
  builderId: string;
}) {
  const priceRange = [
    formatPrice(project.priceRangeMin),
    formatPrice(project.priceRangeMax),
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <Link href={`/builders/${builderId}/projects/${project.id}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{project.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{project.location}</p>
          </div>
          <div className="flex gap-1">
            <Badge variant="secondary">
              {project.propertyType}
            </Badge>
            <Badge variant="outline">{project.bhk} BHK</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {priceRange && (
            <p className="text-sm font-medium">INR {priceRange}</p>
          )}
          {project.description && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
