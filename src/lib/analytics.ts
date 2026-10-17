export const SAMPLE_SOURCE = "sample";
export const RECORDED_SOURCE = "recorded";

export type AnalyticsEvent = {
  name: string;
  occurredAt: Date | string;
  count: number;
  source: string;
  projectId: string;
};

export type DailyPoint = {
  date: string;
  sample: number;
  recorded: number;
  total: number;
};

export type EventSummary = {
  total: number;
  sample: number;
  recorded: number;
  projectCount: number;
  topEventName: string | null;
  includesSample: boolean;
};

export type NamedTotal = {
  name: string;
  total: number;
  sample: number;
  recorded: number;
};

export function dayKey(value: Date | string): string | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export function summarizeEvents(events: AnalyticsEvent[]): EventSummary {
  let sample = 0;
  let recorded = 0;
  const names = new Map<string, number>();
  const projects = new Set<string>();

  for (const event of events) {
    if (event.source === SAMPLE_SOURCE) sample += event.count;
    else recorded += event.count;
    names.set(event.name, (names.get(event.name) ?? 0) + event.count);
    projects.add(event.projectId);
  }

  let topEventName: string | null = null;
  let topCount = -1;
  for (const [name, count] of names) {
    if (count > topCount) {
      topEventName = name;
      topCount = count;
    }
  }

  return {
    total: sample + recorded,
    sample,
    recorded,
    projectCount: projects.size,
    topEventName,
    includesSample: sample > 0,
  };
}

export function dailySeries(events: AnalyticsEvent[], days: number, now = new Date()): DailyPoint[] {
  const safeDays = Math.max(1, Math.floor(days));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const points: DailyPoint[] = [];

  for (let offset = safeDays - 1; offset >= 0; offset -= 1) {
    const day = new Date(end);
    day.setUTCDate(end.getUTCDate() - offset);
    points.push({ date: day.toISOString().slice(0, 10), sample: 0, recorded: 0, total: 0 });
  }

  const index = new Map(points.map((point, position) => [point.date, position]));

  for (const event of events) {
    const key = dayKey(event.occurredAt);
    if (!key) continue;
    const position = index.get(key);
    if (position === undefined) continue;
    const point = points[position];
    if (!point) continue;
    if (event.source === SAMPLE_SOURCE) point.sample += event.count;
    else point.recorded += event.count;
    point.total += event.count;
  }

  return points;
}

export function eventsByName(events: AnalyticsEvent[]): NamedTotal[] {
  const totals = new Map<string, NamedTotal>();
  for (const event of events) {
    const current = totals.get(event.name) ?? {
      name: event.name,
      total: 0,
      sample: 0,
      recorded: 0,
    };
    current.total += event.count;
    if (event.source === SAMPLE_SOURCE) current.sample += event.count;
    else current.recorded += event.count;
    totals.set(event.name, current);
  }
  return [...totals.values()].sort((left, right) => right.total - left.total || left.name.localeCompare(right.name));
}

export type AnalyticsPayload = {
  summary: EventSummary;
  series: DailyPoint[];
  byName: NamedTotal[];
  days: number;
};

export function buildAnalyticsPayload(
  events: AnalyticsEvent[],
  days: number,
  now = new Date(),
): AnalyticsPayload {
  return {
    summary: summarizeEvents(events),
    series: dailySeries(events, days, now),
    byName: eventsByName(events),
    days,
  };
}

export const UNMEASURED_METRICS = [
  { label: "Retention", note: "Not measured in this demo." },
  { label: "Revenue", note: "Not measured in this demo." },
  { label: "Conversion", note: "Not measured in this demo." },
] as const;
