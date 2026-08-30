import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookUser,
  FileText,
  History,
  Package,
  Receipt,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { View } from "@/components/invoice-app";

type HomeCard = {
  view: View;
  title: string;
  description: string;
  icon: LucideIcon;
};

const cards: HomeCard[] = [
  {
    view: "quote",
    title: "پیش‌فاکتور جدید",
    description: "پیشنهاد قیمت برای مشتری",
    icon: FileText,
  },
  {
    view: "invoice",
    title: "فاکتور جدید",
    description: "صدور فاکتور فروش نهایی",
    icon: Receipt,
  },
  {
    view: "history",
    title: "سوابق اسناد",
    description: "پیش‌فاکتورها و فاکتورهای قبلی",
    icon: History,
  },
  {
    view: "products",
    title: "کالاها",
    description: "فهرست کالاها و خدمات",
    icon: Package,
  },
  {
    view: "customers",
    title: "مشتریان",
    description: "دفتر مشخصات مشتریان",
    icon: Users,
  },
  {
    view: "ledger",
    title: "بدهی و بستانکاری",
    description: "وضعیت حساب هر مشتری",
    icon: BookUser,
  },
  {
    view: "finance",
    title: "هزینه‌ها و درآمدها",
    description: "ثبت تراکنش‌های نقدی",
    icon: Wallet,
  },
  {
    view: "reports",
    title: "گزارش‌ها",
    description: "نمودار ماهانه و سالانه",
    icon: BarChart3,
  },
  {
    view: "settings",
    title: "مشخصات فروشنده",
    description: "اطلاعاتی که روی فاکتور چاپ می‌شود",
    icon: Settings,
  },
];

export function HomeScreen({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <Card
          key={c.view}
          role="button"
          tabIndex={0}
          onClick={() => onNavigate(c.view)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onNavigate(c.view);
          }}
          className="cursor-pointer transition active:scale-[0.98]"
        >
          <CardContent className="flex flex-col items-start gap-2 p-4">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <c.icon className="size-5" />
            </div>
            <p className="font-medium leading-snug">{c.title}</p>
            <p className="text-xs text-muted-foreground">{c.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
