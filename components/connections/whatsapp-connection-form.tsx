"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, MessageCircle } from "lucide-react";
import { upsertWhatsAppConnectionAction } from "@/actions/connections";
import type { Connection } from "@/lib/db/schema";
import { env } from "@/lib/env/client";

type FormState = { error?: Record<string, string[]> } | undefined;

export function WhatsAppConnectionForm({
  builderId,
  connection,
  webhookVerifyToken,
}: {
  builderId: string;
  connection?: Connection | null;
  webhookVerifyToken?: string | null;
}) {
  const action = upsertWhatsAppConnectionAction.bind(null, builderId);
  const [copiedField, setCopiedField] = useState<"token" | "url" | null>(null);

  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData) => {
      const result = await action(formData);
      return result && "error" in result ? result : undefined;
    },
    undefined
  );

  const webhookUrl = `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp/${builderId}`;
  const tokenDisplay =
    webhookVerifyToken ?? "Will be auto-generated after you connect";

  const handleCopy = async (field: "token" | "url", value: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <CardTitle className="text-base">WhatsApp</CardTitle>
        {connection?.is_active && (
          <Badge variant="secondary" className="ml-auto">
            Active
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaAccessToken">Meta Access Token</Label>
            <Input
              id="metaAccessToken"
              name="metaAccessToken"
              type="password"
              placeholder="Enter access token"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaAppSecret">App Secret</Label>
            <Input
              id="metaAppSecret"
              name="metaAppSecret"
              type="password"
              placeholder="Enter app secret"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderPhoneId">Phone Number ID</Label>
            <Input
              id="senderPhoneId"
              name="senderPhoneId"
              placeholder={
                connection ? "Configured. Enter again to update." : "Enter phone number ID"
              }
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Webhook Verify Token</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopy("token", webhookVerifyToken ?? null)}
                disabled={!webhookVerifyToken}
              >
                {copiedField === "token" ? (
                  <Check className="mr-1 h-3 w-3" />
                ) : (
                  <Copy className="mr-1 h-3 w-3" />
                )}
                {copiedField === "token" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="rounded-md bg-muted p-2 text-xs font-mono break-all select-all">
              {tokenDisplay}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label>Webhook URL</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopy("url", webhookUrl)}
              >
                {copiedField === "url" ? (
                  <Check className="mr-1 h-3 w-3" />
                ) : (
                  <Copy className="mr-1 h-3 w-3" />
                )}
                {copiedField === "url" ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="rounded-md bg-muted p-2 text-xs font-mono break-all select-all">
              {webhookUrl}
            </p>
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">
              {Object.values(state.error).flat()[0]}
            </p>
          )}

          <Button type="submit" disabled={pending}>
            {pending
              ? "Saving..."
              : connection
                ? "Update Connection"
                : "Connect WhatsApp"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
