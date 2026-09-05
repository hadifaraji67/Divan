import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError("لینک نامعتبر است — دوباره از صفحه‌ی ورود درخواست بازیابی بدهید.");
      return;
    }
    setBusy(true);
    try {
      const res = await authClient.resetPassword({ newPassword: password, token });
      if (res.error) throw new Error(res.error.message ?? "reset-failed");
      setDone(true);
      window.setTimeout(() => navigate({ to: "/" }), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "بازنشانی رمز ناموفق بود");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>تنظیم رمز جدید</CardTitle>
            <CardDescription>یه رمز جدید برای حسابتون انتخاب کنید</CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <p className="text-sm text-emerald-600">رمز عوض شد — در حال انتقال به صفحه‌ی ورود...</p>
            ) : (
              <form onSubmit={submit} className="grid gap-3">
                <Field label="رمز عبور جدید">
                  <div className="relative">
                    <Lock className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pr-9"
                      type="password"
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                  </div>
                </Field>
                {error ? <p className="text-sm text-rose-600">{error}</p> : null}
                <Button type="submit" disabled={busy}>
                  {busy ? "..." : "تنظیم رمز جدید"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
