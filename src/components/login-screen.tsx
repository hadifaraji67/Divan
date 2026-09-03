import { useEffect, useState } from "react";
import { Lock, Mail, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { bootstrapSignUp, hasAnyUser } from "@/lib/team";
import { APP_VERSION } from "@/lib/version";

export function LoginScreen() {
  const [checking, setChecking] = useState(true);
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hasAnyUser()
      .then((exists) => setNeedsBootstrap(!exists))
      .catch(() => setNeedsBootstrap(false))
      .finally(() => setChecking(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (needsBootstrap) {
        await bootstrapSignUp({ data: { email, password, name: name || email } });
        await authClient.signIn.email({ email, password });
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message ?? "auth-failed");
      }
    } catch {
      setError(needsBootstrap ? "ثبت‌نام ناموفق بود" : "ایمیل یا رمز عبور اشتباه است");
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return <div className="min-h-dvh bg-background" />;
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
            <CardTitle>{needsBootstrap ? "راه‌اندازی اولیه" : "ورود"}</CardTitle>
            <CardDescription>
              {needsBootstrap
                ? "این اولین‌بار اجرای برنامه‌ست — یه حساب مدیر بساز"
                : "برای دسترسی به اطلاعات وارد شوید"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-3">
              {needsBootstrap ? (
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
              <Field label="رمز عبور">
                <div className="relative">
                  <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pr-9"
                    type="password"
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={needsBootstrap ? "new-password" : "current-password"}
                  />
                </div>
              </Field>
              {error ? <p className="text-sm text-rose-600">{error}</p> : null}
              <Button type="submit" className="mt-1" disabled={busy}>
                {busy ? "..." : needsBootstrap ? "ساخت حساب مدیر" : "ورود"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-xs text-muted-foreground">نسخه {APP_VERSION}</p>
      </div>
    </div>
  );
}
