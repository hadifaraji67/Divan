import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { requireSession } from "@/lib/team";

const ROW_ID = "main";

export const loadAppState = createServerFn({ method: "GET" }).handler(async () => {
  await requireSession();
  const sql = await getSql();
  const rows = await sql.query<{ data: unknown; updated_at: string }>(
    "select data, updated_at from app_state where id = $1",
    [ROW_ID],
  );
  return rows[0] ?? null;
});

export const saveAppState = createServerFn({ method: "POST" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    await requireSession();
    const sql = await getSql();
    await sql.query(
      `insert into app_state (id, data, updated_at) values ($1, $2, now())
       on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at`,
      [ROW_ID, JSON.stringify(data)],
    );
  });
