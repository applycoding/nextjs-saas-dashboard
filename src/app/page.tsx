import Link from "next/link";

import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const POINTS = [
  {
    title: "Organisations and roles",
    body: "Each workspace has owners, admins, and viewers. Writes stop at the viewer role.",
  },
  {
    title: "Projects and events",
    body: "Create projects and record named events. Seeded rows stay marked as sample data.",
  },
  {
    title: "Charts from the database",
    body: "Overview charts sum the rows in this demo. Retention, revenue, and conversion are not measured.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-10">
      <header className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium tracking-wide">Signalboard</p>
        <Button render={<Link href="/login" />}>Sign in</Button>
      </header>
      <main className="mt-16 grid gap-10">
        <div className="max-w-2xl">
          <p className="text-sm text-muted-foreground">Portfolio demo</p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight text-balance">
            Organisation analytics, with the roles written down.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Signalboard is a workspace for projects and product events. Sign in with a demo account, switch
            organisations, and read charts that are labeled as sample data.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button render={<Link href="/login" />}>Open the demo</Button>
            <Button variant="outline" render={<Link href="/login" />}>
              View demo accounts
            </Button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {POINTS.map((point) => (
            <Card key={point.title}>
              <CardHeader>
                <CardTitle>{point.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{point.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Demo accounts</CardTitle>
            <CardDescription>Shared password: {DEMO_PASSWORD}. These are public demo credentials, not secrets.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.email} className="flex flex-col gap-0.5 border-b pb-2 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium">{account.email}</span>
                  <span className="text-muted-foreground">{account.access}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
      <footer className="mt-16 text-sm text-muted-foreground">
        Built as a portfolio demo by Arpan Bom. It is not a production analytics service.
      </footer>
    </div>
  );
}
