"use client";

import { Button } from "@/components/ui/button";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="grid gap-3">
      <h1 className="text-2xl font-medium">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">{error.message || "The workspace could not be loaded."}</p>
      <div>
        <Button type="button" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </div>
  );
}
