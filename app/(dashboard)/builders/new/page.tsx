import { BuilderForm } from "@/components/builders/builder-form";
import { createBuilderAction } from "@/actions/builders";

export default function NewBuilderPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Create Builder</h1>
      <BuilderForm action={createBuilderAction} />
    </div>
  );
}
