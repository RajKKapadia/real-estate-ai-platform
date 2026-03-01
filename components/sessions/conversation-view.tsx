import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SessionItem } from "@/lib/db/schema";

type ItemData = Record<string, unknown>;
type SessionItemType = "message" | "function_call" | "function_call_result";

function formatMaybeJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function getItemType(data: ItemData): SessionItemType | null {
  const type = data.type;
  if (type === "message" || type === "function_call" || type === "function_call_result") {
    return type;
  }
  return null;
}

function extractText(data: ItemData): string {
  const content = data.content;

  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object") {
          if ("text" in part) return (part as { text: string }).text;
        }
        return "";
      })
      .filter(Boolean)
      .join("");
  }

  if (content && typeof content === "object" && "text" in content) {
    return (content as { text: string }).text;
  }

  return "";
}

function extractFunctionCallArguments(data: ItemData): string {
  const args = data.arguments;
  if (typeof args === "string") return formatMaybeJson(args);
  if (args === null || args === undefined) return "";

  try {
    return JSON.stringify(args, null, 2);
  } catch {
    return String(args);
  }
}

function extractFunctionResultText(data: ItemData): string {
  const output = data.output;

  if (typeof output === "string") return output;

  if (output && typeof output === "object") {
    const outputObj = output as Record<string, unknown>;
    if (typeof outputObj.text === "string") return formatMaybeJson(outputObj.text);

    try {
      return JSON.stringify(outputObj, null, 2);
    } catch {
      return String(outputObj);
    }
  }

  return "";
}

export function ConversationView({ items }: { items: SessionItem[] }) {
  const displayable = items
    .map((item) => {
      const data = item.itemData as ItemData;
      const type = getItemType(data);
      if (!type) return null;

      return { item, data, type };
    })
    .filter(Boolean) as Array<{
    item: SessionItem;
    data: ItemData;
    type: SessionItemType;
  }>;

  if (displayable.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        No messages in this conversation.
      </p>
    );
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border p-4">
      <div className="space-y-3">
        {displayable.map(({ item, data, type }) => {
          const role = data.role as string;
          const isMessage = type === "message";
          const isUserMessage = isMessage && role === "user";
          const text = isMessage
            ? extractText(data)
            : type === "function_call"
            ? extractFunctionCallArguments(data)
            : extractFunctionResultText(data);
          const toolName = (data.name as string | undefined) ?? "tool";
          const callId = data.callId as string | undefined;

          return (
            <div
              key={item.id}
              className={cn(
                "flex",
                isUserMessage ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  isUserMessage
                    ? "bg-primary text-primary-foreground"
                    : type === "function_call"
                    ? "border bg-background"
                    : type === "function_call_result"
                    ? "border bg-muted/50"
                    : "bg-muted"
                )}
              >
                {!isMessage && (
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="outline">
                      {type === "function_call" ? "Tool call" : "Tool response"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{toolName}</span>
                    {callId && (
                      <span className="text-xs text-muted-foreground">({callId})</span>
                    )}
                  </div>
                )}
                {type === "function_call" || type === "function_call_result" ? (
                  <pre className="whitespace-pre-wrap break-words rounded bg-muted p-2 font-mono text-xs">
                    {text}
                  </pre>
                ) : (
                  <p className="whitespace-pre-wrap">{text}</p>
                )}
                <p
                  className={cn(
                    "mt-1 text-xs",
                    isUserMessage
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {new Date(item.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
