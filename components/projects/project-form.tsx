"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PROPERTY_TYPES, BHK_OPTIONS } from "@/lib/constants";
import type { Project } from "@/lib/db/schema";

type FormState = { error?: Record<string, string[]> } | undefined;

export function ProjectForm({
  project,
  action,
}: {
  project?: Project;
  action: (formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData) => action(formData),
    undefined
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{project ? "Edit Project" : "Create Project"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Sunrise Heights"
                defaultValue={project?.name}
                required
              />
              {state?.error?.name && (
                <p className="text-sm text-destructive">
                  {state.error.name[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Whitefield, Bangalore"
                defaultValue={project?.location}
                required
              />
              {state?.error?.location && (
                <p className="text-sm text-destructive">
                  {state.error.location[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyType">Property Type</Label>
              <Select
                name="propertyType"
                defaultValue={project?.propertyType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bhk">BHK</Label>
              <Select
                name="bhk"
                defaultValue={project?.bhk?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select BHK" />
                </SelectTrigger>
                <SelectContent>
                  {BHK_OPTIONS.map((bhk) => (
                    <SelectItem key={bhk} value={bhk.toString()}>
                      {bhk} BHK
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceRangeMin">Min Price (INR)</Label>
              <Input
                id="priceRangeMin"
                name="priceRangeMin"
                type="number"
                placeholder="e.g. 5000000"
                defaultValue={project?.priceRangeMin ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceRangeMax">Max Price (INR)</Label>
              <Input
                id="priceRangeMax"
                name="priceRangeMax"
                type="number"
                placeholder="e.g. 10000000"
                defaultValue={project?.priceRangeMax ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalFacilities">
              Additional Facilities (comma-separated)
            </Label>
            <Input
              id="additionalFacilities"
              name="additionalFacilities"
              placeholder="e.g. Swimming Pool, Gym, Club House"
              defaultValue={project?.additionalFacilities?.join(", ") ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Project description..."
              defaultValue={project?.description ?? ""}
              rows={4}
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : project ? "Update" : "Create"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
