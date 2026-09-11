import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as createServerFn } from "./ssr.mjs";
import { a as removeTeamUser, i as listTeamUsers, n as bootstrapSignUp, r as createSsrRpc, t as addTeamUser } from "./team-BI5u3_TC.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { a as CardHeader, c as Input, d as signOut, f as useSession, i as CardDescription, l as authClient, n as Card, o as CardTitle, r as CardContent, s as Field, t as Button, u as cn } from "./auth-client-CfxMpXhz.mjs";
import { A as CloudOff, C as Lock, D as FileCog, E as FileMinus2, F as BookUser, I as ArrowRight, M as CircleArrowDown, N as ChartColumn, O as FileCheck2, P as Building2, S as LogOut, T as FilePlus2, _ as Pencil, b as Menu, c as Trash2, d as ShoppingCart, f as Settings, g as Plus, h as Printer, i as User, j as CircleArrowUp, k as EllipsisVertical, l as Smartphone, m as RefreshCw, n as Wallet, o as TrendingUp, p as Save, r as Users, s as TrendingDown, t as X, u as SlidersHorizontal, v as Package, w as Inbox, x as Mail, y as PackageSearch } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as Capacitor, r as registerPlugin, t as App } from "../_libs/capacitor__app+capacitor__core.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as Bar, c as Legend, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DV-Pkk_p.js
var routes_DV_Pkk_p_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
var DialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
	ref,
	className: cn("fixed inset-0 z-50 bg-foreground/40", className),
	...props
}));
DialogOverlay.displayName = DialogOverlay$1.displayName;
var DialogContent = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
	ref,
	className: cn("fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 gap-4 rounded-2xl bg-card p-5 text-card-foreground shadow-[var(--shadow-border-hover)]", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
		className: "absolute start-4 top-4 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: "بستن"
		})]
	})]
})] }));
DialogContent.displayName = DialogContent$1.displayName;
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 text-start pe-8", className),
		...props
	});
}
var DialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold leading-snug", className),
	...props
}));
DialogTitle.displayName = DialogTitle$1.displayName;
var DialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
DialogDescription.displayName = DialogDescription$1.displayName;
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-[var(--shadow-border)] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className),
		ref,
		...props
	});
});
Textarea.displayName = "Textarea";
var badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
	variants: { variant: {
		default: "bg-primary text-primary-foreground",
		secondary: "bg-secondary text-secondary-foreground",
		outline: "border border-border text-foreground"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
var tree = {
	"آذربایجان شرقی": {
		"آذرشهر": [
			"آذرشهر",
			"تیمورلو",
			"ممقان",
			"گوگان"
		],
		"اسکو": [
			"اسکو",
			"ایلخچی",
			"سهند"
		],
		"اهر": ["اهر"],
		"بستان آباد": ["کردکندی"],
		"بناب": ["بناب"],
		"تبریز": [
			"اسفهلان",
			"باسمنج",
			"تبریز",
			"خسروشاه",
			"سردرود",
			"لاهیجان"
		],
		"جلفا": ["جلفا", "هادیشهر"],
		"خداآفرین": [
			"خمارلو",
			"عاشقلو",
			"لاریجان"
		],
		"سراب": [
			"دوزدوزان",
			"سراب",
			"شربیان",
			"مهربان"
		],
		"شبستر": [
			"تسوج",
			"خامنه",
			"داریان",
			"سیس",
			"شبستر",
			"شرفخانه",
			"شندآباد",
			"صوفیان",
			"علیشاه",
			"وایقان"
		],
		"لیلان": ["لیلان"],
		"مراغه": ["خداجوخراجو", "مراغه"],
		"مرند": [
			"زنوز",
			"مرند",
			"کشکسرای",
			"یامچی"
		],
		"ملکان": ["ملکان"],
		"میانه": [
			"آقکند",
			"اچاچی",
			"ترک",
			"ترکمانچای",
			"میانه"
		],
		"هریس": [
			"اربطان",
			"بخشایش",
			"خواجه",
			"زرنق",
			"هریس",
			"کلوانق"
		],
		"هشترود": ["نظرکهریزی", "هشترود"],
		"هوراند": ["هوراند"],
		"ورزقان": ["خاروانا", "ورزقان"],
		"کلیبر": ["کلیبر"]
	},
	"آذربایجان غربی": {
		"ارومیه": [
			"ارومیه",
			"سرو",
			"سیلوانه",
			"قوشچی",
			"نوشین"
		],
		"اشنویه": ["اشنویه", "نالوس"],
		"باروق": ["باروق"],
		"بوکان": ["بوکان", "سیمینه"],
		"تکاب": ["تکاب"],
		"خوی": [
			"ایواوغلی",
			"خوی",
			"زرآباد",
			"فیرورق",
			"قطور"
		],
		"سردشت": [
			"ربط",
			"سردشت",
			"نلاس"
		],
		"سلماس": ["سلماس"],
		"شاهین دژ": ["محمودآباد", "کشاورز"],
		"شوط": [
			"شوط",
			"مرگنلر",
			"یولاگلدی"
		],
		"ماکو": ["بازرگان", "ماکو"],
		"مهاباد": ["خلیفان", "مهاباد"],
		"میاندوآب": ["بکتاش", "میاندوآب"],
		"میرآباد": ["میرآباد"],
		"نقده": ["محمدیار", "نقده"],
		"پلدشت": ["پلدشت"],
		"پیرانشهر": ["لاجان", "پیرانشهر"],
		"چالدران": ["آواجیق"],
		"چایپاره": ["حاجیلار"],
		"چهاربرج": ["چهاربرج"]
	},
	اردبیل: {
		"اردبیل": [
			"آراللو",
			"اردبیل",
			"ثمرین",
			"هیر"
		],
		"اصلاندوز": ["اصلاندوز"],
		"انگوت": ["زیوه"],
		"بیله سوار": ["جعفرآباد"],
		"خلخال": [
			"خلخال",
			"هشتجین",
			"کلور"
		],
		"سرعین": ["اردیموسی", "سرعین"],
		"مشگین شهر": [
			"النی",
			"رضی",
			"فخراباد",
			"قصابه",
			"لاهرود",
			"مرادلو"
		],
		"نمین": ["عنبران", "نمین"],
		"نیر": ["نیر", "کوراییم"],
		"پارس آباد": ["اولتان"],
		"کوثر": ["فیروزآباد", "گیوی"],
		"گرمی": ["زهرا", "گرمی"]
	},
	اصفهان: {
		"آران و بیدگل": ["ابوزیدآباد"],
		"اردستان": [
			"اردستان",
			"زواره",
			"مهاباد"
		],
		"اصفهان": [
			"اصفهان",
			"بهارستان",
			"زیار",
			"قهجاورستان"
		],
		"برخوار": [
			"خورزوق",
			"دستگرد",
			"سین",
			"شاپورآباد",
			"کمشچه"
		],
		"بویین و میاندشت": ["افوس"],
		"تیران وکرون": [
			"تیران",
			"رضوانشهر",
			"عسگران"
		],
		"جرقویه": ["محمدآباد", "نصرآباد"],
		"خمینی شهر": [
			"اصغرآباد",
			"درچه",
			"کوشک"
		],
		"خوانسار": ["خوانسار", "ویست"],
		"خور و بیابانک": [
			"جندق",
			"خور",
			"فرخی"
		],
		"دهاقان": ["دهاقان", "گلشن"],
		"سمیرم": [
			"بیده",
			"حنا",
			"سمیرم",
			"ونک",
			"کمه"
		],
		"شاهین شهرو میمه": [
			"میمه",
			"وزوان",
			"گرگاب",
			"گزبرخوار"
		],
		"شهرضا": ["شهرضا", "منظریه"],
		"فریدن": ["داران", "دامنه"],
		"فریدونشهر": ["فریدونشهر"],
		"فلاورجان": [
			"ابریشم",
			"اشترجان",
			"زازران",
			"طاد",
			"فلاورجان",
			"قهدریجان",
			"مینادشت",
			"پیربکران"
		],
		"لنجان": [
			"باغشاد",
			"فولادشهر",
			"ورنامخواست",
			"چرمهین",
			"چمگردان"
		],
		"مبارکه": [
			"دیزیچه",
			"زیباشهر",
			"طالخونچه",
			"مبارکه",
			"مجلسی",
			"کرکوند"
		],
		"نایین": [
			"انارک",
			"بافران",
			"نایین"
		],
		"نجف آباد": [
			"جوزدان",
			"دهق",
			"علویجه",
			"کهریزسنگ",
			"گلدشت"
		],
		"نطنز": [
			"بادرود",
			"خالدآباد",
			"نطنز"
		],
		"هرند": ["اژیه", "هرند"],
		"ورزنه": ["ورزنه"],
		"چادگان": ["رزوه", "چادگان"],
		"کاشان": [
			"برزک",
			"قمصر",
			"مشکات",
			"نیاسر",
			"کاشان"
		],
		"کوهپایه": [
			"تودشک",
			"سجزی",
			"کوهپایه"
		],
		"گلپایگان": [
			"گلشهر",
			"گلپایگان",
			"گوگد"
		]
	},
	البرز: {
		"اشتهارد": ["اشتهارد"],
		"ساوجبلاغ": [
			"مهستان",
			"هشتگرد",
			"کوهسار",
			"گلسار"
		],
		"طالقان": ["طالقان"],
		"فردیس": ["فردیس"],
		"نظرآباد": ["تنکمان", "نظرآباد"],
		"چهارباغ": ["چهارباغ"],
		"کرج": [
			"آسارا",
			"ماهدشت",
			"کرج",
			"گرمدره"
		]
	},
	ایلام: {
		"آبدانان": ["آبدانان", "مورموری"],
		"ایلام": ["ایلام", "جعفراباد"],
		"ایوان": ["ایوان", "زرنه"],
		"بدره": ["بدره"],
		"دره شهر": ["ماژین"],
		"دهلران": [
			"دهلران",
			"موسیان",
			"میمه",
			"پهله"
		],
		"سیروان": ["لومار"],
		"ملکشاهی": [
			"ارکواز",
			"دلگشا",
			"مهر"
		],
		"مهران": ["مهران"],
		"هلیلان": ["توحید"],
		"چرداول": [
			"بلاوه",
			"سرابله",
			"شباب"
		],
		"چوار": ["چوار"]
	},
	بوشهر: {
		"بوشهر": [
			"بوشهر",
			"خارک",
			"چغادک"
		],
		"تنگستان": [
			"آباد",
			"اهرم",
			"دلوار"
		],
		"جم": [
			"انارستان",
			"بهارستان",
			"جم",
			"ریز"
		],
		"دشتستان": [
			"برازجان",
			"بوشکان",
			"دالکی",
			"شبانکاره",
			"وحدتیه",
			"کلمه"
		],
		"دشتی": [
			"بادوله",
			"خورموج",
			"شنبه",
			"کاکی"
		],
		"دیر": [
			"آبدان",
			"بردخون",
			"بردستان",
			"بندردیر",
			"دوراهک"
		],
		"دیلم": ["بندردیلم"],
		"عسلویه": ["بیدخون", "عسلویه"],
		"کنگان": [
			"بندرکنگان",
			"بنک",
			"سیراف",
			"شیرینو"
		],
		"گناوه": ["بندرریگ", "بندرگناوه"]
	},
	تهران: {
		"اسلامشهر": ["اسلامشهر", "چهاردانگه"],
		"بهارستان": ["صالحیه", "گلستان"],
		"تهران": ["تهران"],
		"دماوند": [
			"آبسرد",
			"آبعلی",
			"دماوند",
			"رودهن",
			"کیلان"
		],
		"رباط کریم": [
			"رباطکریم",
			"نصیرشهر",
			"پرند"
		],
		"ری": [
			"باقرشهر",
			"ری",
			"کهریزک"
		],
		"شمیرانات": [
			"تجریش",
			"شمشک",
			"فشم",
			"لواسان"
		],
		"شهریار": [
			"اندیشه",
			"باغستان",
			"شاهدشهر",
			"شهریار",
			"صباشهر",
			"فردوسیه",
			"وحیدیه"
		],
		"فیروزکوه": ["ارجمند", "فیروزکوه"],
		"قدس": ["قدس"],
		"قرچک": ["قرچک"],
		"ملارد": ["صفادشت", "ملارد"],
		"ورامین": ["جوادآباد", "ورامین"],
		"پاکدشت": ["پاکدشت"],
		"پردیس": [
			"بومهن",
			"خسرواباد",
			"سعیداباد",
			"پردیس"
		],
		"پیشوا": ["پیشوا"]
	},
	"خراسان جنوبی": {
		"بشرویه": ["ارسک", "بشرویه"],
		"بیرجند": ["بیرجند"],
		"خوسف": ["خوسف", "ماژان"],
		"درمیان": [
			"اسدیه",
			"قهستان",
			"گزیک"
		],
		"زیرکوه": ["آبیز", "زهان"],
		"سرایان": ["آیسک", "سرایان"],
		"سربیشه": [
			"درح",
			"سربیشه",
			"مود"
		],
		"طبس": ["دیهوک", "طبس"],
		"فردوس": [
			"اسلامیه",
			"باغستان",
			"فردوس"
		],
		"قاینات": [
			"اسفدن",
			"قاین",
			"نیمبلوک"
		],
		"نهبندان": ["شوسف", "نهبندان"]
	},
	"خراسان رضوی": {
		"باخرز": ["باخرز"],
		"بجستان": ["بجستان", "یونسی"],
		"بردسکن": [
			"انابد",
			"بردسکن",
			"شهرآباد"
		],
		"تایباد": ["تایباد", "کاریز"],
		"تربت جام": ["نصرآباد"],
		"تربت حیدریه": [
			"بایک",
			"نسر",
			"کدکن"
		],
		"جغتای": ["جغتای", "ریواده"],
		"جوین": ["نقاب"],
		"خلیل آباد": ["کندر"],
		"خواف": [
			"خواف",
			"سده",
			"سلامی",
			"سنگان",
			"نشتیفان"
		],
		"خوشاب": ["مشکان"],
		"داورزن": ["داورزن", "ریوند"],
		"درگز": [
			"درگز",
			"نوخندان",
			"چاپشلو"
		],
		"رشتخوار": ["جنگل", "رشتخوار"],
		"زاوه": ["چخماق"],
		"زبرخان": [
			"خرو",
			"درود",
			"قدمگاه"
		],
		"سبزوار": ["روداب", "سبزوار"],
		"سرخس": ["سرخس", "مزدآوند"],
		"ششتمد": ["شامکان", "ششتمد"],
		"طرقبه شاندیز": ["شاندیز", "طرقبه"],
		"فریمان": ["فرهادگرد", "فریمان"],
		"فیروزه": ["فیروزه", "گرماب"],
		"قوچان": [
			"آلماجق",
			"باجگیران",
			"قوچان",
			"مزرج"
		],
		"مشهد": ["رضویه", "مشهد"],
		"مه ولات": ["شادمهر"],
		"نیشابور": [
			"بار",
			"نیشابور",
			"چکنه"
		],
		"چناران": [
			"رادکان",
			"سیدآباد",
			"چناران"
		],
		"کاشمر": ["کاشمر"],
		"کلات": ["چنار", "کلات"],
		"کوهسرخ": ["ریوش"],
		"گلبهار": ["گلبهار", "گلمکان"],
		"گناباد": [
			"بیدخت",
			"روشناوند",
			"کاخک",
			"گناباد"
		]
	},
	"خراسان شمالی": {
		"اسفراین": ["اسفراین"],
		"بجنورد": ["بجنورد", "حصارگرمخان"],
		"جاجرم": [
			"جاجرم",
			"سنخواست",
			"شوقان"
		],
		"راز و جرگلان": ["راز", "غلامان"],
		"سملقان": [
			"آشخانه",
			"آوا",
			"قاضی"
		],
		"شیروان": [
			"خانلق",
			"زیارت",
			"شیروان",
			"قوشخانه",
			"لوجلی"
		],
		"فاروج": ["تیتکانلو", "فاروج"],
		"گرمه": [
			"ایور",
			"درق",
			"گرمه"
		]
	},
	خوزستان: {
		"آبادان": [
			"آبادان",
			"اروندکنار",
			"چویبده"
		],
		"آغاجاری": ["آغاجاری", "جولکی"],
		"امیدیه": [
			"امیدیه",
			"جایزان",
			"میانکوه"
		],
		"اندیمشک": [
			"آزادی",
			"اندیمشک",
			"بیدروبه",
			"حسینیه"
		],
		"اندیکا": ["آبژدان", "زاووت"],
		"اهواز": ["الهایی", "اهواز"],
		"ایذه": ["ایذه"],
		"باغ ملک": ["میداود"],
		"باوی": [
			"شیبان",
			"ملاثانی",
			"ویس"
		],
		"بندرماهشهر": ["بندرماهشهر", "چمران"],
		"بهبهان": [
			"بهبهان",
			"تشان",
			"سردشت",
			"منصوریه"
		],
		"حمیدیه": ["حمیدیه"],
		"خرمشهر": [
			"خرمشهر",
			"مقاومت",
			"مینوشهر"
		],
		"دزفول": [
			"حمزه",
			"دزفول",
			"سالند",
			"شهیون",
			"منتظران",
			"میانرود",
			"چغامیش"
		],
		"دزپارت": ["دهدز"],
		"دشت آزادگان": [
			"ابوحمیظه",
			"بستان",
			"سوسنگرد"
		],
		"رامشیر": ["رامشیر", "مشراگه"],
		"رامهرمز": ["باوج", "رامهرمز"],
		"شادگان": [
			"خنافره",
			"دارخوین",
			"شادگان"
		],
		"شوش": ["حر", "شوش"],
		"شوشتر": [
			"سرداران",
			"شرافت",
			"شوشتر",
			"گوریه"
		],
		"صیدون": ["صیدون"],
		"لالی": ["تراز", "لالی"],
		"مسجدسلیمان": [
			"عنبر",
			"مسجدسلیمان",
			"گلگیر"
		],
		"هفتکل": ["هفتگل"],
		"هندیجان": ["زهره", "هندیجان"],
		"هویزه": ["رفیع", "هویزه"],
		"کرخه": ["الوان", "شاوور"],
		"گتوند": [
			"ترکالکی",
			"سماله",
			"گتوند"
		]
	},
	زنجان: {
		"ابهر": ["ابهر", "هیدج"],
		"ایجرود": ["حلب"],
		"خدابنده": [
			"سجاس",
			"سهرورد",
			"قیدار",
			"نوربهار",
			"کرسف",
			"گرماب"
		],
		"خرمدره": ["خرمدره"],
		"زنجان": ["ارمغانخانه", "زنجان"],
		"سلطانیه": ["سلطانیه"],
		"طارم": ["چورزق"],
		"ماهنشان": ["دندی"]
	},
	سمنان: {
		"آرادان": ["آرادان"],
		"دامغان": [
			"امیریه",
			"دامغان",
			"دیباج",
			"کلاته"
		],
		"سرخه": ["سرخه"],
		"سمنان": ["سمنان"],
		"شاهرود": [
			"بسطام",
			"بیارجمند",
			"رودیان",
			"شاهرود",
			"مجن"
		],
		"مهدی شهر": ["درجزین", "شهمیرزاد"],
		"میامی": ["رضوان", "میامی"],
		"گرمسار": ["ایوانکی", "گرمسار"]
	},
	"سیستان و بلوچستان": {
		"ایرانشهر": ["ایرانشهر", "بزمان"],
		"بمپور": ["بمپور", "محمدان"],
		"خاش": ["خاش"],
		"دشتیاری": ["بریس", "نگور"],
		"دلگان": ["چگرد", "گلمورتی"],
		"راسک": [
			"راسک",
			"پارود",
			"پیشین"
		],
		"زابل": ["بنجار", "زابل"],
		"زاهدان": ["زاهدان", "سرجنگل"],
		"زرآباد": ["زرآباد"],
		"زهک": ["جزینک", "زهک"],
		"سراوان": [
			"اسفندک",
			"سراوان",
			"سیرکان",
			"محمدی",
			"گشت"
		],
		"سرباز": ["سرباز"],
		"سیب و سوران": [
			"سوران",
			"سیب",
			"هیدوچ"
		],
		"فنوج": ["فنوج", "گتیج"],
		"قصرقند": ["ساربوک", "قصرقند"],
		"لاشار": ["اسپکه"],
		"مهرستان": ["آشار", "مهرستان"],
		"میرجاوه": ["لادیز", "میرجاوه"],
		"نیمروز": ["ادیمی"],
		"نیک شهر": ["بنت", "چانف"],
		"هامون": ["محمدآباد"],
		"هیرمند": ["قرقری"],
		"چاه بهار": ["پلان"],
		"کنارک": ["کنارک"],
		"گلشن": ["جالق"]
	},
	فارس: {
		"آباده": [
			"آباده",
			"ایزدخواست",
			"بهمن",
			"سورمق",
			"صغاد"
		],
		"ارسنجان": ["ارسنجان"],
		"استهبان": [
			"استهبان",
			"ایج",
			"رونیز"
		],
		"اقلید": [
			"اقلید",
			"دژکرد",
			"سده"
		],
		"اوز": ["اوز", "کوره"],
		"بوانات": ["بوانات", "مزایجان"],
		"بیضا": ["بیضا"],
		"جهرم": ["جهرم", "دوزه"],
		"جویم": ["جویم"],
		"خرامه": [
			"خرامه",
			"خیراباد",
			"معزآبادجابری"
		],
		"خرم بید": ["صفاشهر", "قادراباد"],
		"خفر": ["خاوران"],
		"خنج": ["خنج", "محمله"],
		"داراب": [
			"داراب",
			"دوبرجی",
			"رستاق",
			"فدامی",
			"پاسخن"
		],
		"رستم": ["مصیری", "کوپن"],
		"زرقان": ["زرقان", "لپویی"],
		"زرین دشت": ["دبیران", "شهرپیر"],
		"سروستان": ["سروستان", "کوهنجان"],
		"سرچهان": ["توجردی", "حسامی"],
		"سپیدان": ["اردکان", "هماشهر"],
		"شیراز": [
			"داریان",
			"شهرصدرا",
			"شیراز"
		],
		"فراشبند": [
			"دهرم",
			"فراشبند",
			"نوجین"
		],
		"فسا": [
			"زاهدشهر",
			"ششده",
			"فسا",
			"میانشهر",
			"نوبندگان"
		],
		"فیروزآباد": ["فیروزآباد", "میمند"],
		"قیروکارزین": ["افزر", "قیر"],
		"لارستان": [
			"بنارویه",
			"بیرم",
			"خور",
			"دهکویه",
			"لار",
			"لطیفی"
		],
		"لامرد": [
			"اشکنان",
			"اهل",
			"خیرگو",
			"علامرودشت",
			"لامرد"
		],
		"مرودشت": [
			"خانیمن",
			"رامجرد",
			"سیدان",
			"فاروق",
			"مرودشت",
			"کامفیروز"
		],
		"ممسنی": ["بابامنیر", "نورآباد"],
		"مهر": [
			"اسیر",
			"خوزی",
			"فال",
			"مهر",
			"وراوی"
		],
		"نی ریز": ["قطرویه", "مشکان"],
		"پاسارگاد": ["مادرسلیمان"],
		"کازرون": [
			"بالاده",
			"خشت",
			"کازرون",
			"کنارتخته"
		],
		"کوار": [
			"اکبرآباد",
			"طسوج",
			"مظفری",
			"کوار"
		],
		"کوه چنار": ["قایمیه", "نودان"],
		"گراش": ["ارد", "گراش"]
	},
	قزوین: {
		"آبیک": [
			"آبیک",
			"خاکعلی",
			"زیاران",
			"قشلاق"
		],
		"آوج": ["آبگرم", "آوج"],
		"البرز": [
			"الوند",
			"بیدستان",
			"شریفیه",
			"محمدیه"
		],
		"بویین زهرا": [
			"ارداق",
			"دانسفهان",
			"سگزآباد",
			"شال"
		],
		"تاکستان": [
			"اسفرورین",
			"تاکستان",
			"خرمدشت",
			"ضیاآباد",
			"نرجه"
		],
		"قزوین": [
			"اقبالیه",
			"رازمیان",
			"سیردان",
			"قزوین",
			"محمودآبادنمونه",
			"کوهین"
		]
	},
	قم: {
		"جعفرآباد": ["جعفریه", "قاهان"],
		"قم": [
			"دستجرد",
			"سلفچگان",
			"قم",
			"قنوات"
		],
		"کهک": ["کهک"]
	},
	لرستان: {
		"ازنا": ["ازنا"],
		"الیگودرز": ["الیگودرز", "شاهپوراباد"],
		"بروجرد": [
			"اشترینان",
			"بروجرد",
			"ونایی"
		],
		"خرم آباد": ["زاغه", "سپیددشت"],
		"دلفان": ["برخوردار", "نورآباد"],
		"دورود": ["دورود", "چالانچولان"],
		"رومشکان": ["سوری", "چقابل"],
		"سلسله": ["الشتر", "فیروزآباد"],
		"معمولان": ["معمولان"],
		"پلدختر": ["پلدختر"],
		"چگنی": ["ویسیان"],
		"کوهدشت": [
			"کوهدشت",
			"کوهنانی",
			"گراب"
		]
	},
	مازندران: {
		"آمل": [
			"آمل",
			"بابکان",
			"دابودشت",
			"رینه",
			"گزنک"
		],
		"بابل": [
			"امیرکلا",
			"بابل",
			"زرگر",
			"مرزیکلا",
			"گتاب",
			"گلوگاه"
		],
		"بابلسر": ["بابلسر", "بهنمیر"],
		"بهشهر": ["بهشهر", "رستمکلا"],
		"تنکابن": [
			"تنکابن",
			"شیرود",
			"نشتارود"
		],
		"جویبار": ["جویبار"],
		"رامسر": ["دالخانی", "رامسر"],
		"ساری": [
			"اکند",
			"ساری",
			"فریم",
			"کیاسر"
		],
		"سوادکوه": ["آلاشت", "زیرآب"],
		"سوادکوه شمالی": ["شیرگاه"],
		"سیمرغ": ["کیاکلا"],
		"عباس آباد": ["کلارآباد"],
		"فریدونکنار": ["فریدونکنار"],
		"قایم شهر": ["ارطه"],
		"محمودآباد": ["سرخرود", "محمودآباد"],
		"میاندورود": ["سورک", "طبقده"],
		"نور": [
			"ایزدشهر",
			"بلده",
			"رویان",
			"نور",
			"چمستان"
		],
		"نوشهر": [
			"نوشهر",
			"پول",
			"کجور"
		],
		"نکا": ["نکا"],
		"چالوس": ["هچیرود", "چالوس"],
		"کلاردشت": ["کلاردشت"],
		"گلوگاه": ["گلوگاه"]
	},
	مرکزی: {
		"آشتیان": ["آشتیان"],
		"اراک": [
			"اراک",
			"داودآباد",
			"ساروق",
			"کارچان"
		],
		"تفرش": ["تفرش"],
		"خمین": ["خمین"],
		"خنداب": ["جاورسیان", "خنداب"],
		"دلیجان": ["دلیجان", "نراق"],
		"زرندیه": [
			"خشکرود",
			"رازقان",
			"زاویه",
			"مامونیه",
			"پرندک"
		],
		"ساوه": [
			"آوه",
			"ساوه",
			"نوبران"
		],
		"شازند": [
			"آستانه",
			"توره",
			"شازند",
			"شهباز",
			"مهاجران",
			"هندودر"
		],
		"فراهان": [
			"تلخاب",
			"خنجین",
			"فرمهین"
		],
		"محلات": ["محلات", "نیمور"],
		"کمیجان": ["میلاجرد", "کمیجان"]
	},
	هرمزگان: {
		"ابوموسی": ["ابوموسی"],
		"بستک": [
			"بستک",
			"جناح",
			"هنگوییه",
			"کوهیچ"
		],
		"بشاگرد": ["سردشت", "گوهران"],
		"بندر عباس": [
			"تخت",
			"فین",
			"هرمز"
		],
		"بندر لنگه": [
			"لمزان",
			"چارک",
			"کنگ",
			"کیش"
		],
		"جاسک": ["لیردف"],
		"حاجی آباد": ["سرگز", "فارغان"],
		"خمیر": [
			"خمیر",
			"رویدر",
			"پل"
		],
		"رودان": [
			"بیکاء",
			"دهبارز",
			"زیارتعلی"
		],
		"سیریک": [
			"سیریک",
			"کوهستک",
			"گروک"
		],
		"قشم": [
			"درگهان",
			"رمکان",
			"سوزا",
			"طبل",
			"قشم",
			"لافت"
		],
		"میناب": [
			"تیرور",
			"زهوکی",
			"سندرک",
			"میناب",
			"هشتبندی",
			"کرگان"
		],
		"پارسیان": [
			"دشتی",
			"پارسیان",
			"کوشکنار"
		]
	},
	همدان: {
		"اسدآباد": [
			"آجین",
			"اسدآباد",
			"پالیز"
		],
		"بهار": [
			"بهار",
			"لالجین",
			"مهاجران"
		],
		"تویسرکان": [
			"تویسرکان",
			"سرکان",
			"فرسفج"
		],
		"درگزین": ["شاهنجرین", "کرفس"],
		"رزن": ["دمق", "رزن"],
		"فامنین": ["فامنین"],
		"ملایر": [
			"ازندریان",
			"جوکار",
			"زنگنه",
			"سامن",
			"ملایر"
		],
		"نهاوند": [
			"برزول",
			"فیروزان",
			"نهاوند",
			"گیان"
		],
		"همدان": [
			"جورقان",
			"قهاوند",
			"مریانج",
			"همدان"
		],
		"کبودرآهنگ": ["کبودرآهنگ"]
	},
	"چهارمحال و بختیاری": {
		"اردل": [
			"اردل",
			"دشتک",
			"سرخون",
			"کاج"
		],
		"بروجن": [
			"بروجن",
			"بلداجی",
			"سفیددشت",
			"فرادبنه",
			"نقنه",
			"گندمان"
		],
		"بن": ["بن", "وردنجان"],
		"خانمیرزا": ["آلونی"],
		"سامان": ["سامان", "هوره"],
		"شهرکرد": [
			"سودجان",
			"سورشجان",
			"شهرکرد",
			"طاقانک",
			"نافچ",
			"هارونی",
			"هفشجان",
			"کیان"
		],
		"فارسان": [
			"بآباحیدر",
			"جونقان",
			"فارسان",
			"پردنجان",
			"چلیچه",
			"گوجان"
		],
		"لردگان": [
			"سردشت",
			"لردگان",
			"منج"
		],
		"کوهرنگ": [
			"بازفت",
			"صمصامی",
			"چلگرد"
		],
		"کیار": [
			"دستنا",
			"شلمزار",
			"ناغان",
			"گهرو"
		]
	},
	کردستان: {
		"بانه": ["آرمرده", "بانه"],
		"بیجار": [
			"بابارشانی",
			"بیجار",
			"پیرتاج",
			"یاسوکند"
		],
		"دهگلان": ["دهگلان"],
		"دیواندره": [
			"دیواندره",
			"زرینه",
			"هزارکانیان"
		],
		"سروآباد": ["سروآباد"],
		"سقز": [
			"سقز",
			"سنته",
			"صاحب"
		],
		"سنندج": ["سنندج", "شویشه"],
		"قروه": [
			"دزج",
			"دلبران",
			"قروه",
			"مالوجه"
		],
		"مریوان": ["مریوان", "چناره"],
		"کامیاران": ["موچش", "کامیاران"]
	},
	کرمان: {
		"ارزوییه": ["ارزوییه"],
		"انار": ["انار"],
		"بافت": [
			"بافت",
			"بزنجان",
			"کشکوییه"
		],
		"بردسیر": [
			"بردسیر",
			"دشتکار",
			"نگار",
			"گلزار"
		],
		"بم": [
			"بروات",
			"بم",
			"دهبکری"
		],
		"جازموریان": ["زهکلوت"],
		"جیرفت": [
			"بلوک",
			"جبالبارز",
			"جیرفت"
		],
		"رابر": ["رابر", "هنزا"],
		"راور": ["راور", "هجدک"],
		"رفسنجان": [
			"بهرمان",
			"رفسنجان",
			"صفاییه",
			"کشکوییه"
		],
		"رودبارجنوب": ["رودبار"],
		"ریگان": ["محمدآباد"],
		"زرند": [
			"خانوک",
			"ریحان",
			"زرند",
			"سیریز"
		],
		"سیرجان": [
			"بلورد",
			"زیدآباد",
			"سیرجان",
			"هماشهر",
			"پاریز"
		],
		"شهربابک": [
			"جوزم",
			"خورسند",
			"دهج",
			"شهربابک"
		],
		"عنبرآباد": [
			"دوساری",
			"عنبرآباد",
			"مردهک"
		],
		"فاریاب": ["فاریاب", "پاسفید"],
		"فهرج": ["فهرج"],
		"قلعه گنج": ["رمشک"],
		"منوجان": ["منوجان", "نودژ"],
		"نرماشیر": ["نرماشیر"],
		"کرمان": [
			"اختیارآباد",
			"اندوهجرد",
			"باغین",
			"جوپار",
			"راین",
			"شهداد",
			"ماهان",
			"چترود",
			"کرمان",
			"گلباف"
		],
		"کهنوج": ["کهنوج"],
		"کوهبنان": ["کوهبنان", "کیانشهر"],
		"گنبکی": ["گنبکی"]
	},
	کرمانشاه: {
		"اسلام آبادغرب": ["حمیل"],
		"ثلاث باباجانی": ["ازگله", "میرآباد"],
		"جوانرود": ["جوانرود", "شروینه"],
		"دالاهو": [
			"ریجاب",
			"کرند",
			"گهواره"
		],
		"روانسر": ["روانسر", "شاهو"],
		"سنقر": ["سطر", "سنقر"],
		"صحنه": ["دینور", "صحنه"],
		"قصرشیرین": ["سومار", "قصرشیرین"],
		"هرسین": ["بیستون", "هرسین"],
		"پاوه": [
			"بانوره",
			"باینگان",
			"نودشه",
			"نوسود",
			"پاوه"
		],
		"کرمانشاه": [
			"رباط",
			"قلعه",
			"هلشی",
			"کرمانشاه",
			"کوزران"
		],
		"کنگاور": ["کنگاور", "گودین"],
		"گیلانغرب": ["سرمست", "گیلانغرب"]
	},
	"کهگیلویه و بویراحمد": {
		"باشت": ["باشت", "بوستان"],
		"بهمیی": ["لیکک"],
		"بویراحمد": [
			"سپیدار",
			"مادوان",
			"چیتاب",
			"یاسوج"
		],
		"دنا": ["پاتاوه"],
		"لنده": ["لنده"],
		"مارگون": ["مارگون"],
		"چرام": ["سرفاریاب", "چرام"],
		"کهگیلویه": [
			"دهدشت",
			"دیشموک",
			"سوق"
		],
		"گچساران": ["دوگنبدان"]
	},
	گلستان: {
		"آزادشهر": ["آزادشهر"],
		"بندرگز": ["بندرگز", "نوکنده"],
		"ترکمن": ["بندرترکمن", "سیجوال"],
		"رامیان": ["دلند", "رامیان"],
		"علی آباد کتول": ["سنگدوین", "مزرعه"],
		"مراوه تپه": ["مراوه", "گلیداغ"],
		"مینودشت": [
			"القجر",
			"دوزین",
			"مینودشت"
		],
		"کردکوی": ["کردکوی"],
		"کلاله": ["فراغی", "کلاله"],
		"گالیکش": ["گالیکش", "ینقاق"],
		"گرگان": [
			"جلین",
			"سرخنکلاته",
			"قرق",
			"گرگان"
		],
		"گنبدکاووس": ["کرند", "گنبدکاووس"]
	},
	گیلان: {
		"آستارا": ["آستارا", "لوندویل"],
		"آستانه اشرفیه": ["کیاشهر"],
		"املش": ["املش", "رانکوه"],
		"بندرانزلی": ["بندرانزلی"],
		"خمام": ["خمام", "چوکام"],
		"رشت": [
			"خشکبیجار",
			"رشت",
			"سنگر",
			"لولمان",
			"پیربازار",
			"کوچصفهان"
		],
		"رضوانشهر": ["رضوانشهر"],
		"رودبار": [
			"توتکابن",
			"جیرنده",
			"رودبار",
			"لوشان",
			"منجیل"
		],
		"رودسر": [
			"رودسر",
			"واجارگاه",
			"چابکسر",
			"کلاچای"
		],
		"سیاهکل": ["دیلمان", "سیاهکل"],
		"شفت": ["شفت"],
		"صومعه سرا": ["ضیابر", "مرجقل"],
		"طوالش": [
			"اسالم",
			"حویق",
			"لیسار",
			"چوبر"
		],
		"فومن": [
			"فومن",
			"ماسوله",
			"ماکلوان"
		],
		"لاهیجان": ["رودبنه", "لاهیجان"],
		"لنگرود": [
			"اطاقور",
			"شلمان",
			"لنگرود",
			"کومله"
		],
		"ماسال": ["ماسال"]
	},
	یزد: {
		"ابرکوه": ["ابرکوه", "مهردشت"],
		"اردکان": [
			"اردکان",
			"خرانق",
			"عقدا"
		],
		"اشکذر": [
			"اشکذر",
			"خضرآباد",
			"مجومرد"
		],
		"بافق": ["بافق"],
		"بهاباد": ["بهاباد"],
		"تفت": [
			"بخ",
			"تفت",
			"نیر"
		],
		"خاتم": ["هرات"],
		"زارچ": ["زارچ"],
		"مروست": ["مروست"],
		"مهریز": ["مهریز"],
		"میبد": [
			"بفروییه",
			"میبد",
			"ندوشن"
		],
		"یزد": [
			"حمیدیا",
			"شاهدیه",
			"یزد"
		]
	}
};
var PROVINCES = Object.keys(tree).sort((a, b) => a.localeCompare(b, "fa"));
function getCounties(province) {
	const counties = tree[province];
	if (!counties) return [];
	return Object.keys(counties).sort((a, b) => a.localeCompare(b, "fa"));
}
function getCities(province, county) {
	const cities = tree[province]?.[county];
	if (!cities) return [];
	return [...cities].sort((a, b) => a.localeCompare(b, "fa"));
}
var selectClass = "flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm";
/** Cascading استان / شهرستان / شهر selects, backed by the full Iran dataset. */
function LocationFields({ value, onChange }) {
	const counties = value.province ? getCounties(value.province) : [];
	const cities = value.province && value.county ? getCities(value.province, value.county) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "استان",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: selectClass,
				value: value.province,
				onChange: (e) => onChange({
					province: e.target.value,
					county: "",
					city: ""
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: "انتخاب کنید"
				}), PROVINCES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: p,
					children: p
				}, p))]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "شهرستان",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: selectClass,
				value: value.county,
				disabled: !value.province,
				onChange: (e) => onChange({
					...value,
					county: e.target.value,
					city: ""
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: "انتخاب کنید"
				}), counties.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: c,
					children: c
				}, c))]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
			label: "شهر",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: selectClass,
				value: value.city,
				disabled: !value.county,
				onChange: (e) => onChange({
					...value,
					city: e.target.value
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "",
					children: "انتخاب کنید"
				}), cities.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: c,
					children: c
				}, c))]
			})
		})
	] });
}
var gregorianToJalali = (gy, gm, gd) => {
	const g_d_m = [
		0,
		31,
		59,
		90,
		120,
		151,
		181,
		212,
		243,
		273,
		304,
		334
	];
	let jy = gy <= 1600 ? 0 : 979;
	gy -= gy <= 1600 ? 621 : 1600;
	const gy2 = gm > 2 ? gy + 1 : gy;
	let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
	jy += 33 * Math.floor(days / 12053);
	days %= 12053;
	jy += 4 * Math.floor(days / 1461);
	days %= 1461;
	jy += Math.floor((days - 1) / 365);
	if (days > 0) days = (days - 1) % 365;
	const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
	const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
	return [
		jy,
		jm,
		jd
	];
};
var formatJalali = (date) => {
	try {
		return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "short" }).format(new Date(date));
	} catch {
		return "";
	}
};
var formatRial = (amount) => {
	const num = Number(amount) || 0;
	return new Intl.NumberFormat("fa-IR").format(num) + " ریال";
};
var parseAmount = (val) => {
	if (!val) return 0;
	const englishDigits = val.replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString());
	return parseFloat(englishDigits.replace(/,/g, "")) || 0;
};
var toFaDigits = (str) => {
	if (str === null || str === void 0) return "";
	return str.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
};
var lineTotals = (items) => {
	if (!Array.isArray(items)) return 0;
	return items.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 1), 0);
};
var emptyCustomer$1 = () => ({
	id: "",
	name: "",
	nationalId: "",
	economicCode: "",
	registrationNo: "",
	postalCode: "",
	phone: "",
	province: "",
	county: "",
	city: "",
	address: ""
});
var defaultSeller = {
	id: "seller",
	name: "",
	nationalId: "",
	economicCode: "",
	registrationNo: "",
	postalCode: "",
	trackingCode: "",
	phone: "",
	province: "",
	county: "",
	city: "",
	address: ""
};
var seedProducts = [];
var seedCustomers = [];
var EXPENSE_CATEGORIES = [
	"اجاره",
	"حقوق",
	"خرید کالا",
	"قبوض",
	"حمل و نقل",
	"سایر"
];
var INCOME_CATEGORIES = [
	"فروش نقدی",
	"دریافتی از مشتری",
	"سایر درآمد"
];
function newDraft(number, kind, direction, vatRate) {
	return {
		kind,
		direction,
		number,
		date: (/* @__PURE__ */ new Date()).toISOString(),
		customer: emptyCustomer$1(),
		items: [],
		notes: "",
		vatRate
	};
}
function uid() {
	return crypto.randomUUID();
}
function counterKey(kind, direction) {
	return direction === "sale" ? kind === "quote" ? "nextSaleQuoteNumber" : "nextSaleInvoiceNumber" : kind === "quote" ? "nextPurchaseQuoteNumber" : "nextPurchaseInvoiceNumber";
}
function invoiceSums(items, vatRate) {
	return items.reduce((acc, item) => {
		const t = lineTotals(item.qty, item.unitPrice, item.discount, vatRate);
		acc.amount += t.amount;
		acc.afterDiscount += t.afterDiscount;
		acc.vat += t.vat;
		acc.payable += t.payable;
		acc.discount += item.discount;
		acc.qty += item.qty;
		return acc;
	}, {
		amount: 0,
		afterDiscount: 0,
		vat: 0,
		payable: 0,
		discount: 0,
		qty: 0
	});
}
/**
* Net balance for a party (customer or supplier): sales invoices they owe us,
* minus purchase invoices we owe them, minus receipts we got from them, plus
* payments we made to them. Positive = they owe us. Negative = we owe them.
*/
function partyBalance(invoices, payments, partyId) {
	const sold = invoices.filter((i) => i.kind === "invoice" && i.direction === "sale" && i.customer.id === partyId).reduce((sum, i) => sum + invoiceSums(i.items, i.vatRate).payable, 0);
	const bought = invoices.filter((i) => i.kind === "invoice" && i.direction === "purchase" && i.customer.id === partyId).reduce((sum, i) => sum + invoiceSums(i.items, i.vatRate).payable, 0);
	const net = payments.filter((p) => p.customerId === partyId).reduce((sum, p) => sum + (p.direction === "receipt" ? p.amount : -p.amount), 0);
	return sold - bought - net;
}
function productStock(movements, productId) {
	return movements.filter((m) => m.productId === productId).reduce((sum, m) => sum + (m.direction === "in" ? m.qty : -m.qty), 0);
}
/**
* Keeps warehouse stock in step with sale/purchase invoices automatically:
* a saved invoice's line items (the ones tied to a product) become stock
* movements, replacing any it previously generated so re-saving/editing
* stays correct instead of piling up duplicates. Quotes never touch stock.
*/
function syncStockForInvoice(get, set, invoice) {
	const withoutOld = get().stockMovements.filter((m) => m.sourceInvoiceId !== invoice.id);
	if (invoice.kind !== "invoice") {
		set({ stockMovements: withoutOld });
		return;
	}
	const direction = invoice.direction === "sale" ? "out" : "in";
	const label = invoice.direction === "sale" ? "فاکتور فروش" : "فاکتور خرید";
	const now = (/* @__PURE__ */ new Date()).toISOString();
	set({ stockMovements: [...invoice.items.filter((item) => item.productId && item.qty > 0).map((item) => ({
		id: uid(),
		productId: item.productId,
		direction,
		qty: item.qty,
		date: invoice.date,
		note: `${label} شماره ${toFaDigitsForNote(invoice.number)} (خودکار)`,
		createdAt: now,
		sourceInvoiceId: invoice.id
	})), ...withoutOld] });
}
function toFaDigitsForNote(n) {
	return String(n);
}
var useInvoiceStore = create()(persist((set, get) => ({
	seller: defaultSeller,
	products: seedProducts,
	customers: seedCustomers,
	invoices: [],
	transactions: [],
	payments: [],
	stockMovements: [],
	nextSaleQuoteNumber: 1,
	nextSaleInvoiceNumber: 1,
	nextPurchaseQuoteNumber: 1,
	nextPurchaseInvoiceNumber: 1,
	draft: newDraft(1, "invoice", "sale", .09),
	viewingId: null,
	hydrated: false,
	smsBankSenders: [],
	autoLockMinutes: 10,
	lowStockThreshold: 5,
	vatRate: .09,
	addSmsBankSender: (sender) => {
		const s = sender.trim();
		if (!s || get().smsBankSenders.includes(s)) return;
		set({ smsBankSenders: [...get().smsBankSenders, s] });
	},
	removeSmsBankSender: (sender) => set({ smsBankSenders: get().smsBankSenders.filter((s) => s !== sender) }),
	setAutoLockMinutes: (minutes) => set({ autoLockMinutes: minutes }),
	setLowStockThreshold: (n) => set({ lowStockThreshold: n }),
	setVatRate: (rate) => set({ vatRate: rate }),
	setSeller: (seller) => set({ seller }),
	addProduct: (p) => {
		const id = uid();
		set({ products: [{
			...p,
			id
		}, ...get().products] });
		return id;
	},
	importProducts: (rows) => {
		let created = 0;
		let updated = 0;
		let products = [...get().products];
		for (const row of rows) {
			const code = row.code?.trim();
			const idx = code ? products.findIndex((p) => p.code?.trim() === code) : -1;
			if (idx >= 0) {
				products[idx] = {
					...products[idx],
					...row
				};
				updated++;
			} else {
				products = [{
					...row,
					id: uid()
				}, ...products];
				created++;
			}
		}
		set({ products });
		return {
			created,
			updated
		};
	},
	updateProduct: (id, p) => set({ products: get().products.map((x) => x.id === id ? {
		...x,
		...p
	} : x) }),
	removeProduct: (id) => set({ products: get().products.filter((x) => x.id !== id) }),
	addCustomer: (c) => {
		const id = uid();
		set({ customers: [{
			...c,
			id
		}, ...get().customers] });
		return id;
	},
	importCustomers: (rows) => {
		let created = 0;
		let updated = 0;
		let customers = [...get().customers];
		for (const row of rows) {
			const code = row.code?.trim();
			const idx = code ? customers.findIndex((c) => c.code?.trim() === code) : -1;
			if (idx >= 0) {
				customers[idx] = {
					...customers[idx],
					...row
				};
				updated++;
			} else {
				customers = [{
					...row,
					id: uid()
				}, ...customers];
				created++;
			}
		}
		set({ customers });
		return {
			created,
			updated
		};
	},
	updateCustomer: (id, c) => set({ customers: get().customers.map((x) => x.id === id ? {
		...x,
		...c
	} : x) }),
	removeCustomer: (id) => set({ customers: get().customers.filter((x) => x.id !== id) }),
	setDraftCustomer: (customer) => set({ draft: {
		...get().draft,
		customer
	} }),
	applyCustomer: (id) => {
		const c = get().customers.find((x) => x.id === id);
		if (c) set({ draft: {
			...get().draft,
			customer: { ...c }
		} });
	},
	addDraftItem: (item) => set({ draft: {
		...get().draft,
		items: [...get().draft.items, {
			...item,
			id: uid()
		}]
	} }),
	updateDraftItem: (id, patch) => set({ draft: {
		...get().draft,
		items: get().draft.items.map((x) => x.id === id ? {
			...x,
			...patch
		} : x)
	} }),
	removeDraftItem: (id) => set({ draft: {
		...get().draft,
		items: get().draft.items.filter((x) => x.id !== id)
	} }),
	setDraftNotes: (notes) => set({ draft: {
		...get().draft,
		notes
	} }),
	setDraftDate: (date) => set({ draft: {
		...get().draft,
		date
	} }),
	startNewDocument: (kind, direction) => {
		const key = counterKey(kind, direction);
		set({
			draft: newDraft(get()[key], kind, direction, get().vatRate),
			viewingId: null
		});
	},
	loadInvoice: (id) => {
		const inv = get().invoices.find((x) => x.id === id);
		if (!inv) return;
		set({
			viewingId: id,
			draft: {
				kind: inv.kind,
				direction: inv.direction,
				number: inv.number,
				date: inv.date,
				customer: { ...inv.customer },
				items: inv.items.map((i) => ({ ...i })),
				notes: inv.notes,
				vatRate: inv.vatRate ?? get().vatRate
			}
		});
	},
	saveInvoice: () => {
		const { draft, invoices, viewingId } = get();
		if (!draft.customer.name.trim() || draft.items.length === 0) return null;
		const now = (/* @__PURE__ */ new Date()).toISOString();
		if (viewingId) {
			const existing = invoices.find((i) => i.id === viewingId);
			const updated = {
				id: viewingId,
				kind: draft.kind,
				direction: draft.direction,
				number: draft.number,
				date: draft.date,
				customer: { ...draft.customer },
				items: draft.items.map((i) => ({ ...i })),
				notes: draft.notes,
				createdAt: existing?.createdAt ?? now,
				convertedToId: existing?.convertedToId,
				convertedFromId: existing?.convertedFromId,
				vatRate: draft.vatRate
			};
			set({ invoices: invoices.map((i) => i.id === viewingId ? updated : i) });
			syncStockForInvoice(get, set, updated);
			return updated;
		}
		const key = counterKey(draft.kind, draft.direction);
		const number = get()[key];
		const created = {
			id: uid(),
			kind: draft.kind,
			direction: draft.direction,
			number,
			date: draft.date,
			customer: { ...draft.customer },
			items: draft.items.map((i) => ({ ...i })),
			notes: draft.notes,
			createdAt: now,
			vatRate: draft.vatRate
		};
		set({
			invoices: [created, ...invoices],
			[key]: number + 1,
			draft: {
				...draft,
				number: created.number
			},
			viewingId: created.id
		});
		syncStockForInvoice(get, set, created);
		return created;
	},
	removeInvoice: (id) => set({
		invoices: get().invoices.filter((x) => x.id !== id),
		viewingId: get().viewingId === id ? null : get().viewingId,
		stockMovements: get().stockMovements.filter((m) => m.sourceInvoiceId !== id)
	}),
	convertQuoteToInvoice: (id) => {
		const { invoices } = get();
		const quote = invoices.find((x) => x.id === id && x.kind === "quote");
		if (!quote || quote.convertedToId) return null;
		const key = counterKey("invoice", quote.direction);
		const number = get()[key];
		const now = (/* @__PURE__ */ new Date()).toISOString();
		const invoice = {
			id: uid(),
			kind: "invoice",
			direction: quote.direction,
			number,
			date: now,
			customer: { ...quote.customer },
			items: quote.items.map((i) => ({ ...i })),
			notes: quote.notes,
			createdAt: now,
			convertedFromId: quote.id,
			vatRate: quote.vatRate ?? get().vatRate
		};
		set({
			invoices: [invoice, ...invoices.map((x) => x.id === id ? {
				...x,
				convertedToId: invoice.id
			} : x)],
			[key]: number + 1
		});
		syncStockForInvoice(get, set, invoice);
		return invoice;
	},
	setViewingId: (viewingId) => set({ viewingId }),
	addTransaction: (t) => set({ transactions: [{
		...t,
		id: uid(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	}, ...get().transactions] }),
	removeTransaction: (id) => set({ transactions: get().transactions.filter((x) => x.id !== id) }),
	addPayment: (p) => set({ payments: [{
		...p,
		id: uid(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	}, ...get().payments] }),
	removePayment: (id) => set({ payments: get().payments.filter((x) => x.id !== id) }),
	addStockMovement: (m) => set({ stockMovements: [{
		...m,
		id: uid(),
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	}, ...get().stockMovements] }),
	removeStockMovement: (id) => set({ stockMovements: get().stockMovements.filter((x) => x.id !== id) }),
	exportData: () => {
		const s = get();
		const payload = {
			app: "divan",
			exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
			seller: s.seller,
			products: s.products,
			customers: s.customers,
			invoices: s.invoices,
			transactions: s.transactions,
			payments: s.payments,
			stockMovements: s.stockMovements,
			smsBankSenders: s.smsBankSenders,
			autoLockMinutes: s.autoLockMinutes,
			lowStockThreshold: s.lowStockThreshold,
			vatRate: s.vatRate,
			nextSaleQuoteNumber: s.nextSaleQuoteNumber,
			nextSaleInvoiceNumber: s.nextSaleInvoiceNumber,
			nextPurchaseQuoteNumber: s.nextPurchaseQuoteNumber,
			nextPurchaseInvoiceNumber: s.nextPurchaseInvoiceNumber
		};
		return JSON.stringify(payload, null, 2);
	},
	importData: (json) => {
		try {
			const data = JSON.parse(json);
			if (!data || typeof data !== "object" || data.app !== "divan") return false;
			set({
				seller: data.seller ?? get().seller,
				products: data.products ?? [],
				customers: data.customers ?? [],
				invoices: data.invoices ?? [],
				transactions: data.transactions ?? [],
				payments: data.payments ?? [],
				stockMovements: data.stockMovements ?? [],
				smsBankSenders: data.smsBankSenders ?? [],
				autoLockMinutes: data.autoLockMinutes ?? get().autoLockMinutes,
				lowStockThreshold: data.lowStockThreshold ?? get().lowStockThreshold,
				vatRate: data.vatRate ?? get().vatRate,
				nextSaleQuoteNumber: data.nextSaleQuoteNumber ?? 1,
				nextSaleInvoiceNumber: data.nextSaleInvoiceNumber ?? 1,
				nextPurchaseQuoteNumber: data.nextPurchaseQuoteNumber ?? 1,
				nextPurchaseInvoiceNumber: data.nextPurchaseInvoiceNumber ?? 1
			});
			return true;
		} catch {
			return false;
		}
	}
}), {
	name: "ansar-invoice-v3",
	skipHydration: true,
	partialize: (s) => ({
		seller: s.seller,
		products: s.products,
		customers: s.customers,
		invoices: s.invoices.map((i) => ({
			...i,
			kind: i.kind ?? "invoice",
			direction: i.direction ?? "sale"
		})),
		transactions: s.transactions,
		payments: s.payments,
		stockMovements: s.stockMovements,
		nextSaleQuoteNumber: s.nextSaleQuoteNumber,
		nextSaleInvoiceNumber: s.nextSaleInvoiceNumber,
		nextPurchaseQuoteNumber: s.nextPurchaseQuoteNumber,
		nextPurchaseInvoiceNumber: s.nextPurchaseInvoiceNumber,
		smsBankSenders: s.smsBankSenders,
		autoLockMinutes: s.autoLockMinutes,
		lowStockThreshold: s.lowStockThreshold,
		vatRate: s.vatRate
	})
}));
var CURRENT_STORAGE_KEY = "ansar-invoice-v3";
var KNOWN_OLD_KEYS = [
	"ansar-invoice-v2",
	"ansar-invoice-v1",
	"ansar-invoice"
];
function hasRealData(state) {
	if (!state || typeof state !== "object") return false;
	return Array.isArray(state.invoices) && state.invoices.length > 0 || Array.isArray(state.products) && state.products.length > 0 || Array.isArray(state.customers) && state.customers.length > 0;
}
/**
* One-time recovery: earlier app versions used different localStorage key
* names as the data model grew (ansar-invoice-v2 -> v3). Renaming the key
* without migrating stranded anything saved under the old name — this finds
* it and copies it forward, filling in fields the old shape didn't have.
*/
function migrateLegacyData() {
	try {
		const current = window.localStorage.getItem(CURRENT_STORAGE_KEY);
		if (current) {
			if (hasRealData(JSON.parse(current)?.state)) return;
		}
		let recovered = null;
		for (const key of KNOWN_OLD_KEYS) {
			const raw = window.localStorage.getItem(key);
			if (!raw) continue;
			try {
				const parsed = JSON.parse(raw);
				if (hasRealData(parsed?.state)) {
					recovered = parsed.state;
					break;
				}
			} catch {}
		}
		if (!recovered) for (let i = 0; i < window.localStorage.length; i++) {
			const key = window.localStorage.key(i);
			if (!key || key === CURRENT_STORAGE_KEY) continue;
			const raw = window.localStorage.getItem(key);
			if (!raw) continue;
			try {
				const parsed = JSON.parse(raw);
				if (hasRealData(parsed?.state)) {
					recovered = parsed.state;
					break;
				}
			} catch {}
		}
		if (!recovered) return;
		const migrated = {
			seller: recovered.seller ?? defaultSeller,
			products: recovered.products ?? [],
			customers: recovered.customers ?? [],
			invoices: (recovered.invoices ?? []).map((i) => ({
				...i,
				kind: i.kind ?? "invoice",
				direction: i.direction ?? "sale"
			})),
			transactions: recovered.transactions ?? [],
			payments: recovered.payments ?? [],
			stockMovements: recovered.stockMovements ?? [],
			nextSaleQuoteNumber: recovered.nextSaleQuoteNumber ?? recovered.nextQuoteNumber ?? 1,
			nextSaleInvoiceNumber: recovered.nextSaleInvoiceNumber ?? recovered.nextInvoiceNumber ?? 1,
			nextPurchaseQuoteNumber: recovered.nextPurchaseQuoteNumber ?? 1,
			nextPurchaseInvoiceNumber: recovered.nextPurchaseInvoiceNumber ?? 1
		};
		window.localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify({
			state: migrated,
			version: 0
		}));
	} catch {}
}
if (typeof window !== "undefined") {
	migrateLegacyData();
	useInvoiceStore.persist.rehydrate().then(() => {
		useInvoiceStore.setState({ hydrated: true });
	});
}
function InvoicePrint({ invoice, seller }) {
	const sums = invoiceSums(invoice.items, invoice.vatRate);
	const isPurchase = invoice.direction === "purchase";
	const sellerParty = isPurchase ? invoice.customer : seller;
	const buyerParty = isPurchase ? seller : invoice.customer;
	const docLabel = (invoice.kind === "invoice" ? "فاکتور" : "پیش‌فاکتور") + " " + (isPurchase ? "خرید" : "فروش");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "invoice-print",
		className: "invoice-sheet",
		dir: "rtl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sheet-head",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sheet-meta",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							"شماره ",
							docLabel,
							": ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: toFaDigits(invoice.number) })
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["تاریخ: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: formatJalali(invoice.date) })] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [docLabel, " کالا و خدمات"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sheet-logo",
						children: [seller.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: seller.logo,
							alt: "",
							className: "mark-img"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mark",
							children: seller.name ? seller.name[0] : "؟"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mark-name",
							children: seller.name
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "box",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "box-title",
					children: "مشخصات فروشنده"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "نام شخص حقیقی / حقوقی:" }),
							" ",
							sellerParty.name
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "شماره اقتصادی:" }),
							" ",
							toFaDigits(sellerParty.economicCode || "—")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "شماره ثبت:" }),
							" ",
							toFaDigits(sellerParty.registrationNo || "—")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "شناسه ملی:" }),
							" ",
							toFaDigits(sellerParty.nationalId || "—")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "کدپستی:" }),
							" ",
							toFaDigits(sellerParty.postalCode || "—")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "تلفن:" }),
							" ",
							toFaDigits(sellerParty.phone || "—")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "span2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "نشانی:" }),
								" ",
								[
									sellerParty.province,
									sellerParty.county,
									sellerParty.city,
									sellerParty.address
								].filter(Boolean).join(" — ") || "—"
							]
						}),
						!isPurchase ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "کد رهگیری:" }),
							" ",
							toFaDigits(seller.trackingCode)
						] }) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "box",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "box-title",
					children: "مشخصات خریدار"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "نام شخص حقیقی / حقوقی:" }),
							" ",
							buyerParty.name || "—"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "شماره اقتصادی:" }),
							" ",
							toFaDigits(buyerParty.economicCode || "—")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "شماره ثبت:" }),
							" ",
							toFaDigits(buyerParty.registrationNo || "—")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "شناسه ملی:" }),
							" ",
							toFaDigits(buyerParty.nationalId || "—")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "کدپستی:" }),
							" ",
							toFaDigits(buyerParty.postalCode || "—")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "تلفن:" }),
							" ",
							toFaDigits(buyerParty.phone || "—")
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "span3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "نشانی:" }),
								" ",
								[
									buyerParty.province,
									buyerParty.county,
									buyerParty.city,
									buyerParty.address
								].filter(Boolean).join(" — ") || "—"
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "items",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "ردیف" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "کد کالا" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "شرح کالا یا خدمات" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "تعداد" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "واحد" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "مبلغ واحد (ریال)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "مبلغ کل (ریال)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "تخفیف (ریال)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "پس از تخفیف" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "مالیات و عوارض" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "جمع با مالیات" })
				] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", { children: [invoice.items.map((item, i) => {
					const t = lineTotals(item.qty, item.unitPrice, item.discount);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: toFaDigits(i + 1) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: toFaDigits(item.code) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "name",
							children: item.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: toFaDigits(item.qty) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: item.unit }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(item.unitPrice) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(t.amount) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(item.discount) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(t.afterDiscount) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(t.vat) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(t.payable) })
					] }, item.id);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "total-row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							colSpan: 3,
							children: "جمع کل"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: toFaDigits(sums.qty) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(sums.amount) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(sums.discount) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(sums.afterDiscount) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(sums.vat) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: formatRial(sums.payable) })
					]
				})] })]
			}),
			invoice.notes ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "box",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "box-title",
					children: "توضیحات"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: invoice.notes })]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "sheet-foot",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "مهر و امضای خریدار" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "مهر و امضای فروشنده" })]
			})
		]
	});
}
var items$1 = [
	{
		view: "parties",
		title: "طرف حساب‌ها",
		icon: BookUser,
		bg: "bg-[#1b3654]",
		fg: "text-[#F3EBDA]"
	},
	{
		view: "sale-invoice",
		title: "فاکتور فروش",
		icon: FilePlus2,
		bg: "bg-[#f4ead0]",
		fg: "text-[#1b3654]"
	},
	{
		view: "purchase-invoice",
		title: "فاکتور خرید",
		icon: ShoppingCart,
		bg: "bg-[#1b3654]",
		fg: "text-[#F3EBDA]"
	},
	{
		view: "sale-quote",
		title: "پیش‌فاکتور فروش",
		icon: FileMinus2,
		bg: "bg-[#f4ead0]",
		fg: "text-[#1b3654]"
	},
	{
		view: "purchase-quote",
		title: "پیش‌فاکتور خرید",
		icon: FileMinus2,
		bg: "bg-[#1b3654]",
		fg: "text-[#F3EBDA]"
	},
	{
		view: "payments",
		title: "دریافت و پرداخت",
		icon: Wallet,
		bg: "bg-[#f4ead0]",
		fg: "text-[#1b3654]"
	},
	{
		view: "inventory",
		title: "ورود و خروج کالا",
		icon: PackageSearch,
		bg: "bg-[#1b3654]",
		fg: "text-[#F3EBDA]"
	},
	{
		view: "products",
		title: "کالا و خدمات",
		icon: Package,
		bg: "bg-[#f4ead0]",
		fg: "text-[#1b3654]"
	},
	{
		view: "reports",
		title: "گزارش‌ها",
		icon: ChartColumn,
		bg: "bg-[#1b3654]",
		fg: "text-[#F3EBDA]"
	},
	{
		view: "settings",
		title: "تنظیمات",
		icon: Settings,
		bg: "bg-[#f4ead0]",
		fg: "text-[#1b3654]"
	}
];
function HomeScreen({ onNavigate }) {
	const invoices = useInvoiceStore((s) => s.invoices);
	const payments = useInvoiceStore((s) => s.payments);
	const stats = (0, import_react.useMemo)(() => {
		let sale = 0;
		let purchase = 0;
		for (const inv of invoices) {
			if (inv.kind !== "invoice") continue;
			const total = invoiceSums(inv.items, inv.vatRate).payable;
			if (inv.direction === "sale") sale += total;
			else purchase += total;
		}
		let receipt = 0;
		let payment = 0;
		for (const p of payments) if (p.direction === "receipt") receipt += p.amount;
		else payment += p.amount;
		return {
			sale,
			purchase,
			receipt,
			payment
		};
	}, [invoices, payments]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "grid grid-cols-2 gap-3 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
					icon: TrendingUp,
					color: "text-emerald-600",
					label: "فروش",
					value: stats.sale
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
					icon: TrendingDown,
					color: "text-violet-600",
					label: "خرید",
					value: stats.purchase
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
					icon: CircleArrowDown,
					color: "text-rose-600",
					label: "پرداختی",
					value: stats.payment
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatRow, {
					icon: CircleArrowUp,
					color: "text-emerald-600",
					label: "دریافتی",
					value: stats.receipt
				})
			]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm font-medium text-muted-foreground",
			children: "امور تجاری"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-3 gap-4",
			children: items$1.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => onNavigate(it.view),
				className: "flex flex-col items-center gap-2 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `grid size-16 place-items-center rounded-full ${it.bg} ${it.fg}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(it.icon, { className: "size-6" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs leading-tight text-foreground",
					children: it.title
				})]
			}, it.view))
		})] })]
	});
}
function StatRow({ icon: Icon, color, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-5 ${color}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-sm font-semibold tabular-nums",
				children: formatRial(value)
			})]
		})]
	});
}
var depth = 0;
if (typeof window !== "undefined") window.addEventListener("popstate", () => {
	if (depth > 0) depth--;
});
function pushNav(state) {
	window.history.pushState(state, "");
	depth++;
}
function navDepth() {
	return depth;
}
/**
* Makes the phone's hardware/gesture back button close an open
* dialog/sidebar/menu instead of falling through and exiting the app.
* Drop this into any component that owns an "isOpen" boolean for a
* Dialog, drawer, or dropdown — it pushes one history entry while open
* and pops it on close, from either direction (UI close button or the
* back button), without needing to touch existing setOpen(true/false)
* call sites.
*/
function useBackableOpen(isOpen, onRequestClose) {
	const pushedRef = (0, import_react.useRef)(false);
	const closingFromPopRef = (0, import_react.useRef)(false);
	const onRequestCloseRef = (0, import_react.useRef)(onRequestClose);
	onRequestCloseRef.current = onRequestClose;
	(0, import_react.useEffect)(() => {
		function onPopState() {
			if (pushedRef.current) {
				pushedRef.current = false;
				closingFromPopRef.current = true;
				onRequestCloseRef.current();
			}
		}
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);
	(0, import_react.useEffect)(() => {
		if (isOpen && !pushedRef.current) {
			pushNav({ modal: true });
			pushedRef.current = true;
		} else if (!isOpen && pushedRef.current) {
			pushedRef.current = false;
			if (closingFromPopRef.current) closingFromPopRef.current = false;
			else window.history.back();
		}
	}, [isOpen]);
}
function emptyForm(type) {
	return {
		type,
		category: type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
		amount: "",
		description: ""
	};
}
function FinancePanel() {
	const transactions = useInvoiceStore((s) => s.transactions);
	const addTransaction = useInvoiceStore((s) => s.addTransaction);
	const removeTransaction = useInvoiceStore((s) => s.removeTransaction);
	const [open, setOpen] = (0, import_react.useState)(false);
	useBackableOpen(open, () => setOpen(false));
	const [form, setForm] = (0, import_react.useState)(emptyForm("expense"));
	const totals = (0, import_react.useMemo)(() => {
		return transactions.reduce((acc, t) => {
			if (t.type === "income") acc.income += t.amount;
			else acc.expense += t.amount;
			return acc;
		}, {
			income: 0,
			expense: 0
		});
	}, [transactions]);
	function openNew(type) {
		setForm(emptyForm(type));
		setOpen(true);
	}
	function save() {
		const amount = parseAmount(form.amount);
		if (amount <= 0) {
			toast.error("مبلغ را وارد کنید");
			return;
		}
		addTransaction({
			type: form.type,
			category: form.category,
			amount,
			description: form.description,
			date: (/* @__PURE__ */ new Date()).toISOString()
		});
		toast.success(form.type === "income" ? "درآمد ثبت شد" : "هزینه ثبت شد");
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "grid gap-1 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-emerald-600",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: "جمع درآمد"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-lg font-semibold tabular-nums",
						children: [formatRial(totals.income), " ریال"]
					})]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "grid gap-1 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-rose-600",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: "جمع هزینه"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-lg font-semibold tabular-nums",
						children: [formatRial(totals.expense), " ریال"]
					})]
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "flex-1",
					onClick: () => openNew("income"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "ثبت درآمد"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: "flex-1",
					onClick: () => openNew("expense"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "ثبت هزینه"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "تراکنش‌ها" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "آخرین هزینه‌ها و درآمدهای ثبت‌شده" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "grid gap-2",
				children: transactions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-muted-foreground",
					children: "تراکنشی ثبت نشده است."
				}) : transactions.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3 rounded-xl bg-muted/70 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-medium",
							children: [t.category, t.description ? ` — ${t.description}` : ""]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: formatJalali(t.date)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: `tabular-nums text-sm font-medium ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}`,
							children: [t.type === "income" ? "+" : "−", formatRial(t.amount)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "حذف",
							onClick: () => removeTransaction(t.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})]
					})]
				}, t.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: form.type === "income" ? "ثبت درآمد" : "ثبت هزینه" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "دسته‌بندی",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm",
								value: form.category,
								onChange: (e) => setForm((f) => ({
									...f,
									category: e.target.value
								})),
								children: (form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c,
									children: c
								}, c))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "مبلغ (ریال)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								inputMode: "numeric",
								value: form.amount,
								onChange: (e) => setForm((f) => ({
									...f,
									amount: e.target.value
								})),
								placeholder: toFaDigits(0)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "توضیحات (اختیاری)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: form.description,
								onChange: (e) => setForm((f) => ({
									...f,
									description: e.target.value
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: save,
							children: "ذخیره"
						})
					]
				})] })
			})
		]
	});
}
function CustomerLedger() {
	const customers = useInvoiceStore((s) => s.customers);
	const invoices = useInvoiceStore((s) => s.invoices);
	const payments = useInvoiceStore((s) => s.payments);
	const [openId, setOpenId] = (0, import_react.useState)(null);
	useBackableOpen(!!openId, () => setOpenId(null));
	const rows = (0, import_react.useMemo)(() => customers.map((c) => ({
		customer: c,
		balance: partyBalance(invoices, payments, c.id)
	})).sort((a, b) => b.balance - a.balance), [
		customers,
		invoices,
		payments
	]);
	const openCustomer = customers.find((c) => c.id === openId) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "دفتر بدهی و بستانکاری طرف‌حساب‌ها" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "مبلغ مثبت یعنی طرف‌حساب بدهکار است" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "grid gap-2",
			children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "هنوز طرف‌حسابی ثبت نشده."
			}) : rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setOpenId(r.customer.id),
				className: "flex items-center justify-between gap-3 rounded-xl bg-muted/70 p-3 text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: r.customer.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: r.customer.phone || "—"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `tabular-nums text-sm font-semibold ${r.balance > 0 ? "text-rose-600" : r.balance < 0 ? "text-emerald-600" : "text-muted-foreground"}`,
					children: r.balance === 0 ? "تسویه" : `${formatRial(Math.abs(r.balance))} ریال ${r.balance > 0 ? "بدهکار" : "بستانکار"}`
				})]
			}, r.customer.id))
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: !!openCustomer,
			onOpenChange: (v) => !v && setOpenId(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, { children: openCustomer ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerLedgerDetail, {
				customer: openCustomer,
				onClose: () => setOpenId(null)
			}) : null })
		})]
	});
}
function CustomerLedgerDetail({ customer, onClose }) {
	const invoices = useInvoiceStore((s) => s.invoices);
	const payments = useInvoiceStore((s) => s.payments);
	const addPayment = useInvoiceStore((s) => s.addPayment);
	const removePayment = useInvoiceStore((s) => s.removePayment);
	const [direction, setDirection] = (0, import_react.useState)("receipt");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const balance = partyBalance(invoices, payments, customer.id);
	const customerPayments = payments.filter((p) => p.customerId === customer.id).sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
	function save() {
		const value = parseAmount(amount);
		if (value <= 0) {
			toast.error("مبلغ را وارد کنید");
			return;
		}
		addPayment({
			customerId: customer.id,
			amount: value,
			direction,
			note,
			date: (/* @__PURE__ */ new Date()).toISOString()
		});
		toast.success("ثبت شد");
		setAmount("");
		setNote("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: customer.name }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-muted/70 p-3 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "مانده حساب"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: `text-lg font-semibold tabular-nums ${balance > 0 ? "text-rose-600" : balance < 0 ? "text-emerald-600" : ""}`,
					children: balance === 0 ? "تسویه" : `${formatRial(Math.abs(balance))} ریال ${balance > 0 ? "بدهکار" : "بستانکار"}`
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: direction === "receipt" ? "default" : "outline",
							className: "flex-1",
							onClick: () => setDirection("receipt"),
							children: "دریافت از طرف‌حساب"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: direction === "payment" ? "default" : "outline",
							className: "flex-1",
							onClick: () => setDirection("payment"),
							children: "پرداخت به طرف‌حساب"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "مبلغ (ریال)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							inputMode: "numeric",
							value: amount,
							onChange: (e) => setAmount(e.target.value),
							placeholder: toFaDigits(0)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "توضیحات (اختیاری)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: note,
							onChange: (e) => setNote(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: save,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "ثبت تراکنش"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "تاریخچه تراکنش‌ها"
				}), customerPayments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-4 text-center text-sm text-muted-foreground",
					children: "تراکنشی ثبت نشده."
				}) : customerPayments.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 rounded-xl bg-muted/70 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [p.direction === "receipt" ? "دریافت" : "پرداخت", p.note ? ` — ${p.note}` : ""]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: formatJalali(p.date)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums text-sm font-medium",
							children: formatRial(p.amount)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "حذف",
							onClick: () => removePayment(p.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})]
					})]
				}, p.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				onClick: onClose,
				children: "بستن"
			})
		]
	});
}
var JALALI_MONTHS = [
	"فروردین",
	"اردیبهشت",
	"خرداد",
	"تیر",
	"مرداد",
	"شهریور",
	"مهر",
	"آبان",
	"آذر",
	"دی",
	"بهمن",
	"اسفند"
];
function ReportsPanel() {
	const invoices = useInvoiceStore((s) => s.invoices);
	const transactions = useInvoiceStore((s) => s.transactions);
	const currentYear = gregorianToJalali(/* @__PURE__ */ new Date()).y;
	const [year, setYear] = (0, import_react.useState)(currentYear);
	const years = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set([currentYear]);
		invoices.forEach((i) => set.add(gregorianToJalali(new Date(i.date)).y));
		transactions.forEach((t) => set.add(gregorianToJalali(new Date(t.date)).y));
		return Array.from(set).sort((a, b) => b - a);
	}, [
		invoices,
		transactions,
		currentYear
	]);
	const monthly = (0, import_react.useMemo)(() => {
		const rows = JALALI_MONTHS.map((name, idx) => ({
			month: name,
			m: idx + 1,
			income: 0,
			expense: 0
		}));
		for (const inv of invoices) {
			if (inv.kind !== "invoice") continue;
			const j = gregorianToJalali(new Date(inv.date));
			if (j.y !== year) continue;
			const total = invoiceSums(inv.items, inv.vatRate).payable;
			if (inv.direction === "sale") rows[j.m - 1].income += total;
			else rows[j.m - 1].expense += total;
		}
		for (const t of transactions) {
			const j = gregorianToJalali(new Date(t.date));
			if (j.y !== year) continue;
			if (t.type === "income") rows[j.m - 1].income += t.amount;
			else rows[j.m - 1].expense += t.amount;
		}
		return rows;
	}, [
		invoices,
		transactions,
		year
	]);
	const totals = monthly.reduce((acc, r) => {
		acc.income += r.income;
		acc.expense += r.expense;
		return acc;
	}, {
		income: 0,
		expense: 0
	});
	const profit = totals.income - totals.expense;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "گزارش مالی" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "فروش/خرید (فاکتور نهایی) + تراکنش‌های دستی" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center gap-1",
				children: years.slice(0, 3).map((y) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: y === year ? "default" : "outline",
					onClick: () => setYear(y),
					children: toFaDigits(y)
				}, y))
			})]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "grid gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-64 w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: monthly,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
								strokeDasharray: "3 3",
								vertical: false
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "month",
								fontSize: 11,
								interval: 0,
								angle: -35,
								textAnchor: "end",
								height: 50
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
								fontSize: 11,
								tickFormatter: (v) => toFaDigits(v)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
								formatter: (value) => `${formatRial(value)} ریال`,
								labelFormatter: (label) => label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Legend, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "income",
								name: "درآمد",
								fill: "#059669",
								radius: [
									4,
									4,
									0,
									0
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "expense",
								name: "هزینه",
								fill: "#e11d48",
								radius: [
									4,
									4,
									0,
									0
								]
							})
						]
					})
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-muted/70 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "درآمد سال"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-semibold tabular-nums text-emerald-600",
							children: formatRial(totals.income)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-muted/70 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "هزینه سال"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm font-semibold tabular-nums text-rose-600",
							children: formatRial(totals.expense)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-muted/70 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "سود خالص"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-1 text-sm font-semibold tabular-nums ${profit >= 0 ? "text-emerald-600" : "text-rose-600"}`,
							children: formatRial(profit)
						})]
					})
				]
			})]
		})] })
	});
}
function InventoryPanel() {
	const products = useInvoiceStore((s) => s.products);
	const movements = useInvoiceStore((s) => s.stockMovements);
	const addStockMovement = useInvoiceStore((s) => s.addStockMovement);
	const removeStockMovement = useInvoiceStore((s) => s.removeStockMovement);
	const [productId, setProductId] = (0, import_react.useState)(products[0]?.id ?? "");
	const [direction, setDirection] = (0, import_react.useState)("in");
	const [qty, setQty] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const stockByProduct = (0, import_react.useMemo)(() => products.map((p) => ({
		product: p,
		stock: productStock(movements, p.id)
	})), [products, movements]);
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
		addStockMovement({
			productId,
			direction,
			qty: q,
			note,
			date: (/* @__PURE__ */ new Date()).toISOString()
		});
		toast.success(direction === "in" ? "ورود کالا ثبت شد" : "خروج کالا ثبت شد");
		setQty("");
		setNote("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "موجودی انبار" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "موجودی فعلی هر کالا" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "grid gap-2",
				children: stockByProduct.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-6 text-center text-sm text-muted-foreground",
					children: "ابتدا از بخش «کالا و خدمات» کالا اضافه کنید."
				}) : stockByProduct.map(({ product, stock }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-xl bg-muted/70 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: product.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: `tabular-nums text-sm font-semibold ${stock < 0 ? "text-rose-600" : ""}`,
						children: [
							toFaDigits(stock),
							" ",
							product.unit
						]
					})]
				}, product.id))
			})] }),
			products.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "ثبت ورود / خروج کالا" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: direction === "in" ? "default" : "outline",
							className: "flex-1",
							onClick: () => setDirection("in"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowDown, { className: "size-4" }), "ورود کالا"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: direction === "out" ? "default" : "outline",
							className: "flex-1",
							onClick: () => setDirection("out"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowUp, { className: "size-4" }), "خروج کالا"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "کالا",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm",
							value: productId,
							onChange: (e) => setProductId(e.target.value),
							children: products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: p.id,
								children: p.name
							}, p.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "تعداد",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							inputMode: "numeric",
							value: qty,
							onChange: (e) => setQty(e.target.value),
							placeholder: toFaDigits(0)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "توضیحات (اختیاری)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: note,
							onChange: (e) => setNote(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: save,
						children: "ثبت"
					})
				]
			})] }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "تاریخچه" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "grid gap-2",
				children: movements.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-6 text-center text-sm text-muted-foreground",
					children: "تراکنش انباری ثبت نشده."
				}) : movements.map((m) => {
					const product = products.find((p) => p.id === m.productId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 rounded-xl bg-muted/70 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-medium",
								children: [product?.name ?? "کالای حذف‌شده", m.note ? ` — ${m.note}` : ""]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: formatJalali(m.date)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `tabular-nums text-sm font-medium ${m.direction === "in" ? "text-emerald-600" : "text-rose-600"}`,
								children: [m.direction === "in" ? "+" : "−", toFaDigits(m.qty)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "حذف",
								onClick: () => removeStockMovement(m.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						})]
					}, m.id);
				})
			})] })
		]
	});
}
function PaymentsPanel() {
	const customers = useInvoiceStore((s) => s.customers);
	const payments = useInvoiceStore((s) => s.payments);
	const addPayment = useInvoiceStore((s) => s.addPayment);
	const removePayment = useInvoiceStore((s) => s.removePayment);
	const [open, setOpen] = (0, import_react.useState)(false);
	useBackableOpen(open, () => setOpen(false));
	const [customerId, setCustomerId] = (0, import_react.useState)(customers[0]?.id ?? "");
	const [direction, setDirection] = (0, import_react.useState)("receipt");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	function openNew(dir) {
		setDirection(dir);
		setCustomerId(customers[0]?.id ?? "");
		setAmount("");
		setNote("");
		setOpen(true);
	}
	function save() {
		if (!customerId) {
			toast.error("ابتدا یک طرف‌حساب اضافه کنید");
			return;
		}
		const value = parseAmount(amount);
		if (value <= 0) {
			toast.error("مبلغ را وارد کنید");
			return;
		}
		addPayment({
			customerId,
			amount: value,
			direction,
			note,
			date: (/* @__PURE__ */ new Date()).toISOString()
		});
		toast.success("ثبت شد");
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "flex-1",
					onClick: () => openNew("receipt"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowUp, { className: "size-4" }), "دریافت وجه"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: "flex-1",
					onClick: () => openNew("payment"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleArrowDown, { className: "size-4" }), "پرداخت وجه"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "دریافت و پرداخت" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "همه‌ی تراکنش‌های نقدی با طرف‌حساب‌ها" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "grid gap-2",
				children: payments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-8 text-center text-sm text-muted-foreground",
					children: "تراکنشی ثبت نشده."
				}) : payments.map((p) => {
					const customer = customers.find((c) => c.id === p.customerId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-3 rounded-xl bg-muted/70 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm font-medium",
								children: [
									p.direction === "receipt" ? "دریافت از" : "پرداخت به",
									" ",
									customer?.name ?? "طرف‌حساب حذف‌شده"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [formatJalali(p.date), p.note ? ` — ${p.note}` : ""]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `tabular-nums text-sm font-medium ${p.direction === "receipt" ? "text-emerald-600" : "text-rose-600"}`,
								children: [p.direction === "receipt" ? "+" : "−", formatRial(p.amount)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "حذف",
								onClick: () => removePayment(p.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})]
						})]
					}, p.id);
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: direction === "receipt" ? "دریافت وجه" : "پرداخت وجه" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "طرف‌حساب",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm",
								value: customerId,
								onChange: (e) => setCustomerId(e.target.value),
								children: customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.name
								}, c.id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "مبلغ (ریال)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								inputMode: "numeric",
								value: amount,
								onChange: (e) => setAmount(e.target.value),
								placeholder: toFaDigits(0)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "توضیحات (اختیاری)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: note,
								onChange: (e) => setNote(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: save,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "ثبت"]
						})
					]
				})] })
			})
		]
	});
}
var items = [
	{
		view: "business",
		title: "نام کسب‌وکار",
		description: "مشخصات فروشنده که روی سند چاپ می‌شود",
		icon: Building2
	},
	{
		view: "invoice",
		title: "تنظیمات فاکتور",
		description: "اطلاعات پیش‌فرض چاپ فاکتور و پیش‌فاکتور",
		icon: FileCog
	},
	{
		view: "software",
		title: "تنظیمات نرم‌افزار",
		description: "تنظیمات عمومی برنامه",
		icon: SlidersHorizontal
	}
];
function SettingsHub({ onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3",
		children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			role: "button",
			tabIndex: 0,
			className: "cursor-pointer",
			onClick: () => onOpen(it.view),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex items-center gap-3 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-11 place-items-center rounded-xl bg-primary/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(it.icon, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: it.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: it.description
					})]
				})]
			})
		}, it.view))
	});
}
var AMOUNT_RE = /([\d,٬]{4,})\s?(ریال|تومان)/;
var CREDIT_WORDS = [
	"واریز",
	"افزایش موجودی",
	"به حساب شما"
];
var DEBIT_WORDS = [
	"برداشت",
	"خرید",
	"کسر",
	"پرداخت شد",
	"انتقال از حساب شما"
];
var BANK_SENDER_HINTS = [
	"بانک",
	"melli",
	"saman",
	"bmi",
	"sep",
	"پارسیان",
	"ملت",
	"سامان",
	"صادرات"
];
/**
* Loose heuristic for which SMS are worth parsing. If the user has
* registered specific bank sender numbers/names in settings, only those
* match — precise and avoids picking up unrelated messages. With nothing
* registered yet, falls back to a generic keyword guess so the feature
* still works before that one-time setup.
*/
function looksLikeBankSms(address, body, registeredSenders = []) {
	if (registeredSenders.length > 0) {
		const addr = address.toLowerCase();
		return registeredSenders.some((s) => addr.includes(s.trim().toLowerCase()));
	}
	const hay = `${address} ${body}`.toLowerCase();
	return BANK_SENDER_HINTS.some((h) => hay.includes(h.toLowerCase())) || AMOUNT_RE.test(body);
}
function parseBankSms(body, date) {
	const m = body.match(AMOUNT_RE);
	if (!m) return null;
	const digits = m[1].replace(/[,٬]/g, "");
	let amount = Number(digits);
	if (!amount) return null;
	if (m[2] === "تومان") amount *= 10;
	const isCredit = CREDIT_WORDS.some((w) => body.includes(w));
	const isDebit = DEBIT_WORDS.some((w) => body.includes(w));
	return {
		amount,
		direction: isCredit && !isDebit ? "receipt" : "payment",
		raw: body,
		date
	};
}
var SmsReader = registerPlugin("SmsReader");
function SmsImportPanel() {
	const isNative = Capacitor.isNativePlatform();
	const customers = useInvoiceStore((s) => s.customers);
	const addPayment = useInvoiceStore((s) => s.addPayment);
	const smsBankSenders = useInvoiceStore((s) => s.smsBankSenders);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [candidates, setCandidates] = (0, import_react.useState)([]);
	async function loadMessages() {
		setLoading(true);
		try {
			if (!(await SmsReader.requestSmsPermission()).granted) {
				toast.error("اجازه‌ی خواندن پیامک داده نشد");
				return;
			}
			const { messages } = await SmsReader.readMessages({ limit: 300 });
			const parsed = [];
			for (const msg of messages) {
				if (!looksLikeBankSms(msg.address, msg.body, smsBankSenders)) continue;
				const p = parseBankSms(msg.body, msg.date);
				if (p) parsed.push({
					...p,
					id: `${msg.date}-${p.amount}`,
					customerId: customers[0]?.id ?? ""
				});
			}
			setCandidates(parsed);
			if (parsed.length === 0) toast.error("پیامک بانکی قابل‌تشخیصی پیدا نشد");
		} catch (e) {
			toast.error("خواندن پیامک‌ها با خطا مواجه شد");
		} finally {
			setLoading(false);
		}
	}
	function setCandidateParty(id, customerId) {
		setCandidates((cs) => cs.map((c) => c.id === id ? {
			...c,
			customerId
		} : c));
	}
	function addToLedger(c) {
		if (!c.customerId) {
			toast.error("یک طرف‌حساب انتخاب کنید");
			return;
		}
		addPayment({
			customerId: c.customerId,
			amount: c.amount,
			direction: c.direction,
			note: "از پیامک بانکی",
			date: new Date(c.date).toISOString()
		});
		setCandidates((cs) => cs.filter((x) => x.id !== c.id));
		toast.success("ثبت شد");
	}
	if (!isNative) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "grid gap-3 p-6 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "mx-auto size-8 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "این بخش فقط داخل نسخه‌ی نصب‌شده‌ی اندروید کار می‌کند، نه در مرورگر — چون خواندن پیامک نیاز به دسترسی سیستم‌عامل دارد."
		})]
	}) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			smsBankSenders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-muted/70 p-3 text-xs text-muted-foreground",
				children: "هنوز شماره‌ی بانکی ثبت نکرده‌اید — از تنظیمات ← تنظیمات نرم‌افزار شماره‌ی پیامک‌های بانکی خود را اضافه کنید تا تنها همان‌ها خوانده شود. در حال حاضر با حدسی کلی‌تر جست‌وجو می‌شود."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: loadMessages,
				disabled: loading,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "size-4" }), loading ? "در حال خواندن..." : "خواندن پیامک‌های بانکی"]
			}),
			candidates.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "موارد پیشنهادی" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "طرف‌حساب را انتخاب کنید و به دفتر اضافه کنید" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "grid gap-3",
				children: candidates.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-2 rounded-xl bg-muted/70 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `text-sm font-semibold tabular-nums ${c.direction === "receipt" ? "text-emerald-600" : "text-rose-600"}`,
								children: [c.direction === "receipt" ? "+" : "−", formatRial(c.amount)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: new Date(c.date).toLocaleDateString("fa-IR")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: c.raw
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "h-9 flex-1 rounded-md border border-input bg-card px-2 text-sm",
								value: c.customerId,
								onChange: (e) => setCandidateParty(c.id, e.target.value),
								children: customers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: p.id,
									children: p.name
								}, p.id))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								onClick: () => addToLedger(c),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "افزودن"]
							})]
						})
					]
				}, c.id))
			})] }) : null
		]
	});
}
var APP_VERSION = "2.6.0";
function LoginScreen() {
	const [mode, setMode] = (0, import_react.useState)("login");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [notice, setNotice] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submitLogin(e) {
		e.preventDefault();
		setError("");
		setBusy(true);
		try {
			const res = await authClient.signIn.email({
				email,
				password
			});
			if (res.error) {
				console.error("[login] sign-in failed:", res.error);
				setError(res.error.message ?? "ایمیل یا رمز عبور اشتباه است");
			}
		} catch (err) {
			console.error("[login] sign-in threw:", err);
			setError(err instanceof Error ? err.message : "ورود ناموفق بود");
		} finally {
			setBusy(false);
		}
	}
	async function submitBootstrap(e) {
		e.preventDefault();
		setError("");
		setBusy(true);
		try {
			await bootstrapSignUp({ data: {
				email,
				password,
				name: name || email
			} });
			setNotice("حساب مدیر با موفقیت ایجاد شد — اکنون با همین ایمیل و رمز عبور وارد شوید.");
			setMode("login");
			setPassword("");
		} catch (err) {
			console.error("[bootstrap] sign-up threw:", err);
			const message = err instanceof Error ? err.message : "";
			if (message === "already-initialized") {
				setError("حساب مدیر پیش‌تر ایجاد شده است — از طریق پیوند زیر وارد شوید. در صورت فراموشی رمز عبور، لازم است آن را از طریق پنل Neon حذف کنید.");
				setMode("login");
			} else setError(message || "ثبت‌نام ناموفق بود");
		} finally {
			setBusy(false);
		}
	}
	async function submitForgot(e) {
		e.preventDefault();
		setError("");
		setBusy(true);
		try {
			await authClient.forgetPassword({
				email,
				redirectTo: "/reset-password"
			});
			setNotice("در صورتی که این ایمیل در سامانه ثبت شده باشد، پیوند بازیابی برای آن ارسال شد.");
			setMode("login");
		} catch (err) {
			setError(err instanceof Error ? err.message : "ارسال پیوند بازیابی ناموفق بود");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto mb-3 grid size-16 place-items-center rounded-2xl bg-[#1b3654] text-2xl font-bold text-[#C9A24B]",
							children: "د"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-xl font-semibold",
							children: "دیوان"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "سامانه جامع حسابداری"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: mode === "bootstrap" ? "راه‌اندازی اولیه" : mode === "forgot" ? "بازیابی رمز" : "ورود" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: mode === "bootstrap" ? "ایجاد حساب مدیر — این مرحله تنها برای نخستین اجرای برنامه لازم است" : mode === "forgot" ? "نشانی ایمیل حساب کاربری خود را وارد کنید تا پیوند بازیابی ارسال شود" : "برای دسترسی به اطلاعات، وارد شوید" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: mode === "bootstrap" ? submitBootstrap : mode === "forgot" ? submitForgot : submitLogin,
						className: "grid gap-3",
						children: [
							mode === "bootstrap" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "نام",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "pr-9",
										value: name,
										onChange: (e) => setName(e.target.value)
									})]
								})
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "ایمیل",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "pr-9",
										type: "email",
										dir: "ltr",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										autoComplete: "username"
									})]
								})
							}),
							mode === "forgot" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "رمز عبور",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "pr-9",
										type: "password",
										dir: "ltr",
										value: password,
										onChange: (e) => setPassword(e.target.value),
										autoComplete: mode === "bootstrap" ? "new-password" : "current-password"
									})]
								})
							}),
							notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-emerald-600",
								children: notice
							}) : null,
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "break-words text-sm text-rose-600",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "mt-1",
								disabled: busy,
								children: busy ? "..." : mode === "bootstrap" ? "ایجاد حساب مدیر" : mode === "forgot" ? "ارسال پیوند بازیابی" : "ورود"
							})
						]
					}),
					mode === "login" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-3 w-full text-center text-xs text-muted-foreground underline",
						onClick: () => {
							setError("");
							setNotice("");
							setMode("forgot");
						},
						children: "رمز عبور را فراموش کرده‌ام"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "mt-3 w-full text-center text-xs text-muted-foreground underline",
						onClick: () => {
							setError("");
							setNotice("");
							setMode(mode === "login" ? "bootstrap" : "login");
						},
						children: mode === "login" ? "نخستین اجرای برنامه است؟ ایجاد حساب مدیر" : "حساب کاربری از پیش ایجاد شده است؟ ورود"
					})
				] })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-center text-xs text-muted-foreground",
					children: ["نسخه ", APP_VERSION]
				})
			]
		})
	});
}
function BootScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-4 bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid size-16 place-items-center rounded-2xl bg-[#1b3654] text-2xl font-bold text-[#C9A24B] animate-pulse",
			children: "د"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "در حال آماده‌سازی..."
		})]
	});
}
var loadAppState = createServerFn({ method: "GET" }).handler(createSsrRpc("0244aaadd752b789a7be94330db00752dfe41b1e8ac0e631be025f7fd436467c"));
var saveAppState = createServerFn({ method: "POST" }).validator((data) => data).handler(createSsrRpc("d1df9cf16fd5c4b3ca8f9cdaea8d91920fd8e94392b197f1239f6369d0b323b0"));
/**
* Phase 3 of the sync plan: mirrors the same fields already saved to
* localStorage (see store.ts's `partialize`) up to the Postgres app_state
* row, debounced, and pulls the latest snapshot down once per session so a
* second device picks up changes made elsewhere. Deliberately simple
* "last write wins" — fine for one business used from a small number of
* devices that aren't editing at the exact same moment; it is not a
* conflict-resolving sync.
*/
var SYNCED_KEYS = [
	"seller",
	"products",
	"customers",
	"invoices",
	"transactions",
	"payments",
	"stockMovements",
	"nextSaleQuoteNumber",
	"nextSaleInvoiceNumber",
	"nextPurchaseQuoteNumber",
	"nextPurchaseInvoiceNumber",
	"smsBankSenders",
	"autoLockMinutes",
	"lowStockThreshold",
	"vatRate"
];
function snapshot(state) {
	const out = {};
	for (const key of SYNCED_KEYS) out[key] = state[key];
	return out;
}
var status = "idle";
var statusListeners = /* @__PURE__ */ new Set();
function setStatus(next) {
	status = next;
	statusListeners.forEach((listener) => listener(next));
}
/** Lets a small UI indicator show sync status without wiring this into zustand. */
function subscribeSyncStatus(fn) {
	statusListeners.add(fn);
	fn(status);
	return () => {
		statusListeners.delete(fn);
	};
}
var pendingSnapshot = null;
var retryTimer = null;
async function attemptSave(data) {
	setStatus("syncing");
	try {
		await saveAppState({ data });
		pendingSnapshot = null;
		setStatus("idle");
	} catch (err) {
		console.error("[sync] failed to save remote state:", err);
		pendingSnapshot = data;
		setStatus(typeof navigator !== "undefined" && !navigator.onLine ? "offline" : "error");
		scheduleRetry();
	}
}
function scheduleRetry() {
	if (retryTimer) return;
	retryTimer = window.setTimeout(() => {
		retryTimer = null;
		if (pendingSnapshot) attemptSave(pendingSnapshot);
	}, 15e3);
}
function onOnline() {
	if (pendingSnapshot) attemptSave(pendingSnapshot);
}
var unsubscribe = null;
var saveTimer = null;
var running = false;
async function startServerSync() {
	if (running) return;
	running = true;
	window.addEventListener("online", onOnline);
	try {
		const remote = await loadAppState();
		if (remote && remote.data && typeof remote.data === "object") useInvoiceStore.setState(remote.data);
	} catch (err) {
		console.error("[sync] failed to load remote state:", err);
	}
	unsubscribe = useInvoiceStore.subscribe((state) => {
		if (saveTimer) window.clearTimeout(saveTimer);
		saveTimer = window.setTimeout(() => {
			attemptSave(snapshot(state));
		}, 1500);
	});
}
function stopServerSync() {
	running = false;
	window.removeEventListener("online", onOnline);
	unsubscribe?.();
	unsubscribe = null;
	if (saveTimer) {
		window.clearTimeout(saveTimer);
		saveTimer = null;
	}
	if (retryTimer) {
		window.clearTimeout(retryTimer);
		retryTimer = null;
	}
	pendingSnapshot = null;
	setStatus("idle");
}
/** Small, quiet indicator — only shows up when something's worth flagging. */
function SyncStatusBadge() {
	const [status, setStatus] = (0, import_react.useState)("idle");
	(0, import_react.useEffect)(() => subscribeSyncStatus(setStatus), []);
	if (status === "idle" || status === "syncing") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex items-center justify-center gap-1.5 border-b border-border bg-amber-50 px-3 py-1.5 text-xs text-amber-800",
		children: status === "offline" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudOff, { className: "size-3.5" }), "آفلاین — تغییرات با اتصال بعدی ذخیره می‌شود"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), "ذخیره‌سازی ناموفق بود — در حال تلاش مجدد"] })
	});
}
var GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || "";
var backupToDrive = async (data) => {
	console.log("Backing up to Google Drive...", data);
	return Promise.resolve(true);
};
var NativePrint = registerPlugin("NativePrint");
var DOC_VIEWS = {
	"sale-quote": {
		kind: "quote",
		direction: "sale"
	},
	"sale-invoice": {
		kind: "invoice",
		direction: "sale"
	},
	"purchase-quote": {
		kind: "quote",
		direction: "purchase"
	},
	"purchase-invoice": {
		kind: "invoice",
		direction: "purchase"
	}
};
function docView(kind, direction) {
	return `${direction}-${kind}`;
}
var VIEW_TITLES = {
	"sale-quote": "پیش‌فاکتور فروش",
	"sale-invoice": "فاکتور فروش",
	"purchase-quote": "پیش‌فاکتور خرید",
	"purchase-invoice": "فاکتور خرید",
	products: "کالا و خدمات",
	parties: "طرف حساب‌ها",
	history: "سوابق اسناد",
	finance: "هزینه‌ها و درآمدها",
	ledger: "بدهی و بستانکاری",
	payments: "دریافت و پرداخت",
	inventory: "ورود و خروج کالا",
	reports: "گزارش‌ها",
	"sms-import": "وارد کردن از پیامک بانکی",
	settings: "تنظیمات",
	"settings-business": "نام کسب‌وکار",
	"settings-invoice": "تنظیمات فاکتور",
	"settings-software": "تنظیمات نرم‌افزار"
};
var SIDEBAR_ITEMS = [
	{
		view: "parties",
		title: "طرف حساب‌ها",
		icon: BookUser
	},
	{
		view: "products",
		title: "کالا و خدمات",
		icon: Package
	},
	{
		view: "inventory",
		title: "ورود و خروج کالا",
		icon: PackageSearch
	},
	{
		view: "payments",
		title: "دریافت و پرداخت",
		icon: Wallet
	},
	{
		view: "ledger",
		title: "بدهی و بستانکاری",
		icon: BookUser
	},
	{
		view: "finance",
		title: "هزینه‌ها و درآمدها",
		icon: Wallet
	},
	{
		view: "reports",
		title: "گزارش‌ها",
		icon: ChartColumn
	},
	{
		view: "sms-import",
		title: "وارد کردن از پیامک بانکی",
		icon: Inbox
	},
	{
		view: "history",
		title: "سوابق اسناد",
		icon: Printer
	},
	{
		view: "settings",
		title: "تنظیمات",
		icon: Settings
	}
];
var emptyProduct = () => ({
	code: "",
	name: "",
	unit: "عدد",
	unitPrice: 0
});
var emptyCustomer = () => ({
	name: "",
	nationalId: "",
	economicCode: "",
	registrationNo: "",
	postalCode: "",
	phone: "",
	province: "",
	county: "",
	city: "",
	address: ""
});
function InvoiceApp() {
	const { data: session, isPending: sessionPending } = useSession();
	const isAuthenticated = !!session;
	const hydrated = useInvoiceStore((s) => s.hydrated);
	const autoLockMinutes = useInvoiceStore((s) => s.autoLockMinutes);
	(0, import_react.useEffect)(() => {
		if (isAuthenticated) startServerSync();
		else stopServerSync();
	}, [isAuthenticated]);
	const [view, setView] = (0, import_react.useState)("home");
	const [sidebarOpen, setSidebarOpen] = (0, import_react.useState)(false);
	const [menuOpen, setMenuOpen] = (0, import_react.useState)(false);
	useBackableOpen(sidebarOpen, () => setSidebarOpen(false));
	useBackableOpen(menuOpen, () => setMenuOpen(false));
	const [printInvoice, setPrintInvoice] = (0, import_react.useState)(null);
	const [printFormat, setPrintFormat] = (0, import_react.useState)("A4");
	const [pendingPrint, setPendingPrint] = (0, import_react.useState)(null);
	useBackableOpen(!!pendingPrint, () => setPendingPrint(null));
	const [shouldPrint, setShouldPrint] = (0, import_react.useState)(false);
	const seller = useInvoiceStore((s) => s.seller);
	const startNewDocument = useInvoiceStore((s) => s.startNewDocument);
	(0, import_react.useEffect)(() => {
		useInvoiceStore.persist.rehydrate();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!shouldPrint || !printInvoice) return;
		const id = window.setTimeout(() => {
			if (Capacitor.isNativePlatform()) NativePrint.printPage();
			else window.print();
			setShouldPrint(false);
		}, 50);
		return () => window.clearTimeout(id);
	}, [shouldPrint, printInvoice]);
	const pendingNavRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		window.history.replaceState({ view: "home" }, "");
		function onPopState(e) {
			setSidebarOpen(false);
			setMenuOpen(false);
			if (pendingNavRef.current) {
				const next = pendingNavRef.current;
				pendingNavRef.current = null;
				goTo(next);
				return;
			}
			setView(e.state?.view ?? "home");
		}
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!Capacitor.isNativePlatform()) return;
		const handle = App.addListener("backButton", () => {
			if (navDepth() > 0) window.history.back();
			else App.exitApp();
		});
		return () => {
			handle.then((h) => h.remove());
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isAuthenticated || autoLockMinutes <= 0) return;
		let timer;
		function reset() {
			window.clearTimeout(timer);
			timer = window.setTimeout(() => void signOut(), autoLockMinutes * 60 * 1e3);
		}
		const events = [
			"click",
			"touchstart",
			"keydown"
		];
		events.forEach((ev) => window.addEventListener(ev, reset));
		reset();
		return () => {
			window.clearTimeout(timer);
			events.forEach((ev) => window.removeEventListener(ev, reset));
		};
	}, [isAuthenticated, autoLockMinutes]);
	function goTo(next) {
		pushNav({ view: next });
		setView(next);
	}
	function goBack() {
		window.history.back();
	}
	function requestPrint(invoice) {
		setPendingPrint(invoice);
	}
	function runPrint(format) {
		if (!pendingPrint) return;
		setPrintFormat(format);
		setPrintInvoice(pendingPrint);
		setPendingPrint(null);
		setShouldPrint(true);
	}
	function navigate(next) {
		const doc = DOC_VIEWS[next];
		if (doc) startNewDocument(doc.kind, doc.direction);
		if (sidebarOpen) {
			pendingNavRef.current = next;
			setSidebarOpen(false);
		} else goTo(next);
	}
	if (!hydrated || sessionPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {});
	if (!isAuthenticated) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginScreen, {});
	const doc = DOC_VIEWS[view];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "no-print border-b border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "منو",
								onClick: () => setSidebarOpen(true),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
							})
						}),
						view === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium tracking-wide text-muted-foreground",
								children: "سامانه جامع حسابداری"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-xl font-semibold text-balance",
								children: "دیوان"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-base font-semibold text-balance",
							children: VIEW_TITLES[view]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex items-center gap-1",
							children: [view === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "گزینه‌های بیشتر",
								onClick: () => setMenuOpen((v) => !v),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "size-5" })
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "بازگشت",
								onClick: goBack,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-5" })
							}), menuOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								"aria-label": "بستن",
								className: "fixed inset-0 z-40 cursor-default",
								onClick: () => setMenuOpen(false)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "absolute left-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-xl border border-border bg-card shadow-lg",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => {
										setMenuOpen(false);
										signOut();
									},
									className: "flex w-full items-center gap-2 px-3 py-2.5 text-sm text-rose-600 hover:bg-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), "خروج"]
								})
							})] }) : null]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncStatusBadge, {}),
			sidebarOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "no-print fixed inset-0 z-50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					"aria-label": "بستن منو",
					className: "absolute inset-0 bg-black/40",
					onClick: () => setSidebarOpen(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "absolute inset-y-0 right-0 flex h-full w-72 max-w-[80vw] flex-col bg-card px-3 py-4 shadow-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between px-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: "منوی دیوان"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": "بستن",
								onClick: () => setSidebarOpen(false),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									pendingNavRef.current = "home";
									setSidebarOpen(false);
								},
								className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-9 place-items-center rounded-lg bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-4" })
								}), "صفحه اصلی"]
							}), SIDEBAR_ITEMS.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => navigate(it.view),
								className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-9 place-items-center rounded-lg bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(it.icon, { className: "size-4" })
								}), it.title]
							}, it.view))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-auto pt-4 text-center text-xs text-muted-foreground",
							children: ["نسخه ", APP_VERSION]
						})
					]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "no-print mx-auto max-w-6xl px-4 py-5 pb-24",
				children: [
					view === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeScreen, { onNavigate: navigate }) : null,
					doc ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Composer, {
						kind: doc.kind,
						direction: doc.direction,
						onPrint: requestPrint,
						onDone: () => goTo("home")
					}) : null,
					view === "products" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductManager, {}) : null,
					view === "parties" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerManager, {}) : null,
					view === "history" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPanel, {
						onOpen: (kind, direction) => goTo(docView(kind, direction)),
						onPrint: requestPrint
					}) : null,
					view === "finance" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinancePanel, {}) : null,
					view === "ledger" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerLedger, {}) : null,
					view === "payments" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentsPanel, {}) : null,
					view === "inventory" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InventoryPanel, {}) : null,
					view === "reports" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsPanel, {}) : null,
					view === "sms-import" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SmsImportPanel, {}) : null,
					view === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsHub, { onOpen: (v) => goTo(`settings-${v}`) }) : null,
					view === "settings-business" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BusinessSettingsPanel, {}) : null,
					view === "settings-invoice" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceSettingsPanel, {}) : null,
					view === "settings-software" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SoftwareSettingsPanel, {}) : null
				]
			}),
			printInvoice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `print-only ${printFormat === "A5" ? "format-a5" : ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoicePrint, {
					invoice: printInvoice,
					seller,
					format: printFormat
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!pendingPrint,
				onOpenChange: (v) => !v && setPendingPrint(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "قالب چاپ" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "اندازه‌ی کاغذ را برای چاپ یا خروجی PDF انتخاب کنید" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => runPrint("A4"),
						className: "rounded-xl border border-border p-4 text-center hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: "A4"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "استاندارد"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => runPrint("A5"),
						className: "rounded-xl border border-border p-4 text-center hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: "A5"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "کوچک"
						})]
					})]
				})] })
			})
		]
	});
}
function Composer({ kind, direction, onPrint, onDone }) {
	const draft = useInvoiceStore((s) => s.draft);
	const products = useInvoiceStore((s) => s.products);
	const customers = useInvoiceStore((s) => s.customers);
	const viewingId = useInvoiceStore((s) => s.viewingId);
	const setDraftCustomer = useInvoiceStore((s) => s.setDraftCustomer);
	const applyCustomer = useInvoiceStore((s) => s.applyCustomer);
	const addDraftItem = useInvoiceStore((s) => s.addDraftItem);
	const updateDraftItem = useInvoiceStore((s) => s.updateDraftItem);
	const removeDraftItem = useInvoiceStore((s) => s.removeDraftItem);
	const setDraftNotes = useInvoiceStore((s) => s.setDraftNotes);
	const saveInvoice = useInvoiceStore((s) => s.saveInvoice);
	const startNewDocument = useInvoiceStore((s) => s.startNewDocument);
	const convertQuoteToInvoice = useInvoiceStore((s) => s.convertQuoteToInvoice);
	const addCustomer = useInvoiceStore((s) => s.addCustomer);
	const addProduct = useInvoiceStore((s) => s.addProduct);
	const docLabel = (kind === "quote" ? "پیش‌فاکتور" : "فاکتور") + " " + (direction === "sale" ? "فروش" : "خرید");
	const [itemOpen, setItemOpen] = (0, import_react.useState)(false);
	useBackableOpen(itemOpen, () => setItemOpen(false));
	const [itemForm, setItemForm] = (0, import_react.useState)({
		productId: "",
		code: "",
		name: "",
		unit: "عدد",
		qty: "1",
		unitPrice: "",
		discount: "0",
		saveToCatalog: true
	});
	const sums = (0, import_react.useMemo)(() => invoiceSums(draft.items, draft.vatRate), [draft.items, draft.vatRate]);
	function pickProduct(id) {
		const p = products.find((x) => x.id === id);
		if (!p) {
			setItemForm((f) => ({
				...f,
				productId: "",
				name: "",
				code: "",
				unitPrice: ""
			}));
			return;
		}
		setItemForm((f) => ({
			...f,
			productId: p.id,
			code: p.code,
			name: p.name,
			unit: p.unit,
			unitPrice: String(p.unitPrice)
		}));
	}
	function submitItem() {
		const name = itemForm.name.trim();
		const qty = parseAmount(itemForm.qty);
		const unitPrice = parseAmount(itemForm.unitPrice);
		if (!name || qty <= 0) {
			toast.error("نام کالا و تعداد را وارد کنید");
			return;
		}
		let productId = itemForm.productId || void 0;
		if (itemForm.saveToCatalog && !productId) productId = addProduct({
			code: itemForm.code.trim(),
			name,
			unit: itemForm.unit.trim() || "عدد",
			unitPrice
		});
		addDraftItem({
			productId,
			code: itemForm.code.trim(),
			name,
			unit: itemForm.unit.trim() || "عدد",
			qty,
			unitPrice,
			discount: parseAmount(itemForm.discount)
		});
		setItemForm({
			productId: "",
			code: "",
			name: "",
			unit: "عدد",
			qty: "1",
			unitPrice: "",
			discount: "0",
			saveToCatalog: true
		});
		setItemOpen(false);
		toast.success("کالا به فاکتور اضافه شد");
	}
	function persist() {
		const inv = saveInvoice();
		if (!inv) {
			toast.error("نام طرف‌حساب و حداقل یک کالا لازم است");
			return null;
		}
		toast.success(`${docLabel} ${toFaDigits(inv.number)} ذخیره شد`);
		return inv;
	}
	function convertToInvoice() {
		if (!viewingId) return;
		const id = saveInvoice()?.id ?? viewingId;
		const invoice = convertQuoteToInvoice(id);
		if (!invoice) {
			toast.error("این پیش‌فاکتور قبلاً به فاکتور تبدیل شده است");
			return;
		}
		toast.success(`فاکتور ${toFaDigits(invoice.number)} ساخته شد`);
		onDone();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, { children: [
					viewingId ? `ویرایش ${docLabel}` : `صدور ${docLabel}`,
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular-nums",
						children: toFaDigits(draft.number)
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, { children: ["تاریخ ", formatJalali(draft.date)] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => startNewDocument(kind, direction),
							children: [docLabel, " تازه"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => void persist(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }), "ذخیره"]
						}),
						kind === "quote" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: convertToInvoice,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck2, { className: "size-4" }), "تبدیل به فاکتور"]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							onClick: () => {
								const inv = persist();
								if (inv) onPrint(inv);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-4" }), "چاپ / PDF"]
						})
					]
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "انتخاب طرف‌حساب ذخیره‌شده",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm",
								value: draft.customer.id,
								onChange: (e) => {
									if (e.target.value) applyCustomer(e.target.value);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "انتخاب کنید یا نام را بنویسید"
								}), customers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.name
								}, c.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "نام طرف‌حساب",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.customer.name,
								onChange: (e) => setDraftCustomer({
									...draft.customer,
									name: e.target.value
								}),
								placeholder: "نام طرف‌حساب را وارد کنید"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "شناسه ملی",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.customer.nationalId,
								onChange: (e) => setDraftCustomer({
									...draft.customer,
									nationalId: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "شماره اقتصادی",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.customer.economicCode,
								onChange: (e) => setDraftCustomer({
									...draft.customer,
									economicCode: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "تلفن",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.customer.phone,
								onChange: (e) => setDraftCustomer({
									...draft.customer,
									phone: e.target.value
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationFields, {
							value: draft.customer,
							onChange: (loc) => setDraftCustomer({
								...draft.customer,
								...loc
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "نشانی کامل",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.customer.address,
								onChange: (e) => setDraftCustomer({
									...draft.customer,
									address: e.target.value
								})
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						type: "button",
						onClick: () => {
							if (!draft.customer.name.trim()) {
								toast.error("ابتدا نام طرف‌حساب را بنویسید");
								return;
							}
							const id = addCustomer({ ...draft.customer });
							setDraftCustomer({
								...draft.customer,
								id
							});
							toast.success("طرف‌حساب در دفتر ذخیره شد");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), "ذخیره این طرف‌حساب"]
					})
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "کالاها و خدمات" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "از فهرست انتخاب کنید یا کالای جدید بسازید" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: () => setItemOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "افزودن کالا"]
				})]
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3",
				children: [
					draft.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "rounded-xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground",
						children: "هنوز کالایی اضافه نشده. دکمه «افزودن کالا» را بزنید."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "grid gap-2",
						children: draft.items.map((item, i) => {
							const t = lineTotals(item.qty, item.unitPrice, item.discount);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "grid gap-2 rounded-xl bg-muted/70 p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm tabular-nums text-muted-foreground",
										children: toFaDigits(i + 1)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium",
												children: item.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground",
												children: [
													"کد ",
													toFaDigits(item.code || "—"),
													" · ",
													toFaDigits(item.qty),
													" ",
													item.unit,
													" ·",
													" ",
													formatRial(item.unitPrice),
													" ریال"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2 grid grid-cols-3 gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														inputMode: "numeric",
														"aria-label": "تعداد",
														value: item.qty,
														onChange: (e) => updateDraftItem(item.id, { qty: parseAmount(e.target.value) })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														inputMode: "numeric",
														"aria-label": "قیمت واحد",
														value: item.unitPrice,
														onChange: (e) => updateDraftItem(item.id, { unitPrice: parseAmount(e.target.value) })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														inputMode: "numeric",
														"aria-label": "تخفیف",
														value: item.discount,
														onChange: (e) => updateDraftItem(item.id, { discount: parseAmount(e.target.value) })
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-sm tabular-nums",
												children: [
													"قابل پرداخت: ",
													formatRial(t.payable),
													" ریال"
												]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										"aria-label": "حذف کالا",
										onClick: () => removeDraftItem(item.id),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									})
								]
							}, item.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-1 rounded-xl bg-primary px-4 py-3 text-primary-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "جمع پس از تخفیف" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums",
									children: [formatRial(sums.afterDiscount), " ریال"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between text-sm opacity-80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "مالیات ارزش افزوده ۹٪" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums",
									children: [formatRial(sums.vat), " ریال"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex justify-between text-base font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "جمع قابل پرداخت" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "tabular-nums",
									children: [formatRial(sums.payable), " ریال"]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "توضیحات فاکتور",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: draft.notes,
							onChange: (e) => setDraftNotes(e.target.value),
							placeholder: "شرایط و نحوه فروش"
						})
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: itemOpen,
				onOpenChange: setItemOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "افزودن کالا به فاکتور" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "از کالاهای ذخیره‌شده انتخاب کنید یا نام کالای جدید را بنویسید." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "از فهرست کالاها",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								className: "flex h-11 w-full rounded-md border border-input bg-card px-3 text-sm",
								value: itemForm.productId,
								onChange: (e) => pickProduct(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "کالای جدید"
								}), products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: p.id,
									children: p.name
								}, p.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "نام کالا",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: itemForm.name,
								onChange: (e) => setItemForm((f) => ({
									...f,
									name: e.target.value
								})),
								placeholder: "نام کالا یا خدمت"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "کد کالا",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: itemForm.code,
										onChange: (e) => setItemForm((f) => ({
											...f,
											code: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "واحد",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: itemForm.unit,
										onChange: (e) => setItemForm((f) => ({
											...f,
											unit: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "تعداد",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										inputMode: "numeric",
										value: itemForm.qty,
										onChange: (e) => setItemForm((f) => ({
											...f,
											qty: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "قیمت واحد (ریال)",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										inputMode: "numeric",
										value: itemForm.unitPrice,
										onChange: (e) => setItemForm((f) => ({
											...f,
											unitPrice: e.target.value
										}))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "تخفیف (ریال)",
									className: "col-span-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										inputMode: "numeric",
										value: itemForm.discount,
										onChange: (e) => setItemForm((f) => ({
											...f,
											discount: e.target.value
										}))
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex min-h-11 items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: itemForm.saveToCatalog,
								onChange: (e) => setItemForm((f) => ({
									...f,
									saveToCatalog: e.target.checked
								}))
							}), "ذخیره در فهرست کالاها"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: submitItem,
							children: "افزودن به فاکتور"
						})
					]
				})] })
			})
		]
	});
}
function ProductManager() {
	const products = useInvoiceStore((s) => s.products);
	const addProduct = useInvoiceStore((s) => s.addProduct);
	const updateProduct = useInvoiceStore((s) => s.updateProduct);
	const removeProduct = useInvoiceStore((s) => s.removeProduct);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(emptyProduct());
	useBackableOpen(open, () => setOpen(false));
	function openNew() {
		setEditing(null);
		setForm(emptyProduct());
		setOpen(true);
	}
	function openEdit(p) {
		setEditing(p.id);
		setForm({
			code: p.code,
			name: p.name,
			unit: p.unit,
			unitPrice: p.unitPrice
		});
		setOpen(true);
	}
	function save() {
		if (!form.name.trim()) {
			toast.error("نام کالا لازم است");
			return;
		}
		if (editing) {
			updateProduct(editing, form);
			toast.success("کالا به‌روز شد");
		} else {
			addProduct(form);
			toast.success("کالا اضافه شد");
		}
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "فهرست کالاها" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "کالاهای پرکاربرد را یک‌بار تعریف کنید" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: openNew,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "کالای جدید"]
			})]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "grid gap-2",
			children: products.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-8 text-center text-sm text-muted-foreground",
				children: "کالایی ثبت نشده است."
			}) : products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 rounded-xl bg-muted/70 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: p.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"کد ",
							toFaDigits(p.code || "—"),
							" · ",
							formatRial(p.unitPrice),
							" ریال / ",
							p.unit
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "ویرایش",
						onClick: () => openEdit(p),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "حذف",
						onClick: () => removeProduct(p.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				})]
			}, p.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "ویرایش کالا" : "کالای جدید" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "نام کالا",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.name,
							onChange: (e) => setForm((f) => ({
								...f,
								name: e.target.value
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "کد",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.code,
								onChange: (e) => setForm((f) => ({
									...f,
									code: e.target.value
								}))
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "واحد",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.unit,
								onChange: (e) => setForm((f) => ({
									...f,
									unit: e.target.value
								}))
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "قیمت واحد (ریال)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							inputMode: "numeric",
							value: form.unitPrice || "",
							onChange: (e) => setForm((f) => ({
								...f,
								unitPrice: parseAmount(e.target.value)
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: save,
						children: "ذخیره کالا"
					})
				]
			})] })
		})
	] });
}
function CustomerManager() {
	const customers = useInvoiceStore((s) => s.customers);
	const addCustomer = useInvoiceStore((s) => s.addCustomer);
	const updateCustomer = useInvoiceStore((s) => s.updateCustomer);
	const removeCustomer = useInvoiceStore((s) => s.removeCustomer);
	const applyCustomer = useInvoiceStore((s) => s.applyCustomer);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(emptyCustomer());
	const [query, setQuery] = (0, import_react.useState)("");
	useBackableOpen(open, () => setOpen(false));
	function openNew() {
		setEditing(null);
		setForm(emptyCustomer());
		setOpen(true);
	}
	function openEdit(c) {
		setEditing(c.id);
		const { id: _id, ...rest } = c;
		setForm(rest);
		setOpen(true);
	}
	function save() {
		if (!form.name.trim()) {
			toast.error("نام طرف‌حساب لازم است");
			return;
		}
		if (editing) {
			updateCustomer(editing, form);
			toast.success("طرف‌حساب به‌روز شد");
		} else {
			addCustomer(form);
			toast.success("طرف‌حساب اضافه شد");
		}
		setOpen(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "دفتر طرف‌حساب‌ها" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "نام و مشخصات طرف‌حساب را نگه دارید" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: openNew,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "طرف‌حساب جدید"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value: query,
			onChange: (e) => setQuery(e.target.value),
			placeholder: "جست‌وجو بر اساس نام یا تلفن",
			className: "mt-2"
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "grid gap-2",
			children: customers.filter((c) => {
				if (!query.trim()) return true;
				const q = query.trim().toLowerCase();
				return c.name.toLowerCase().includes(q) || c.phone.includes(q);
			}).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 rounded-xl bg-muted/70 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: c.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							c.city || "—",
							" · ",
							toFaDigits(c.phone || "—")
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: () => {
								applyCustomer(c.id);
								toast.success("روی فاکتور جاری قرار گرفت");
							},
							children: "انتخاب"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "ویرایش",
							onClick: () => openEdit(c),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "حذف",
							onClick: () => removeCustomer(c.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				})]
			}, c.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editing ? "ویرایش طرف‌حساب" : "طرف‌حساب جدید" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CustomerFields, {
					form,
					setForm
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: save,
					children: "ذخیره طرف‌حساب"
				})
			] })
		})
	] });
}
function CustomerFields({ form, setForm }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "نام طرف‌حساب",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.name,
					onChange: (e) => setForm((f) => ({
						...f,
						name: e.target.value
					}))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "کد (اختیاری)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.code ?? "",
					onChange: (e) => setForm((f) => ({
						...f,
						code: e.target.value
					}))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "شناسه ملی",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.nationalId,
							onChange: (e) => setForm((f) => ({
								...f,
								nationalId: e.target.value
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "شماره اقتصادی",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.economicCode,
							onChange: (e) => setForm((f) => ({
								...f,
								economicCode: e.target.value
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "تلفن",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.phone,
							onChange: (e) => setForm((f) => ({
								...f,
								phone: e.target.value
							}))
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationFields, {
				value: form,
				onChange: (loc) => setForm((f) => ({
					...f,
					...loc
				}))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "نشانی",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: form.address,
					onChange: (e) => setForm((f) => ({
						...f,
						address: e.target.value
					}))
				})
			})
		]
	});
}
function HistoryPanel({ onOpen, onPrint }) {
	const invoices = useInvoiceStore((s) => s.invoices);
	const loadInvoice = useInvoiceStore((s) => s.loadInvoice);
	const removeInvoice = useInvoiceStore((s) => s.removeInvoice);
	const convertQuoteToInvoice = useInvoiceStore((s) => s.convertQuoteToInvoice);
	const [kindFilter, setKindFilter] = (0, import_react.useState)("all");
	const [dirFilter, setDirFilter] = (0, import_react.useState)("all");
	const [query, setQuery] = (0, import_react.useState)("");
	const rows = invoices.filter((i) => {
		if (kindFilter !== "all" && i.kind !== kindFilter) return false;
		if (dirFilter !== "all" && i.direction !== dirFilter) return false;
		if (query.trim()) {
			const q = query.trim().toLowerCase();
			if (!`${i.customer.name} ${toFaDigits(i.number)} ${i.number}`.toLowerCase().includes(q)) return false;
		}
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "سوابق اسناد" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "برای چاپ یا ویرایش، سند را باز کنید" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			value: query,
			onChange: (e) => setQuery(e.target.value),
			placeholder: "جست‌وجو بر اساس نام طرف‌حساب یا شماره سند",
			className: "mt-2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: kindFilter === "all" ? "default" : "outline",
					onClick: () => setKindFilter("all"),
					children: "همه"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: kindFilter === "quote" ? "default" : "outline",
					onClick: () => setKindFilter("quote"),
					children: "پیش‌فاکتورها"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: kindFilter === "invoice" ? "default" : "outline",
					onClick: () => setKindFilter("invoice"),
					children: "فاکتورها"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: dirFilter === "all" ? "default" : "outline",
					onClick: () => setDirFilter("all"),
					children: "فروش و خرید"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: dirFilter === "sale" ? "default" : "outline",
					onClick: () => setDirFilter("sale"),
					children: "فروش"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: dirFilter === "purchase" ? "default" : "outline",
					onClick: () => setDirFilter("purchase"),
					children: "خرید"
				})
			]
		})
	] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "grid gap-2",
		children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-8 text-center text-sm text-muted-foreground",
			children: "هنوز سندی ذخیره نشده."
		}) : rows.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3 rounded-xl bg-muted/70 p-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: inv.kind === "invoice" ? "default" : "secondary",
							children: [
								inv.kind === "invoice" ? "فاکتور" : "پیش‌فاکتور",
								" ",
								inv.direction === "sale" ? "فروش" : "خرید"
							]
						}), inv.convertedToId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							variant: "outline",
							children: "تبدیل شده"
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 font-medium",
						children: [
							toFaDigits(inv.number),
							" — ",
							inv.customer.name
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							formatJalali(inv.date),
							" · ",
							formatRial(invoiceSums(inv.items, inv.vatRate).payable),
							" ریال"
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap justify-end",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => {
							loadInvoice(inv.id);
							onOpen(inv.kind, inv.direction);
						},
						children: "ویرایش"
					}),
					inv.kind === "quote" && !inv.convertedToId ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "تبدیل به فاکتور",
						onClick: () => {
							const created = convertQuoteToInvoice(inv.id);
							if (created) toast.success(`فاکتور ${toFaDigits(created.number)} ساخته شد`);
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck2, { className: "size-4" })
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "چاپ",
						onClick: () => onPrint(inv),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "حذف",
						onClick: () => removeInvoice(inv.id),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})
				]
			})]
		}, inv.id))
	})] });
}
function BusinessSettingsPanel() {
	const seller = useInvoiceStore((s) => s.seller);
	const setSeller = useInvoiceStore((s) => s.setSeller);
	const logoInputRef = (0, import_react.useRef)(null);
	function handleLogoChange(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			setSeller({
				...seller,
				logo: String(reader.result ?? "")
			});
			toast.success("آیکن ذخیره شد");
		};
		reader.readAsDataURL(file);
		e.target.value = "";
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "نام کسب‌وکار" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "این اطلاعات روی همه اسناد چاپ می‌شود" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "آیکن کسب‌وکار",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [
						seller.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: seller.logo,
							alt: "آیکن کسب‌وکار",
							className: "size-14 rounded-xl object-cover"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-14 place-items-center rounded-xl bg-muted text-xs text-muted-foreground",
							children: "بدون آیکن"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => logoInputRef.current?.click(),
								children: seller.logo ? "تغییر آیکن" : "افزودن آیکن"
							}), seller.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								onClick: () => setSeller({
									...seller,
									logo: void 0
								}),
								children: "حذف"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							ref: logoInputRef,
							type: "file",
							accept: "image/*",
							className: "hidden",
							onChange: handleLogoChange
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "نام کسب‌وکار",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: seller.name,
					onChange: (e) => setSeller({
						...seller,
						name: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "تلفن",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: seller.phone,
					onChange: (e) => setSeller({
						...seller,
						phone: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationFields, {
				value: seller,
				onChange: (loc) => setSeller({
					...seller,
					...loc
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "کدپستی",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: seller.postalCode,
					onChange: (e) => setSeller({
						...seller,
						postalCode: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "نشانی",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: seller.address,
					onChange: (e) => setSeller({
						...seller,
						address: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => {
					setSeller({ ...seller });
					toast.success("مشخصات کسب‌وکار ذخیره شد");
				},
				children: "ذخیره"
			}) })
		]
	})] });
}
function InvoiceSettingsPanel() {
	const seller = useInvoiceStore((s) => s.seller);
	const setSeller = useInvoiceStore((s) => s.setSeller);
	const vatRate = useInvoiceStore((s) => s.vatRate);
	const setVatRate = useInvoiceStore((s) => s.setVatRate);
	const [vatPercentInput, setVatPercentInput] = (0, import_react.useState)(String(Math.round(vatRate * 1e3) / 10));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "تنظیمات فاکتور" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "کدهای رسمی که در سربرگ فاکتور چاپ می‌شود" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "grid gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "نرخ مالیات بر ارزش‌افزوده (٪)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					inputMode: "decimal",
					value: vatPercentInput,
					onChange: (e) => setVatPercentInput(e.target.value),
					onBlur: () => {
						const percent = Number(vatPercentInput);
						if (Number.isFinite(percent) && percent >= 0) {
							setVatRate(percent / 100);
							toast.success("نرخ مالیات به‌روزرسانی شد");
						} else setVatPercentInput(String(Math.round(vatRate * 1e3) / 10));
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "-mt-2 text-xs text-muted-foreground",
				children: "این نرخ برای اسناد جدید اعمال می‌شود؛ اسناد قبلی با همان نرخی که هنگام صدورشان فعال بوده باقی می‌مانند."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "شناسه ملی",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: seller.nationalId,
					onChange: (e) => setSeller({
						...seller,
						nationalId: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "شماره اقتصادی",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: seller.economicCode,
					onChange: (e) => setSeller({
						...seller,
						economicCode: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "شماره ثبت",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: seller.registrationNo,
					onChange: (e) => setSeller({
						...seller,
						registrationNo: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				label: "کد رهگیری",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: seller.trackingCode,
					onChange: (e) => setSeller({
						...seller,
						trackingCode: e.target.value
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => {
					setSeller({ ...seller });
					toast.success("تنظیمات فاکتور ذخیره شد");
				},
				children: "ذخیره"
			}) })
		]
	})] });
}
function SoftwareSettingsPanel() {
	const { data: session } = useSession();
	const [users, setUsers] = (0, import_react.useState)([]);
	const exportData = useInvoiceStore((s) => s.exportData);
	const importData = useInvoiceStore((s) => s.importData);
	const smsBankSenders = useInvoiceStore((s) => s.smsBankSenders);
	const addSmsBankSender = useInvoiceStore((s) => s.addSmsBankSender);
	const removeSmsBankSender = useInvoiceStore((s) => s.removeSmsBankSender);
	const autoLockMinutes = useInvoiceStore((s) => s.autoLockMinutes);
	const setAutoLockMinutes = useInvoiceStore((s) => s.setAutoLockMinutes);
	const [smsSender, setSmsSender] = (0, import_react.useState)("");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const fileInputRef = (0, import_react.useRef)(null);
	function refreshUsers() {
		listTeamUsers().then(setUsers).catch(() => toast.error("خواندن فهرست کاربران ناموفق بود"));
	}
	(0, import_react.useEffect)(() => {
		refreshUsers();
	}, []);
	function saveSmsSender() {
		if (!smsSender.trim()) {
			toast.error("شماره یا نام فرستنده را وارد کنید");
			return;
		}
		addSmsBankSender(smsSender.trim());
		setSmsSender("");
		toast.success("افزوده شد");
	}
	async function save() {
		if (!name.trim() || !email.trim() || !password) {
			toast.error("نام، ایمیل و رمز عبور را وارد کنید");
			return;
		}
		try {
			await addTeamUser({ data: {
				email: email.trim(),
				password,
				name: name.trim()
			} });
			toast.success("کاربر اضافه شد");
			setName("");
			setEmail("");
			setPassword("");
			refreshUsers();
		} catch {
			toast.error("افزودن کاربر ناموفق بود (شاید این ایمیل قبلاً ثبت شده)");
		}
	}
	async function remove(id, userName) {
		if (session?.user.id === id) {
			toast.error("نمی‌توانید حساب خودتان را حذف کنید");
			return;
		}
		try {
			await removeTeamUser({ data: id });
			toast.success(`${userName} حذف شد`);
			refreshUsers();
		} catch {
			toast.error("حذف کاربر ناموفق بود");
		}
	}
	const [driveBusy, setDriveBusy] = (0, import_react.useState)(false);
	async function handleDriveBackup() {
		if (GOOGLE_CLIENT_ID.startsWith("REPLACE_WITH")) {
			toast.error("هنوز اتصال Google Drive راه‌اندازی نشده است");
			return;
		}
		setDriveBusy(true);
		try {
			await backupToDrive(exportData(), `divan-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`);
			toast.success("پشتیبان در Google Drive ذخیره شد");
		} catch {
			toast.error("ارسال به Google Drive ناموفق بود");
		} finally {
			setDriveBusy(false);
		}
	}
	async function handleExport() {
		const json = exportData();
		const filename = `divan-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		const file = new File([json], filename, { type: "application/json" });
		try {
			if (navigator.canShare && navigator.canShare({ files: [file] })) {
				await navigator.share({
					files: [file],
					title: filename
				});
				return;
			}
		} catch {}
		const url = URL.createObjectURL(file);
		const a = document.createElement("a");
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
		toast.success("فایل پشتیبان دانلود شد");
	}
	function handleImportClick() {
		fileInputRef.current?.click();
	}
	function handleFileChange(e) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			if (importData(String(reader.result ?? ""))) toast.success("اطلاعات بازگردانی شد");
			else toast.error("فایل معتبر نیست");
		};
		reader.readAsText(file);
		e.target.value = "";
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "قفل خودکار" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "بعد از این مدت بی‌کاری، خودکار خارج می‌شوید" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					inputMode: "numeric",
					value: String(autoLockMinutes),
					onChange: (e) => setAutoLockMinutes(Number(e.target.value) || 0),
					className: "w-24"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted-foreground",
					children: "دقیقه (صفر یعنی غیرفعال)"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "پشتیبان‌گیری" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "خروجی از همه‌ی اطلاعات، یا بازگردانی از فایل قبلی" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: handleExport,
						children: "خروجی گرفتن (JSON)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						onClick: handleImportClick,
						children: "بازگردانی از فایل"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: handleDriveBackup,
						disabled: driveBusy,
						children: driveBusy ? "در حال ارسال..." : "پشتیبان‌گیری خودکار در Google Drive"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileInputRef,
						type: "file",
						accept: "application/json",
						className: "hidden",
						onChange: handleFileChange
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "بعد از خروجی گرفتن، از منوی اشتراک‌گذاری گوشی می‌توانید فایل را در Google Drive یا هر جای دیگر ذخیره کنید."
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "شماره‌های پیامک بانکی" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "فقط پیامک‌های این فرستنده‌ها برای «وارد کردن از پیامک بانکی» خوانده می‌شود" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3",
				children: [smsBankSenders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "هنوز شماره‌ای ثبت نشده."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2",
					children: smsBankSenders.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded-xl bg-muted/70 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							dir: "ltr",
							children: s
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "حذف",
							onClick: () => removeSmsBankSender(s),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})]
					}, s))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: smsSender,
						onChange: (e) => setSmsSender(e.target.value),
						placeholder: "مثلاً 30007256 یا Bank Melli",
						dir: "ltr"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: saveSmsSender,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "افزودن"]
					})]
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "کاربران" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "افرادی که می‌توانند وارد برنامه شوند" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
				className: "grid gap-2",
				children: users.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-xl bg-muted/70 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: u.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							dir: "ltr",
							children: u.email
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "حذف کاربر",
						onClick: () => remove(u.id, u.name),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				}, u.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "افزودن کاربر" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "grid gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "نام",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "ایمیل",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							dir: "ltr",
							value: email,
							onChange: (e) => setEmail(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "رمز عبور",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							dir: "ltr",
							value: password,
							onChange: (e) => setPassword(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: save,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "افزودن کاربر"]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-center text-xs text-muted-foreground",
				children: ["نسخه‌ی برنامه: ", APP_VERSION]
			})
		]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceApp, {});
}
//#endregion
export { Home as component, routes_DV_Pkk_p_exports as t };
