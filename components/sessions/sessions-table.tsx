"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare } from "lucide-react";
import type { Session } from "@/lib/db/schema";
import { maskNumber } from "@/lib/mask";

type SessionWithCount = Session & { itemCount: number };

export function SessionsTable({
  sessions,
  builderId,
}: {
  sessions: SessionWithCount[];
  builderId: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = sessions.filter((s) =>
    s.userId.toLowerCase().includes(search.toLowerCase())
  );

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          No chat sessions yet. Sessions will appear when users start chatting.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Last Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <Link
                    href={`/builders/${builderId}/sessions/${session.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {maskNumber(session.userId)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      session.platform === "whatsapp"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {session.platform}
                  </Badge>
                </TableCell>
                <TableCell>{session.itemCount}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(session.updatedAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  No matching sessions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
