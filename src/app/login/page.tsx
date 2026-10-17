import Link from "next/link";

import { LoginForm } from "@/components/login-form";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, githubLoginConfigured } from "@/lib/demo";
import { githubSignInAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const githubEnabled = githubLoginConfigured({
    AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
    AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-6 text-sm text-muted-foreground">
        Signalboard
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Use a demo account, or GitHub when it is configured.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {params.error ? (
            <p role="alert" className="text-sm text-destructive">
              {params.error}
            </p>
          ) : null}
          <LoginForm />
          <div className="grid gap-2">
            {githubEnabled ? (
              <form action={githubSignInAction}>
                <Button type="submit" variant="outline" className="w-full">
                  Continue with GitHub
                </Button>
              </form>
            ) : (
              <div className="grid gap-1">
                <Button type="button" variant="outline" disabled aria-describedby="github-help">
                  Continue with GitHub
                </Button>
                <p id="github-help" className="text-xs text-muted-foreground">
                  GitHub login is implemented and stays off until AUTH_GITHUB_ID and AUTH_GITHUB_SECRET are set. This
                  demo ships with no API keys.
                </p>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">Demo password</p>
            <p className="text-sm text-muted-foreground">{DEMO_PASSWORD}</p>
            <ul className="mt-2 grid gap-1 text-sm text-muted-foreground">
              {DEMO_ACCOUNTS.map((account) => (
                <li key={account.email}>
                  {account.email} — {account.access}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
