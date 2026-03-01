import { requireUser } from "@/lib/auth";
import { getBuildersByUserId } from "@/lib/db/queries/builders-detail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await requireUser();
  const builders = await getBuildersByUserId(user.id);

  return (
    <div className="space-y-6">
      <div>
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.fullName || user.email}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Builders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{builders.length}</p>
          </CardContent>
        </Card>
      </div>

      {builders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-semibold">No builders yet</h2>
            <p className="mb-4 text-muted-foreground">
              Builder setup is managed from your account onboarding flow.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {builders.map((builder) => (
            <Link key={builder.id} href={`/builders/${builder.builderId}`}>
              <Card className="transition-colors hover:border-primary/50">
                <CardHeader>
                  <CardTitle>{builder.agentName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {builder.description || "No description"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
