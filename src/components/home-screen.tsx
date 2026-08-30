import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
  BookUser,
  FileMinus2,
  FilePlus2,
  Package,
  PackageSearch,
  Settings,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRial } from "@/lib/format";
import { invoiceSums, useInvoiceStore } from "@/lib/store";
import type { View } from "@/components/invoice-app";

type MenuItem = {
  view: View;
  title: string;
  icon: LucideIcon;
  bg: string;
  fg: string;
};

const items: MenuItem[] = [
  { view: "parties", title: "طرف حساب‌ها", icon: BookUser, bg: "bg-[#1b3654]", fg: "text-[#F3EBDA]" },
  { view: "sale-invoice", title: "فاکتور فروش", icon: FilePlus2, bg: "bg-[#f4ead0]", fg: "text-[#1b3654]" },
  { view: "purchase-invoice", title: "فاکتور خرید", icon: ShoppingCart, bg: "bg-[#1b3654]", fg: "text-[#F3EBDA]" },
  { view: "sale-quote", title: "پیش‌فاکتور فروش", icon: FileMinus2, bg: "bg-[#f4ead0]", fg: "text-[#1b3654]" },
  { view: "purchase-quote", title: "پیش‌فاکتور خرید", icon: FileMinus2, bg: "bg-[#1b3654]", fg: "text-[#F3EBDA]" },
  { view: "payments", title: "دریافت و پرداخت", icon: Wallet, bg: "bg-[#f4ead0]", fg: "text-[#1b3654]" },
  { view: "inventory", title: "ورود و خروج کالا", icon: PackageSearch, bg: "bg-[#1b3654]", fg: "text-[#F3EBDA]" },
  { view: "products", title: "کالا و خدمات", icon: Package, bg: "bg-[#f4ead0]", fg: "text-[#1b3654]" },
  { view: "reports", title: "گزارش‌ها", icon: BarChart3, bg: "bg-[#1b3654]", fg: "text-[#F3EBDA]" },
  { view: "settings", title: "تنظیمات", icon: Settings, bg: "bg-[#f4ead0]", fg: "text-[#1b3654]" },
];

export function HomeScreen({ onNavigate }: { onNavigate: (view: View) => void }) {
  const invoices = useInvoiceStore((s) => s.invoices);
  const payments = useInvoiceStore((s) => s.payments);

  const stats = useMemo(() => {
    let sale = 0;
    let purchase = 0;
    for (const inv of invoices) {
      if (inv.kind !== "invoice") continue;
      const total = invoiceSums(inv.items).payable;
      if (inv.direction === "sale") sale += total;
      else purchase += total;
    }
    let receipt = 0;
    let payment = 0;
    for (const p of payments) {
      if (p.direction === "receipt") receipt += p.amount;
      else payment += p.amount;
    }
    return { sale, purchase, receipt, payment };
  }, [invoices, payments]);

  return (
    <div className="grid gap-5">
      <Card>
        <CardContent className="grid grid-cols-2 gap-3 p-4">
          <StatRow icon={TrendingUp} color="text-emerald-600" label="فروش" value={stats.sale} />
          <StatRow icon={TrendingDown} color="text-violet-600" label="خرید" value={stats.purchase} />
          <StatRow icon={ArrowDownCircle} color="text-rose-600" label="پرداختی" value={stats.payment} />
          <StatRow icon={ArrowUpCircle} color="text-emerald-600" label="دریافتی" value={stats.receipt} />
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">امور تجاری</p>
        <div className="grid grid-cols-3 gap-4">
          {items.map((it) => (
            <button
              key={it.view}
              onClick={() => onNavigate(it.view)}
              className="flex flex-col items-center gap-2 text-center"
            >
              <span className={`grid size-16 place-items-center rounded-full ${it.bg} ${it.fg}`}>
                <it.icon className="size-6" />
              </span>
              <span className="text-xs leading-tight text-foreground">{it.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatRow({
  icon: Icon,
  color,
  label,
  value,
}: {
  icon: LucideIcon;
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`size-5 ${color}`} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold tabular-nums">{formatRial(value)}</p>
      </div>
    </div>
  );
}
