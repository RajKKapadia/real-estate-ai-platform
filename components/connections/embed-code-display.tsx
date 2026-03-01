"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy } from "lucide-react";

export function EmbedCodeDisplay({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Embed Code</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="mr-1 h-3 w-3" />
          ) : (
            <Copy className="mr-1 h-3 w-3" />
          )}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
          <code>{code}</code>
        </pre>
        <p className="mt-2 text-xs text-muted-foreground">
          Add this script tag before the closing &lt;/body&gt; tag on your
          website.
        </p>
      </CardContent>
    </Card>
  );
}
