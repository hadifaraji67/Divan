import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatJalali, toFaDigits } from "@/lib/format";
import { productStock, useInvoiceStore, type StockDirection } from "@/lib/store";

export function InventoryPanel() {
  const products = useInvoiceStore((s) => s.products);
  const movements = useInvoiceStore((s) => s.stockMovements);
  const addStockMovement = useInvoiceStore((s) => s.addStockMovement);
  const removeStockMovement = useInvoiceStore((s) => s.removeStockMovement);

  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [direction, setDirection] = useState<StockDirection>("in");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  const stockByProduct = useMemo(
    () => products.map((p) => ({ product: p, stock: productStock(movements, p.id) })),
    [products, movements],
  );

  function save() {
    if (!productId) {
      toast.error("ابتدا یک کالا اضافه کنید");
      return;
    }
    const q = Number(qty);
    if (!q || q <= 0) {
      toast.error("تعداد را وارد کنید");
      return;
    }
    addStockMovement({ productId, direction, qty: q, note, date: new Date().toISOString() });
    toast.success(direction === "in" ? "ورود کالا ثبت شد" : "خروج کالا ثبت شد");
    setQty("");
    setNote("");
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>موجودی انبار</CardTitle>
          <CardDescription>موجودی فعلی هر کالا</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2">
          {stockByProduct.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">ابتدا از بخش «کالا و خدمات» کالا اضافه کنید.</p>
          ) : (
            stockByProduct.map(({ product, stock }) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl bg-muted/70 p-3">
                <span className="font-medium">{product.name}</span>
                <span className={`tabular-nums text-sm font-semibold ${stock < 0 ? "text-rose-600" : ""}`}>
                  {toFaDigits(stock)} {product.unit}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {products.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>ثبت ورود / خروج کالا</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex gap-2">
              <Button
                variant={direction === "in" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setDirection("in")}
              >
                <ArrowDownCircle className="size-4" />
                ورود کالا
              </Button>
              <Button
                variant={direction === "out" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setDirection("out")}
              >
                <ArrowUpCircle className="size-4" />
                خروج کالا
              </Button>
            </div>
            <Field label="کالا">
              <select
                className="flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="تعداد">
              <Input inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} placeholder={toFaDigits(0)} />
            </Field>
            <Field label="توضیحات (اختیاری)">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <Button onClick={save}>ثبت</Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>تاریخچه</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {movements.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">تراکنش انباری ثبت نشده.</p>
          ) : (
            movements.map((m) => {
              const product = products.find((p) => p.id === m.productId);
              return (
                <div key={m.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted/70 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {product?.name ?? "کالای حذف‌شده"}
                      {m.note ? ` — ${m.note}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatJalali(m.date)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`tabular-nums text-sm font-medium ${m.direction === "in" ? "text-emerald-600" : "text-rose-600"}`}>
                      {m.direction === "in" ? "+" : "−"}
                      {toFaDigits(m.qty)}
                    </span>
                    <Button variant="ghost" size="icon" aria-label="حذف" onClick={() => removeStockMovement(m.id)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
