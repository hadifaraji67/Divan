import { a as getRequestHeaders, i as getServerFnById, n as createServerFn, r as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { t as auth } from "./auth-5s5ZJh8U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/team-BI5u3_TC.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var requireSession = async () => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });
	if (!session) throw new Error("Unauthorized");
	return session;
};
/**
* The very first account only — public signup is otherwise disabled (once
* any user exists, this always rejects) so a stranger who finds the URL
* can't create their own login to your business data. Every account after
* the first must come from addTeamUser, which requires an existing session.
*/
var bootstrapSignUp = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("21ef78c7044e168c7877a0794f466144a106030df38a382c4f09070901a95f3b"));
createServerFn({ method: "GET" }).handler(createSsrRpc("907ab78e1be178f149ae0558e6b6f3d5606faa0a45bf2db468cab5294efb14e9"));
var listTeamUsers = createServerFn({ method: "GET" }).handler(createSsrRpc("961770d50df3b42c6e34d9ed4a20b01099551fc6f1df93045c8f029a5cea3a0c"));
var addTeamUser = createServerFn({ method: "POST" }).validator((d) => d).handler(createSsrRpc("9b5f82dbff6f49902cf93a5eb27f572fe110015ab8d30b6c3ef5d39428dc86ac"));
var removeTeamUser = createServerFn({ method: "POST" }).validator((id) => id).handler(createSsrRpc("49fcb713bf6c0f929199dddf9a3f8e19db2a0883a6d91ce7cfda89ef1afdae7b"));
//#endregion
export { removeTeamUser as a, listTeamUsers as i, bootstrapSignUp as n, requireSession as o, createSsrRpc as r, addTeamUser as t };
