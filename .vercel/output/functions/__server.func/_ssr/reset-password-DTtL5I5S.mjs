import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as CardHeader, c as Input, i as CardDescription, l as authClient, n as Card, o as CardTitle, r as CardContent, s as Field, t as Button } from "./auth-client-CfxMpXhz.mjs";
import { C as Lock } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-DTtL5I5S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ResetPasswordPage() {
	const navigate = useNavigate();
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [done, setDone] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(e) {
		e.preventDefault();
		setError("");
		const token = new URLSearchParams(window.location.search).get("token");
		if (!token) {
			setError("پیوند نامعتبر است — لطفاً مجدداً از صفحه‌ی ورود، درخواست بازیابی رمز عبور را ثبت کنید.");
			return;
		}
		setBusy(true);
		try {
			const res = await authClient.resetPassword({
				newPassword: password,
				token
			});
			if (res.error) throw new Error(res.error.message ?? "reset-failed");
			setDone(true);
			window.setTimeout(() => navigate({ to: "/" }), 1500);
		} catch (err) {
			setError(err instanceof Error ? err.message : "بازنشانی رمز ناموفق بود");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "w-full max-w-sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "تنظیم رمز جدید" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "رمز عبور جدیدی برای حساب کاربری خود انتخاب کنید" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-emerald-600",
				children: "رمز عبور با موفقیت تغییر یافت — در حال انتقال به صفحه‌ی ورود..."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "رمز عبور جدید",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "pr-9",
								type: "password",
								dir: "ltr",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								autoComplete: "new-password"
							})]
						})
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-rose-600",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy,
						children: busy ? "..." : "تنظیم رمز جدید"
					})
				]
			}) })] })
		})
	});
}
//#endregion
export { ResetPasswordPage as component };
