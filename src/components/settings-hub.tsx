import { Building2, FileCog, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type SettingsView = "business" | "invoice" | "software";

const items: { view: SettingsView; title: string; description: string; icon: typeof Building2 }[] = [
  {
    view: "business",
    title: "نام کسب‌وکار",
    description: "مشخصات فروشنده که روی سند چاپ می‌شود",
    icon: Building2,
  },
  {
    view: "invoice",
    title: "تنظیمات فاکتور",
    description: "اطلاعات پیش‌فرض چاپ فاکتور و پیش‌فاکتور",
    icon: FileCog,
  },
  {
    view: "software",
    title: "تنظیمات نرم‌افزار",
    description: "تنظیمات عمومی برنامه",
    icon: SlidersHorizontal,
  },
];

export function SettingsHub({ onOpen }: { onOpen: (view: SettingsView) => void }) {
  return (
    <div className="grid gap-3">
      {items.map((it) => (
        <Card key={it.view} role="button" tabIndex={0} className="cursor-pointer" onClick={() => onOpen(it.view)}>
          <CardContent className="flex items-center gap-3 p-4">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
              <it.icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="font-medium">{it.title}</p>
              <p className="text-xs text-muted-foreground">{it.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
