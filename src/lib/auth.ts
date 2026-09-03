import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";

// Real server-backed accounts, replacing the old client-only localStorage
// check. Needs DATABASE_URL (Neon) and BETTER_AUTH_SECRET set as Vercel
// environment variables — see the chat message this shipped with for how
// to generate/set them. Schema: migrations/0001_auth.sql.
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL: "https://divan-one.vercel.app",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
  plugins: [tanstackStartCookies()],
});
