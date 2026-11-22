/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ASSETS: Fetcher;
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL?: string;
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
  }
}

export {};
