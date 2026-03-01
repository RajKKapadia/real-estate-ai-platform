import { notFound } from "next/navigation";
import { requireBuilderOwnership } from "@/lib/auth/guard";
import { BuilderSubNav } from "@/components/layout/builder-sub-nav";

export default async function BuilderLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ builderId: string }>;
}) {
  const { builderId } = await params;

  try {
    await requireBuilderOwnership(builderId);
  } catch {
    notFound();
  }

  return (
    <div className="-m-6 flex flex-col">
      <BuilderSubNav builderId={builderId} />
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
