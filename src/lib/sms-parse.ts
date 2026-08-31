export type ParsedSms = {
  amount: number;
  direction: "receipt" | "payment";
  raw: string;
  date: number;
};

// Matches a run of digits (plain or with , / ٬ thousands separators) right
// before ریال or تومان — covers the common shape of Iranian bank SMS text,
// e.g. "مبلغ 150,000 ریال از حساب شما کسر شد".
const AMOUNT_RE = /([\d,٬]{4,})\s?(ریال|تومان)/;

const CREDIT_WORDS = ["واریز", "افزایش موجودی", "به حساب شما"];
const DEBIT_WORDS = ["برداشت", "خرید", "کسر", "پرداخت شد", "انتقال از حساب شما"];

const BANK_SENDER_HINTS = ["بانک", "melli", "saman", "bmi", "sep", "پارسیان", "ملت", "سامان", "صادرات"];

/** Loose heuristic — good enough to pre-filter which SMS are worth parsing. */
export function looksLikeBankSms(address: string, body: string): boolean {
  const hay = `${address} ${body}`.toLowerCase();
  return BANK_SENDER_HINTS.some((h) => hay.includes(h.toLowerCase())) || AMOUNT_RE.test(body);
}

export function parseBankSms(body: string, date: number): ParsedSms | null {
  const m = body.match(AMOUNT_RE);
  if (!m) return null;
  const digits = m[1].replace(/[,٬]/g, "");
  let amount = Number(digits);
  if (!amount) return null;
  if (m[2] === "تومان") amount *= 10;

  const isCredit = CREDIT_WORDS.some((w) => body.includes(w));
  const isDebit = DEBIT_WORDS.some((w) => body.includes(w));
  // Default to "payment" (debit) when direction is ambiguous — an
  // unrecognized outgoing charge is the safer assumption for a business's
  // cash record than assuming money in.
  const direction: "receipt" | "payment" = isCredit && !isDebit ? "receipt" : "payment";

  return { amount, direction, raw: body, date };
}
