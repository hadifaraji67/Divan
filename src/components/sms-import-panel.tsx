import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Inbox, Plus, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRial } from "@/lib/format";
import { looksLikeBankSms, parseBankSms, type ParsedSms } from "@/lib/sms-parse";
import SmsReader from "@/lib/sms-reader";
import { useInvoiceStore } from "@/lib/store";

type Candidate = ParsedSms & { id: string; customerId: string };

export function SmsImportPanel() {
  const isNative = Capacitor.isNativePlatform();
  const customers = useInvoiceStore((s) => s.customers);
  const addPayment = useInvoiceStore((s) => s.addPayment);
  const smsBankSenders = useInvoiceStore((s) => s.smsBankSenders);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  async function loadMessages() {
    setLoading(true);
    try {
      const perm = await SmsReader.requestSmsPermission();
      if (!perm.granted) {
        toast.error("اجازه‌ی خواندن پیامک داده نشد");
        return;
      }
      const { messages } = await SmsReader.readMessages({ limit: 300 });
      const parsed: Candidate[] = [];
      for (const msg of messages) {
        if (!looksLikeBankSms(msg.address, msg.body, smsBankSenders)) continue;
        const p = parseBankSms(msg.body, msg.date);
        if (p) parsed.push({ ...p, id: `${msg.date}-${p.amount}`, customerId: customers[0]?.id ?? "" });
      }
      setCandidates(parsed);
      if (parsed.length === 0) toast.error("پیامک بانکی قابل‌تشخیصی پیدا نشد");
    } catch (e) {
      toast.error("خواندن پیامک‌ها با خطا مواجه شد");
    } finally {
      setLoading(false);
    }
  }

  function setCandidateParty(id: string, customerId: string) {
    setCandidates((cs) => cs.map((c) => (c.id === id ? { ...c, customerId } : c)));
  }

  function addToLedger(c: Candidate) {
    if (!c.customerId) {
      toast.error("یک طرف‌حساب انتخاب کنید");
      return;
    }
    addPayment({
      customerId: c.customerId,
      amount: c.amount,
      direction: c.direction,
      note: "از پیامک بانکی",
      date: new Date(c.date).toISOString(),
    });
    setCandidates((cs) => cs.filter((x) => x.id !== c.id));
    toast.success("ثبت شد");
  }

  if (!isNative) {
    return (
      <Card>
        <CardContent className="grid gap-3 p-6 text-center">
          <Smartphone className="mx-auto size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            این بخش فقط داخل نسخه‌ی نصب‌شده‌ی اندروید کار می‌کند، نه در مرورگر — چون خواندن پیامک نیاز به دسترسی
            سیستم‌عامل دارد.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {smsBankSenders.length === 0 ? (
        <p className="rounded-xl bg-muted/70 p-3 text-xs text-muted-foreground">
          هنوز شماره‌ی بانکی ثبت نکرده‌اید — از تنظیمات ← تنظیمات نرم‌افزار شماره‌ی پیامک‌های بانکتان را اضافه کنید
          تا فقط همون‌ها خونده بشه. فعلاً با یک حدس کلی‌تر جست‌وجو می‌کنیم.
        </p>
      ) : null}
      <Button onClick={loadMessages} disabled={loading}>
        <Inbox className="size-4" />
        {loading ? "در حال خواندن..." : "خواندن پیامک‌های بانکی"}
      </Button>

      {candidates.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>موارد پیشنهادی</CardTitle>
            <CardDescription>طرف‌حساب را انتخاب کنید و به دفتر اضافه کنید</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {candidates.map((c) => (
              <div key={c.id} className="grid gap-2 rounded-xl bg-muted/70 p-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      c.direction === "receipt" ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {c.direction === "receipt" ? "+" : "−"}
                    {formatRial(c.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(c.date).toLocaleDateString("fa-IR")}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.raw}</p>
                <div className="flex gap-2">
                  <select
                    className="h-9 flex-1 rounded-md border border-input bg-card px-2 text-sm"
                    value={c.customerId}
                    onChange={(e) => setCandidateParty(c.id, e.target.value)}
                  >
                    {customers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" onClick={() => addToLedger(c)}>
                    <Plus className="size-4" />
                    افزودن
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
