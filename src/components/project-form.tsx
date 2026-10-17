"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { createProjectAction, updateProjectAction } from "@/lib/actions";
import type { ActionState } from "@/lib/result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function ProjectForm({
  mode,
  project,
}: {
  mode: "create" | "edit";
  project?: { id: string; name: string; description: string };
}) {
  const action = mode === "create" ? createProjectAction : updateProjectAction;
  const [state, formAction] = useActionState(action, null as ActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (mode === "create" && state?.ok) formRef.current?.reset();
  }, [mode, state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3">
      {project ? <input type="hidden" name="id" value={project.id} /> : null}
      <div className="grid gap-1.5">
        <Label htmlFor={`${mode}-name`}>Name</Label>
        <Input id={`${mode}-name`} name="name" required minLength={2} maxLength={80} defaultValue={project?.name} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor={`${mode}-description`}>Description</Label>
        <Input
          id={`${mode}-description`}
          name="description"
          maxLength={280}
          defaultValue={project?.description}
        />
      </div>
      {state?.ok === false ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="text-sm text-muted-foreground">
          {state.message}
        </p>
      ) : null}
      <div>
        <SubmitButton label={mode === "create" ? "Create project" : "Save project"} />
      </div>
    </form>
  );
}
