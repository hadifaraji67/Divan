import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";

async function requireSession() {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  if (!session) throw new Error("Unauthorized");
  return session;
}

/**
 * The very first account only — public signup is otherwise disabled (once
 * any user exists, this always rejects) so a stranger who finds the URL
 * can't create their own login to your business data. Every account after
 * the first must come from addTeamUser, which requires an existing session.
 */
export const bootstrapSignUp = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string; name: string }) => d)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const rows = await sql<{ count: string }>`select count(*)::text as count from "user"`;
    if (Number(rows[0]?.count ?? "0") > 0) throw new Error("already-initialized");
    await auth.api.signUpEmail({ body: data });
  });

export const hasAnyUser = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<{ count: string }>`select count(*)::text as count from "user"`;
  return Number(rows[0]?.count ?? "0") > 0;
});

export const listTeamUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireSession();
  const sql = await getSql();
  return sql.query<{ id: string; email: string; name: string }>(
    'select id, email, name from "user" order by "createdAt"',
  );
});

export const addTeamUser = createServerFn({ method: "POST" })
  .validator((d: { email: string; password: string; name: string }) => d)
  .handler(async ({ data }) => {
    await requireSession();
    await auth.api.signUpEmail({ body: data });
  });

export const removeTeamUser = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data }) => {
    const session = await requireSession();
    if (session.user.id === data) throw new Error("cannot-remove-self");
    const sql = await getSql();
    await sql.query('delete from "user" where id = $1', [data]);
  });
