import { n as createServerFn } from "./ssr.mjs";
import { n as getSql, t as createServerRpc } from "./db-BW9ndq7k.mjs";
import { o as requireSession } from "./team-BI5u3_TC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-state-sync-KMV7NCfU.js
var ROW_ID = "main";
var loadAppState_createServerFn_handler = createServerRpc({
	id: "0244aaadd752b789a7be94330db00752dfe41b1e8ac0e631be025f7fd436467c",
	name: "loadAppState",
	filename: "src/lib/app-state-sync.ts"
}, (opts) => loadAppState.__executeServer(opts));
var loadAppState = createServerFn({ method: "GET" }).handler(loadAppState_createServerFn_handler, async () => {
	await requireSession();
	return (await (await getSql()).query("select data, updated_at from app_state where id = $1", [ROW_ID]))[0] ?? null;
});
var saveAppState_createServerFn_handler = createServerRpc({
	id: "d1df9cf16fd5c4b3ca8f9cdaea8d91920fd8e94392b197f1239f6369d0b323b0",
	name: "saveAppState",
	filename: "src/lib/app-state-sync.ts"
}, (opts) => saveAppState.__executeServer(opts));
var saveAppState = createServerFn({ method: "POST" }).validator((data) => data).handler(saveAppState_createServerFn_handler, async ({ data }) => {
	await requireSession();
	await (await getSql()).query(`insert into app_state (id, data, updated_at) values ($1, $2, now())
       on conflict (id) do update set data = excluded.data, updated_at = excluded.updated_at`, [ROW_ID, JSON.stringify(data)]);
});
//#endregion
export { loadAppState_createServerFn_handler, saveAppState_createServerFn_handler };
