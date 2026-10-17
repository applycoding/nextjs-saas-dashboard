import { AnalyticsCharts } from "@/components/analytics-charts";
import { KpiCard } from "@/components/kpi-card";
import { SampleDataBanner } from "@/components/sample-data-banner";
import { buildAnalyticsPayload, UNMEASURED_METRICS } from "@/lib/analytics";
import { getAppContext } from "@/lib/context";
import { formatCount } from "@/lib/format";
import { eventStore } from "@/lib/stores";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");
  const params = await searchParams;
  const events = await eventStore.list(ctx.organization.id);
  const analytics = buildAnalyticsPayload(
    events.map((event) => ({
      name: event.name,
      occurredAt: event.occurredAt,
      count: event.count,
      source: event.source,
      projectId: event.projectId,
    })),
    14,
  );
  const projectIds = new Set(events.map((event) => event.projectId));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-medium">Overview</h1>
        <p className="text-sm text-muted-foreground">
          {ctx.organization.name}. Totals are sums of event rows in this workspace.
        </p>
      </div>
      {params.error ? (
        <p role="alert" className="text-sm text-destructive">
          {params.error}
        </p>
      ) : null}
      <SampleDataBanner includesSample={analytics.summary.includesSample} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Event count"
          value={formatCount(analytics.summary.total)}
          detail={analytics.summary.includesSample ? "Includes sample data." : "Recorded in this demo."}
          measured
        />
        <KpiCard
          label="Sample events"
          value={formatCount(analytics.summary.sample)}
          detail="Seeded demo rows."
          measured
        />
        <KpiCard
          label="Recorded in demo"
          value={formatCount(analytics.summary.recorded)}
          detail="Created from the events form."
          measured
        />
        <KpiCard
          label="Projects with events"
          value={formatCount(projectIds.size)}
          detail="Distinct projects in the current rows."
          measured
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {UNMEASURED_METRICS.map((metric) => (
          <KpiCard key={metric.label} label={metric.label} value="" detail={metric.note} measured={false} />
        ))}
      </div>
      <AnalyticsCharts series={analytics.series} byName={analytics.byName} />
      <section>
        <h2 className="text-base font-medium">Daily totals</h2>
        <p className="mb-2 text-sm text-muted-foreground">The same numbers as the chart, in a table.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-3 font-medium">Day (UTC)</th>
                <th className="py-2 pr-3 font-medium">Sample data</th>
                <th className="py-2 pr-3 font-medium">Recorded in demo</th>
                <th className="py-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {analytics.series.map((point) => (
                <tr key={point.date} className="border-b">
                  <td className="py-2 pr-3">{point.date}</td>
                  <td className="py-2 pr-3 tabular-nums">{point.sample}</td>
                  <td className="py-2 pr-3 tabular-nums">{point.recorded}</td>
                  <td className="py-2 tabular-nums">{point.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
