import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { Pool } from "pg";
import nodemailer from "nodemailer";

const mailer = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Real server-backed accounts, replacing the old client-only localStorage
// check. Needs DATABASE_URL (Neon) and BETTER_AUTH_SECRET set as Vercel
// environment variables — see the chat message this shipped with for how
// to generate/set them. Schema: migrations/0001_auth.sql.
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL: "https://divan-one.vercel.app",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, token }) => {
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error("[auth] GMAIL_USER/GMAIL_APP_PASSWORD not set — cannot send reset email");
        return;
      }
      const resetUrl = `https://divan-one.vercel.app/reset-password?token=${token}`;
      await mailer.sendMail({
        from: `"دیوان" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: "بازیابی رمز عبور دیوان",
        html: `<div dir="rtl" style="font-family:sans-serif">
          <p>برای تنظیم رمز عبور جدید، روی لینک زیر بزنید:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>اگر این درخواست از طرف شما نبوده، این پیام را نادیده بگیرید.</p>
        </div>`,
      });
    },
  },
  plugins: [tanstackStartCookies()],
});
