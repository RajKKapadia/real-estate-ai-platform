import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BuilderDetails } from "@/lib/db/schema";

export function BuilderCard({ builder }: { builder: BuilderDetails }) {
  return (
    <Link href={`/builders/${builder.builderId}`}>
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">{builder.agentName}</CardTitle>
          {builder.property && (
            <Badge variant="secondary">{builder.property}</Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {builder.description || "No description"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Created {new Date(builder.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
