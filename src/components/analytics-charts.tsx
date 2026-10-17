"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DailyPoint, NamedTotal } from "@/lib/analytics";
import { formatDay } from "@/lib/format";

const SAMPLE_COLOR = "#0f766e";
const RECORDED_COLOR = "#b45309";

export function AnalyticsCharts({ series, byName }: { series: DailyPoint[]; byName: NamedTotal[] }) {
  const labeled = series.map((point) => ({ ...point, label: formatDay(point.date) }));

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 lg:col-span-3">
        <header className="mb-3">
          <h2 className="text-base font-medium">Daily event volume</h2>
          <p className="text-sm text-muted-foreground">Sample events and events recorded in this demo, by UTC day.</p>
        </header>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={labeled}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
              <Tooltip />
              <Area type="monotone" dataKey="sample" name="Sample data" stroke={SAMPLE_COLOR} fill={SAMPLE_COLOR} fillOpacity={0.25} />
              <Area type="monotone" dataKey="recorded" name="Recorded in demo" stroke={RECORDED_COLOR} fill={RECORDED_COLOR} fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="rounded-xl bg-card p-4 ring-1 ring-foreground/10 lg:col-span-2">
        <header className="mb-3">
          <h2 className="text-base font-medium">Events by name</h2>
          <p className="text-sm text-muted-foreground">Sum of the count field. Not a benchmark.</p>
        </header>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byName}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} height={60} textAnchor="end" />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
              <Tooltip />
              <Bar dataKey="sample" name="Sample data" stackId="events" fill={SAMPLE_COLOR} />
              <Bar dataKey="recorded" name="Recorded in demo" stackId="events" fill={RECORDED_COLOR} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
