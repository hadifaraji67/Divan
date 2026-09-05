import { useState } from "react";
import { Lock, Mail, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { bootstrapSignUp } from "@/lib/team";
import { APP_VERSION } from "@/lib/version";

export function LoginScreen() {
  const [mode, setMode] = useState<"login" | "bootstrap" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        console.error("[login] sign-in failed:", res.error);
        setError(res.error.message ?? "ایمیل یا رمز عبور اشتباه است");
      }
    } catch (err) {
      console.error("[login] sign-in threw:", err);
      setError(err instanceof Error ? err.message : "ورود ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  async function submitBootstrap(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await bootstrapSignUp({ data: { email, password, name: name || email } });
      setNotice("حساب مدیر ساخته شد — حالا با همین ایمیل و رمز وارد شوید.");
      setMode("login");
      setPassword("");
    } catch (err) {
      console.error("[bootstrap] sign-up threw:", err);
      const message = err instanceof Error ? err.message : "";
      if (message === "already-initialized") {
        setError("یه حساب مدیر از قبل ساخته شده — از لینک زیر وارد شوید، یا اگه رمز یادتون نیست باید از پنل Neon حذفش کنید.");
        setMode("login");
      } else {
        setError(message || "ثبت‌نام ناموفق بود");
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitForgot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await authClient.forgetPassword({ email, redirectTo: "/reset-password" });
      setNotice("اگر این ایمیل ثبت شده باشد، لینک بازیابی براش ارسال شد.");
      setMode("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال لینک ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-16 place-items-center rounded-2xl bg-[#1b3654] text-2xl font-bold text-[#C9A24B]">
            د
          </div>
          <h1 className="text-xl font-semibold">دیوان</h1>
          <p className="text-sm text-muted-foreground">سامانه جامع حسابداری</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "bootstrap" ? "راه‌اندازی اولیه" : mode === "forgot" ? "بازیابی رمز" : "ورود"}
            </CardTitle>
            <CardDescription>
              {mode === "bootstrap"
                ? "یه حساب مدیر بساز — فقط برای اولین‌بار لازمه"
                : mode === "forgot"
                  ? "ایمیل حسابتون رو وارد کنید تا لینک بازیابی ارسال بشه"
                  : "برای دسترسی به اطلاعات وارد شوید"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={mode === "bootstrap" ? submitBootstrap : mode === "forgot" ? submitForgot : submitLogin}
              className="grid gap-3"
            >
              {mode === "bootstrap" ? (
                <Field label="نام">
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pr-9" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </Field>
              ) : null}
              <Field label="ایمیل">
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pr-9"
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </Field>
              {mode === "forgot" ? null : (
                <Field label="رمز عبور">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pr-9"
                      type="password"
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={mode === "bootstrap" ? "new-password" : "current-password"}
                    />
                  </div>
                </Field>
              )}
              {notice ? <p className="text-sm text-emerald-600">{notice}</p> : null}
              {error ? <p className="break-words text-sm text-rose-600">{error}</p> : null}
              <Button type="submit" className="mt-1" disabled={busy}>
                {busy ? "..." : mode === "bootstrap" ? "ساخت حساب مدیر" : mode === "forgot" ? "ارسال لینک بازیابی" : "ورود"}
              </Button>
            </form>
            {mode === "login" ? (
              <button
                type="button"
                className="mt-3 w-full text-center text-xs text-muted-foreground underline"
                onClick={() => {
                  setError("");
                  setNotice("");
                  setMode("forgot");
                }}
              >
                رمز رو فراموش کردم
              </button>
            ) : null}
            <button
              type="button"
              className="mt-3 w-full text-center text-xs text-muted-foreground underline"
              onClick={() => {
                setError("");
                setNotice("");
                setMode(mode === "login" ? "bootstrap" : "login");
              }}
            >
              {mode === "login" ? "اولین اجراست؟ ساخت حساب مدیر" : "قبلاً حساب ساخته شده؟ ورود"}
            </button>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">نسخه {APP_VERSION}</p>
      </div>
    </div>
  );
}
