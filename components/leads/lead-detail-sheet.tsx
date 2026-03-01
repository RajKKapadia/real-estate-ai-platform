"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Lead } from "@/lib/db/schema";
import { maskNumber } from "@/lib/mask";

export function LeadDetailSheet({
  lead,
  builderId,
  onClose,
}: {
  lead: Lead | null;
  builderId: string;
  onClose: () => void;
}) {
  return (
    <Sheet open={!!lead} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full p-0 text-sm sm:max-w-md">
        <SheetHeader className="border-b p-5 pr-14">
          <SheetTitle>{lead?.name || "Lead Details"}</SheetTitle>
        </SheetHeader>
        {lead && (
          <div className="space-y-5 p-5">
            <div>
              <p className="text-sm text-muted-foreground">Mobile</p>
              <p className="mt-1 font-medium tracking-wide">{maskNumber(lead.mobile)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <Badge
                variant={
                  lead.platform === "whatsapp" ? "default" : "secondary"
                }
                className="mt-1"
              >
                {lead.platform}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Verified</p>
              <Badge
                variant={lead.mobileVerified ? "default" : "outline"}
                className="mt-1"
              >
                {lead.mobileVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground">Captured</p>
              <p className="mt-1 text-sm">
                {new Date(lead.createdAt).toLocaleString()}
              </p>
            </div>
            {lead.sessionId && (
              <div>
                <p className="text-sm text-muted-foreground">Session</p>
                <Link
                  href={`/builders/${builderId}/sessions/${lead.sessionId}`}
                  className="mt-1 inline-block text-sm text-primary hover:underline"
                >
                  View conversation
                </Link>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
