"use client";

import { useRef } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Trash2, FileText, ImageIcon } from "lucide-react";
import {
  uploadDocumentAction,
  deleteDocumentAction,
} from "@/actions/uploads";

type Document = {
  id: string;
  fileName: string;
  fileType: string;
  publicUrl: string;
  sizeBytes: number | null;
};

export function DocumentUpload({
  builderId,
  projectId,
  documents,
}: {
  builderId: string;
  projectId: string;
  documents: Document[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const uploadAction = uploadDocumentAction.bind(null, builderId, projectId);
  const [uploadState, uploadFormAction, uploading] = useActionState(
    async (_prev: { error?: string } | undefined, formData: FormData) => {
      const result = await uploadAction(formData);
      if (!("error" in result)) {
        formRef.current?.reset();
      }
      return "error" in result ? result : undefined;
    },
    undefined
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents & Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form ref={formRef} action={uploadFormAction} className="flex gap-2">
          <input
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
            className="flex-1 text-sm file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-sm file:text-primary-foreground"
            required
          />
          <Button type="submit" disabled={uploading} size="sm">
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>
        {uploadState?.error && (
          <p className="text-sm text-destructive">{uploadState.error}</p>
        )}

        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <div className="flex items-center gap-2">
                  {doc.fileType === "image" ? (
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <a
                    href={doc.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    {doc.fileName}
                  </a>
                  {doc.sizeBytes && (
                    <span className="text-xs text-muted-foreground">
                      ({(doc.sizeBytes / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>
                <form
                  action={async () => {
                    await deleteDocumentAction(builderId, projectId, doc.id);
                  }}
                >
                  <Button variant="ghost" size="icon-xs" type="submit">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
