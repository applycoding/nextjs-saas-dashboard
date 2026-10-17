export type SampleEventDraft = {
  projectKey: "checkout" | "docs" | "status";
  name: string;
  count: number;
  occurredAt: Date;
  source: "sample";
};

const NAMES_BY_PROJECT = {
  checkout: ["signup_completed", "checkout_started"],
  docs: ["docs_search"],
  status: ["status_viewed"],
} as const;

export function buildSampleEvents(now: Date): SampleEventDraft[] {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const drafts: SampleEventDraft[] = [];

  for (let day = 0; day < 14; day += 1) {
    const occurredAt = new Date(end - day * 24 * 60 * 60 * 1000);
    for (const projectKey of ["checkout", "docs", "status"] as const) {
      NAMES_BY_PROJECT[projectKey].forEach((name, index) => {
        drafts.push({
          projectKey,
          name,
          count: 3 + ((day + index + name.length) % 8),
          occurredAt,
          source: "sample",
        });
      });
    }
  }

  return drafts;
}
