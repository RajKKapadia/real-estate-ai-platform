"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { upsertWebsiteConnectionAction } from "@/actions/connections";
import type { Connection } from "@/lib/db/schema";

type FormState = { error?: Record<string, string[]> } | undefined;

export function WebsiteConnectionForm({
  builderId,
  connection,
}: {
  builderId: string;
  connection?: Connection | null;
}) {
  const action = upsertWebsiteConnectionAction.bind(null, builderId);

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData) => {
      const result = await action(formData);
      return result && "error" in result ? result : undefined;
    },
    undefined
  );

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <Globe className="h-5 w-5" />
        <CardTitle className="text-base">Website Widget</CardTitle>
        {connection?.is_active && (
          <Badge variant="secondary" className="ml-auto">
            Active
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allowedDomain">Allowed Domain</Label>
            <Input
              id="allowedDomain"
              name="allowedDomain"
              placeholder="e.g. example.com"
              defaultValue={connection?.allowedDomain ?? ""}
              required
            />
            {state?.error?.allowedDomain && (
              <p className="text-sm text-destructive">
                {state.error.allowedDomain[0]}
              </p>
            )}
          </div>

          <Button type="submit" disabled={pending}>
            {pending
              ? "Saving..."
              : connection
                ? "Update Connection"
                : "Enable Widget"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
