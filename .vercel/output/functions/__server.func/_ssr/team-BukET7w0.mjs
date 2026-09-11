import { a as getRequestHeaders, n as createServerFn } from "./ssr.mjs";
import { n as getSql, t as createServerRpc } from "./db-BW9ndq7k.mjs";
import { t as auth } from "./auth-5s5ZJh8U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team-BukET7w0.js
var requireSession = async () => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });
	if (!session) throw new Error("Unauthorized");
	return session;
};
var bootstrapSignUp_createServerFn_handler = createServerRpc({
	id: "21ef78c7044e168c7877a0794f466144a106030df38a382c4f09070901a95f3b",
	name: "bootstrapSignUp",
	filename: "src/lib/team.ts"
}, (opts) => bootstrapSignUp.__executeServer(opts));
var bootstrapSignUp = createServerFn({ method: "POST" }).validator((d) => d).handler(bootstrapSignUp_createServerFn_handler, async ({ data }) => {
	const rows = await (await getSql())`select count(*)::text as count from "user"`;
	if (Number(rows[0]?.count ?? "0") > 0) throw new Error("already-initialized");
	await auth.api.signUpEmail({ body: data });
});
var hasAnyUser_createServerFn_handler = createServerRpc({
	id: "907ab78e1be178f149ae0558e6b6f3d5606faa0a45bf2db468cab5294efb14e9",
	name: "hasAnyUser",
	filename: "src/lib/team.ts"
}, (opts) => hasAnyUser.__executeServer(opts));
var hasAnyUser = createServerFn({ method: "GET" }).handler(hasAnyUser_createServerFn_handler, async () => {
	const rows = await (await getSql())`select count(*)::text as count from "user"`;
	return Number(rows[0]?.count ?? "0") > 0;
});
var listTeamUsers_createServerFn_handler = createServerRpc({
	id: "961770d50df3b42c6e34d9ed4a20b01099551fc6f1df93045c8f029a5cea3a0c",
	name: "listTeamUsers",
	filename: "src/lib/team.ts"
}, (opts) => listTeamUsers.__executeServer(opts));
var listTeamUsers = createServerFn({ method: "GET" }).handler(listTeamUsers_createServerFn_handler, async () => {
	await requireSession();
	return (await getSql()).query("select id, email, name from \"user\" order by \"createdAt\"");
});
var addTeamUser_createServerFn_handler = createServerRpc({
	id: "9b5f82dbff6f49902cf93a5eb27f572fe110015ab8d30b6c3ef5d39428dc86ac",
	name: "addTeamUser",
	filename: "src/lib/team.ts"
}, (opts) => addTeamUser.__executeServer(opts));
var addTeamUser = createServerFn({ method: "POST" }).validator((d) => d).handler(addTeamUser_createServerFn_handler, async ({ data }) => {
	await requireSession();
	await auth.api.signUpEmail({ body: data });
});
var removeTeamUser_createServerFn_handler = createServerRpc({
	id: "49fcb713bf6c0f929199dddf9a3f8e19db2a0883a6d91ce7cfda89ef1afdae7b",
	name: "removeTeamUser",
	filename: "src/lib/team.ts"
}, (opts) => removeTeamUser.__executeServer(opts));
var removeTeamUser = createServerFn({ method: "POST" }).validator((id) => id).handler(removeTeamUser_createServerFn_handler, async ({ data }) => {
	if ((await requireSession()).user.id === data) throw new Error("cannot-remove-self");
	await (await getSql()).query("delete from \"user\" where id = $1", [data]);
});
//#endregion
export { addTeamUser_createServerFn_handler, bootstrapSignUp_createServerFn_handler, hasAnyUser_createServerFn_handler, listTeamUsers_createServerFn_handler, removeTeamUser_createServerFn_handler };
