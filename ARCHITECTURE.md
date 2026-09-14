# 🏛 معماری پروژه دیوان

**نسخه:** ۳.۵.۰

---

## 🎯 نمای کلی

دیوان یک نرم‌افزار حسابداری و مدیریت کسب‌وکار است.

### محیط‌های اجرا

- **PWA:** divan-one.vercel.app
- **APK:** از GitHub Releases
- **Local Dev:** localhost:8080

### فناوری‌ها

- React 19 + TypeScript 5.7
- Vite 8 + TanStack Router
- TailwindCSS 4
- localStorage برای ذخیره‌سازی
- Capacitor 8 برای APK

---

## 📁 ساختار پوشه‌ها (هدف نهایی)

```
src/
├── App.tsx
├── components/
│   ├── layout/       (Sidebar, Header, BottomNav)
│   ├── modules/      (Contacts, Products, Invoices, ...)
│   ├── settings/     (General, Store, Fiscal, Update)
│   ├── reports/      (ProfitLoss, BalanceSheet, ...)
│   ├── hubs/         (SettingsHub, ReportsHub)
│   ├── shared/       (ComingSoon, LocationSelector, ...)
│   └── ui/           (button, card, ...)
├── lib/              (storage, jalali, invoice-logic, ...)
├── types/            (models.ts)
└── routes/           (TanStack Router)
```

---

## 🧱 لایه‌بندی

1. **UI** (components/) — فقط نمایش
2. **Hooks** (lib/use-*) — منطق UI
3. **Business** (lib/*.ts) — محاسبات
4. **Storage** (lib/storage.ts) — localStorage
5. **Types** (types/) — قرارداد داده

**قواعد:**
- UI → Business → Storage (هیچ‌وقت UI مستقیم به Storage)
- Types در همه لایه‌ها آزاد

---

## 📐 قواعد نام‌گذاری

| نوع | قاعده | مثال |
|---|---|---|
| کامپوننت | PascalCase | ContactsModule.tsx |
| Hook | camelCase با use | use-swipe.ts |
| Utility | camelCase | storage.ts |
| Type | PascalCase | interface Contact |
| متغیر | camelCase | userName |
| ثابت | UPPER_SNAKE | MAX_COUNT |

---

## 🔄 State Management

**دو مکانیزم:**

1. **Context سراسری** — theme-context.tsx با useSettings()
2. **State محلی** — useState در هر ماژول

Redux و MobX استفاده نمی‌کنیم (بیش از حد).

---

## 💾 ذخیره‌سازی

**localStorage با prefix `divan_`:**

| کلید | محتوا |
|---|---|
| divan_contacts | اشخاص |
| divan_products | کالاها |
| divan_invoices | فاکتورها |
| divan_payments | پرداخت‌ها |
| divan_cheques | چک‌ها |
| divan_installments | اقساط |
| divan_cashbox | صندوق |
| divan_settings_v1 | تنظیمات |

### API

```tsx
import { loadData, saveData, genId } from '../lib/storage';

const items = loadData<Contact[]>('contacts', []);
saveData('contacts', items);
```

---

## 🗺 مسیریابی و منو

### افزودن صفحه جدید

1. ViewKey را در Sidebar.tsx اضافه کن
2. VIEW_TITLES در App.tsx
3. case در App.tsx
4. menuGroups در Sidebar.tsx

### گروه‌ها بر اساس گردش کار

| گروه | هدف | نقش آینده |
|---|---|---|
| فروش | مشتری، فاکتور | فروشنده |
| خرید | تامین‌کننده | انباردار |
| انبار | موجودی | انباردار |
| مالی | اسناد | حسابدار |
| گزارش‌ها | تحلیل | مدیر |
| منابع انسانی | پرسنل | مدیر |
| پروژه‌ها | تولید | مدیر پروژه |
| سیستم | تنظیمات | مدیر سیستم |

---

## 🖨 سیستم چاپ

### قالب‌ها

| قالب | کاربرد |
|---|---|
| رسمی مالیاتی | دارایی |
| غیررسمی | عادی |
| حرارتی ۸۰/۵۸ | رسید |

### تنظیمات (در theme-context.tsx)

- printPaper: A4 / A5 / thermal80 / thermal58
- printMode: formal / informal
- printLogo, printHeaderText, printFooterText
- showStamp, showQR, showDiscount

---

## 🔄 سیستم آپدیت

**دو مکانیزم:**
1. بنر خودکار — هنگام باز کردن اپ
2. دستی — تنظیمات → بروزرسانی

### چرخه انتشار

```bash
./release.sh v3.5.0
```

خودکار:
1. package.json آپدیت
2. کامیت + تگ + push
3. GitHub Actions → APK
4. Release + APK
5. Vercel آپدیت
6. سیستم آپدیت می‌بیند

---

## ✅ چک‌لیست قابلیت جدید

- [ ] کدام گروه؟ (فروش/خرید/انبار/مالی/...)
- [ ] کدام ViewKey؟
- [ ] به Context نیاز دارد؟
- [ ] داده ذخیره می‌کند؟ (کلید divan_*)
- [ ] به گزارش‌ها اضافه می‌شود؟

### مراحل

1. تایپ در types/models.ts
2. منطق در lib/
3. کامپوننت در components/modules/
4. ViewKey + VIEW_TITLES + case + menuGroups
5. تست با npm run dev
6. Release با ./release.sh

---

## 📌 اصول مهم

1. هیچ‌وقت دو کامپوننت با کاربرد یکسان نساز
2. همیشه npx tsc --noEmit قبل از commit
3. هر قابلیت جدید → یک ViewKey
4. همه چیز در localStorage
5. کامنت فارسی برای منطق تجاری
6. قبل از Release → node scripts/audit.mjs

---

**این سند زنده است — با هر تغییر معماری، به‌روزرسانی شود.**
