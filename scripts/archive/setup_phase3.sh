#!/bin/bash

# ۱. افزودن Guardهای امنیتی برای اعتبارسنجی توکن و ورودی‌ها
mkdir -p src/utils
cat << 'ES1' > src/utils/security.ts
export const sanitizeInput = (input: string): string => {
  return input.replace(/[<>'"]/g, '').trim();
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
};
ES1

# ۲. ایجاد سرویس تست عملکرد پرینتر و سایز کاغذ (58mm و 80mm)
cat << 'ES2' > src/services/printerFormat.ts
export interface PrintOptions {
  paperWidth: '58mm' | '80mm';
  invoiceData: any;
}

export const formatTextForThermalPrinter = (options: PrintOptions): string => {
  const { paperWidth, invoiceData } = options;
  const lineLength = paperWidth === '58mm' ? 32 : 48;
  const separator = '-'.repeat(lineLength);

  let text = `فاکتور فروش دیوان\n`;
  text += `${separator}\n`;
  text += `تاریخ: ${new Date().toLocaleDateString('fa-IR')}\n`;
  if (invoiceData.customerName) {
    text += `مشتری: ${invoiceData.customerName}\n`;
  }
  text += `${separator}\n`;

  (invoiceData.items || []).forEach((item: any) => {
    const itemLine = `${item.title} x${item.quantity}`;
    const priceLine = `${(item.quantity * item.unitPrice).toLocaleString()} تومان`;
    text += `${itemLine}\n${priceLine}\n`;
  });

  text += `${separator}\n`;
  text += `جمع کل: ${invoiceData.totalAmount?.toLocaleString() || 0} تومان\n`;
  text += `${separator}\n\n`;

  return text;
};
ES2

# ۳. به‌روزرسانی نهایی AndroidManifest.xml با مجوزهای دقیق دستگاه‌های جدید اندروید
cat << 'ES3' > android/app/src/main/AndroidManifest.xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="ir.divan.app">

    <!-- دسترسی‌های پیامک -->
    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />

    <!-- دسترسی‌های اتصال بلوتوث برای پرینتر حرارتی -->
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBar"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
ES3

# ۴. ثبت تغییرات فاز ۳ در Git و Push به GitHub
git add .
git commit -m "Feat: Complete Phase 3 - Security Guards, Thermal Printer Formatting & Android Manifest Permissions"
git push origin main

echo "✅ تمامی کدهای فاز ۳ اعمال شده و روی گیت‌هاب آپلود شدند."
