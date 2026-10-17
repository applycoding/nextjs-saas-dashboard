"use client";

import { deleteProjectAction } from "@/lib/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteProjectDialog({ id, name }: { id: string; name: string }) {
  return (
    <Dialog>
      <DialogTrigger className={buttonVariants({ variant: "destructive" })}>Delete project</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}?</DialogTitle>
          <DialogDescription>
            Events on this project are removed with it. This only changes the demo database.
          </DialogDescription>
        </DialogHeader>
        <form action={deleteProjectAction}>
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="destructive">
            Delete project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
