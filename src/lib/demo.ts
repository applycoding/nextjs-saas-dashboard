export const DEMO_PASSWORD = "demo-password";

export const DEMO_ACCOUNTS = [
  {
    email: "mira@signalboard.dev",
    name: "Mira Chen",
    access: "Owner at Northline, admin at Harbor",
  },
  {
    email: "owen@signalboard.dev",
    name: "Owen Shah",
    access: "Admin at Northline",
  },
  {
    email: "priya@signalboard.dev",
    name: "Priya Nair",
    access: "Viewer at Northline, owner at Harbor",
  },
] as const;

export function githubLoginConfigured(env: {
  AUTH_GITHUB_ID?: string;
  AUTH_GITHUB_SECRET?: string;
}): boolean {
  return Boolean(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET);
}
