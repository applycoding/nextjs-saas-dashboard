export function SampleDataBanner({ includesSample }: { includesSample: boolean }) {
  if (!includesSample) {
    return (
      <p role="note" className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
        No seeded sample events are in this view. Counts below are only what was recorded in this demo.
      </p>
    );
  }

  return (
    <p role="note" className="rounded-lg border border-amber-700/40 bg-amber-100 px-3 py-2 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
      <strong className="font-medium">Sample data. </strong>
      Charts and totals include seeded demo events. They are not production metrics. Events you add here are labeled separately as recorded in this demo.
    </p>
  );
}
