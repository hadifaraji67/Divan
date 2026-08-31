import { useState } from "react";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/field";
import { Input } from "@/components/ui/input";
import { useInvoiceStore } from "@/lib/store";

export function LoginScreen() {
  const login = useInvoiceStore((s) => s.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const ok = login(username, password);
    setError(!ok);
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
            <CardTitle>ورود</CardTitle>
            <CardDescription>برای دسترسی به اطلاعات وارد شوید</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid gap-3">
              <Field label="نام کاربری">
                <div className="relative">
                  <User className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pr-9"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              </Field>
              {error ? <p className="text-sm text-rose-600">نام کاربری یا رمز عبور اشتباه است.</p> : null}
              <Button type="submit" className="mt-1">
                ورود
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
