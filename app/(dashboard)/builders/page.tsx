import { requireUser } from "@/lib/auth";
import { getBuildersByUserId } from "@/lib/db/queries/builders-detail";
import { BuilderCard } from "@/components/builders/builder-card";
import { Building2 } from "lucide-react";

export default async function BuildersPage() {
  const user = await requireUser();
  const builders = await getBuildersByUserId(user.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Builders</h1>

      {builders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-4 text-muted-foreground">No builders yet</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {builders.map((builder) => (
            <BuilderCard key={builder.id} builder={builder} />
          ))}
        </div>
      )}
    </div>
  );
}
