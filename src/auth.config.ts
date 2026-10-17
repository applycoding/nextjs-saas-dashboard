import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

import { githubLoginConfigured } from "@/lib/demo";
import { isProtectedPath } from "@/lib/routes";

const githubEnabled = githubLoginConfigured({
  AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
});

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: githubEnabled ? [GitHub] : [],
  callbacks: {
    authorized({ auth, request }) {
      if (isProtectedPath(request.nextUrl.pathname)) return Boolean(auth?.user);
      return true;
    },
  },
} satisfies NextAuthConfig;
