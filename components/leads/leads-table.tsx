"use client";

import { useState } from "react";
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
import { LeadDetailSheet } from "./lead-detail-sheet";
import { Search, Users } from "lucide-react";
import type { Lead } from "@/lib/db/schema";
import { maskNumber } from "@/lib/mask";

export function LeadsTable({
  leads,
  builderId,
}: {
  leads: Lead[];
  builderId: string;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.mobile.includes(search)
  );

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <Users className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">
          No leads captured yet. Leads will appear here when the AI agent
          captures buyer information.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((lead) => (
              <TableRow
                key={lead.id}
                className="cursor-pointer"
                onClick={() => setSelected(lead)}
              >
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{maskNumber(lead.mobile)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      lead.platform === "whatsapp" ? "default" : "secondary"
                    }
                  >
                    {lead.platform}
                  </Badge>
                </TableCell>
                <TableCell>
                  {lead.mobileVerified ? (
                    <Badge variant="default">Verified</Badge>
                  ) : (
                    <Badge variant="outline">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No matching leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <LeadDetailSheet
        lead={selected}
        builderId={builderId}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
