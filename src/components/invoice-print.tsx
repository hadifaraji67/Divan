import { formatJalali, formatRial, lineTotals, toFaDigits } from "@/lib/format";
import { invoiceSums, type Invoice, type Seller } from "@/lib/store";

export function InvoicePrint({ invoice, seller }: { invoice: Invoice; seller: Seller }) {
  const sums = invoiceSums(invoice.items);
  return (
    <div id="invoice-print" className="invoice-sheet" dir="rtl">
      <header className="sheet-head">
        <div className="sheet-meta">
          <div>
            شماره فاکتور: <b>{toFaDigits(invoice.number)}</b>
          </div>
          <div>
            تاریخ: <b>{formatJalali(invoice.date)}</b>
          </div>
        </div>
        <h1>پیش فاکتور فروش کالا و خدمات</h1>
        <div className="sheet-logo">
          <div className="mark">P</div>
          <div className="mark-name">{seller.name}</div>
        </div>
      </header>

      <section className="box">
        <div className="box-title">مشخصات فروشنده</div>
        <div className="grid3">
          <div>
            <span>نام شخص حقیقی / حقوقی:</span> {seller.name}
          </div>
          <div>
            <span>شماره اقتصادی:</span> {toFaDigits(seller.economicCode)}
          </div>
          <div>
            <span>شماره ثبت:</span> {toFaDigits(seller.registrationNo)}
          </div>
          <div>
            <span>شناسه ملی:</span> {toFaDigits(seller.nationalId)}
          </div>
          <div>
            <span>کدپستی:</span> {toFaDigits(seller.postalCode)}
          </div>
          <div>
            <span>تلفن:</span> {toFaDigits(seller.phone)}
          </div>
          <div className="span2">
            <span>نشانی:</span> {seller.province} — {seller.city} — {seller.address}
          </div>
          <div>
            <span>کد رهگیری:</span> {toFaDigits(seller.trackingCode)}
          </div>
        </div>
      </section>

      <section className="box">
        <div className="box-title">مشخصات خریدار</div>
        <div className="grid3">
          <div>
            <span>نام شخص حقیقی / حقوقی:</span> {invoice.customer.name || "—"}
          </div>
          <div>
            <span>شماره اقتصادی:</span> {toFaDigits(invoice.customer.economicCode || "—")}
          </div>
          <div>
            <span>شماره ثبت:</span> {toFaDigits(invoice.customer.registrationNo || "—")}
          </div>
          <div>
            <span>شناسه ملی:</span> {toFaDigits(invoice.customer.nationalId || "—")}
          </div>
          <div>
            <span>کدپستی:</span> {toFaDigits(invoice.customer.postalCode || "—")}
          </div>
          <div>
            <span>تلفن:</span> {toFaDigits(invoice.customer.phone || "—")}
          </div>
          <div className="span3">
            <span>نشانی:</span>{" "}
            {[invoice.customer.province, invoice.customer.city, invoice.customer.address]
              .filter(Boolean)
              .join(" — ") || "—"}
          </div>
        </div>
      </section>

      <table className="items">
        <thead>
          <tr>
            <th>ردیف</th>
            <th>کد کالا</th>
            <th>شرح کالا یا خدمات</th>
            <th>تعداد</th>
            <th>واحد</th>
            <th>مبلغ واحد (ریال)</th>
            <th>مبلغ کل (ریال)</th>
            <th>تخفیف (ریال)</th>
            <th>پس از تخفیف</th>
            <th>مالیات و عوارض</th>
            <th>جمع با مالیات</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item, i) => {
            const t = lineTotals(item.qty, item.unitPrice, item.discount);
            return (
              <tr key={item.id}>
                <td>{toFaDigits(i + 1)}</td>
                <td>{toFaDigits(item.code)}</td>
                <td className="name">{item.name}</td>
                <td>{toFaDigits(item.qty)}</td>
                <td>{item.unit}</td>
                <td>{formatRial(item.unitPrice)}</td>
                <td>{formatRial(t.amount)}</td>
                <td>{formatRial(item.discount)}</td>
                <td>{formatRial(t.afterDiscount)}</td>
                <td>{formatRial(t.vat)}</td>
                <td>{formatRial(t.payable)}</td>
              </tr>
            );
          })}
          <tr className="total-row">
            <td colSpan={3}>جمع کل</td>
            <td>{toFaDigits(sums.qty)}</td>
            <td />
            <td />
            <td>{formatRial(sums.amount)}</td>
            <td>{formatRial(sums.discount)}</td>
            <td>{formatRial(sums.afterDiscount)}</td>
            <td>{formatRial(sums.vat)}</td>
            <td>{formatRial(sums.payable)}</td>
          </tr>
        </tbody>
      </table>

      {invoice.notes ? (
        <section className="box">
          <div className="box-title">توضیحات</div>
          <p>{invoice.notes}</p>
        </section>
      ) : null}

      <footer className="sheet-foot">
        <div>مهر و امضای خریدار</div>
        <div>مهر و امضای فروشنده</div>
      </footer>
    </div>
  );
}
