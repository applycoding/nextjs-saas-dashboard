"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createEventAction } from "@/lib/actions";
import type { ActionState } from "@/lib/result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Record event"}
    </Button>
  );
}

export function EventForm({ projects }: { projects: { id: string; name: string }[] }) {
  const [state, formAction] = useActionState(createEventAction, null as ActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div className="grid gap-1.5">
        <Label htmlFor="event-project">Project</Label>
        <select
          id="event-project"
          name="projectId"
          required
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          defaultValue={projects[0]?.id ?? ""}
        >
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="event-name">Event name</Label>
        <Input id="event-name" name="name" required pattern="[a-z][a-z0-9_]*" placeholder="signup_completed" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="event-count">Count</Label>
        <Input id="event-count" name="count" type="number" required min={1} max={100000} defaultValue={1} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="event-time">Occurred at</Label>
        <Input id="event-time" name="occurredAt" type="datetime-local" />
      </div>
      {state?.ok === false ? (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="text-sm text-muted-foreground sm:col-span-2">
          {state.message}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <SubmitButton />
      </div>
    </form>
  );
}
