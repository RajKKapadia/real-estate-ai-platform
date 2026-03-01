"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BuilderDetails } from "@/lib/db/schema";

type FormState = { error?: Record<string, string[]> } | undefined;

export function BuilderForm({
  builder,
  action,
}: {
  builder?: BuilderDetails;
  action: (formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData) => action(formData),
    undefined
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{builder ? "Edit Builder" : "Create Builder"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentName">Agent Name</Label>
            <Input
              id="agentName"
              name="agentName"
              placeholder="e.g. Sunshine Realty Assistant"
              defaultValue={builder?.agentName}
              required
            />
            {state?.error?.agentName && (
              <p className="text-sm text-destructive">
                {state.error.agentName[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="property">Property / Company Name</Label>
            <Input
              id="property"
              name="property"
              placeholder="e.g. Sunshine Builders Pvt Ltd"
              defaultValue={builder?.property ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Brief description of the builder or company..."
              defaultValue={builder?.description ?? ""}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : builder ? "Update" : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
