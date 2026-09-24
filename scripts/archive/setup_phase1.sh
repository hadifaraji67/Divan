#!/bin/bash

# ۱. ایجاد لایه ارتباط با دیتابیس Neon
mkdir -p src/lib api
cat << 'ES1' > src/lib/db.ts
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sql = neon(process.env.DATABASE_URL);
ES1

# ۲. ایجاد API Endpoint فاکتورها برای Vercel
cat << 'ES2' > api/invoices.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../src/lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const invoices = await sql`
        SELECT i.id, i.total_amount, i.status, i.created_at, c.name as customer_name 
        FROM invoices i 
        LEFT JOIN customers c ON i.customer_id = c.id 
        ORDER BY i.created_at DESC
      `;
      return res.status(200).json({ success: true, data: invoices });
    } catch (error) {
      return res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { customerId, items, totalAmount } = req.body;
      const [invoice] = await sql`
        INSERT INTO invoices (customer_id, total_amount, status)
        VALUES (${customerId}, ${totalAmount}, 'paid')
        RETURNING id, created_at
      `;

      for (const item of items) {
        await sql`
          INSERT INTO invoice_items (invoice_id, product_id, title, quantity, unit_price, total_price)
          VALUES (${invoice.id}, ${item.productId || null}, ${item.title}, ${item.quantity}, ${item.unitPrice}, ${item.totalPrice})
        `;
      }

      return res.status(201).json({ success: true, invoiceId: invoice.id });
    } catch (error) {
      return res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
ES2

# ۳. فایل سرویس رابط فرانت‌اند و نیتیو
mkdir -p src/services
cat << 'ES3' > src/services/nativeService.ts
import { registerPlugin } from '@capacitor/core';

export interface SmsReaderPluginInterface {
  startVerificationListener(): Promise<{ status: string }>;
  addListener(
    eventName: 'onSmsReceived',
    listenerFunc: (data: { message: string; sender: string }) => void
  ): Promise<any>;
}

export interface NativePrintPluginInterface {
  printText(options: { macAddress: string; text: string }): Promise<{ success: boolean }>;
}

export const SmsReader = registerPlugin<SmsReaderPluginInterface>('SmsReader');
export const NativePrint = registerPlugin<NativePrintPluginInterface>('NativePrint');

export const extractOtpCode = (message: string): string | null => {
  const match = message.match(/\b\d{4,6}\b/);
  return match ? match[0] : null;
};
ES3

# ۴. آپدیت کدهای نیتیو اندروید
mkdir -p android/app/src/main/java/ir/divan/app

cat << 'ES4' > android/app/src/main/java/ir/divan/app/MainActivity.java
package ir.divan.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(SmsReaderPlugin.class);
        registerPlugin(NativePrintPlugin.class);
    }
}
ES4

cat << 'ES5' > android/app/src/main/java/ir/divan/app/SmsReaderPlugin.java
package ir.divan.app;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.telephony.SmsMessage;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

@CapacitorPlugin(
    name = "SmsReader",
    permissions = {
        @Permission(strings = {Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS}, alias = "sms")
    }
)
public class SmsReaderPlugin extends Plugin {

    private BroadcastReceiver smsReceiver;

    @PluginMethod
    public void startVerificationListener(PluginCall call) {
        if (!hasRequiredPermissions()) {
            requestAllPermissions(call, "smsPermsCallback");
            return;
        }

        registerSmsReceiver();
        JSObject ret = new JSObject();
        ret.put("status", "listening");
        call.resolve(ret);
    }

    private void registerSmsReceiver() {
        if (smsReceiver != null) return;

        smsReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Bundle bundle = intent.getExtras();
                if (bundle != null) {
                    Object[] pdus = (Object[]) bundle.get("pdus");
                    if (pdus != null) {
                        for (Object pdu : pdus) {
                            SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu);
                            JSObject data = new JSObject();
                            data.put("message", sms.getMessageBody());
                            data.put("sender", sms.getOriginatingAddress());
                            notifyListeners("onSmsReceived", data);
                        }
                    }
                }
            }
        };

        IntentFilter filter = new IntentFilter("android.provider.Telephony.SMS_RECEIVED");
        getContext().registerReceiver(smsReceiver, filter);
    }

    @Override
    protected void handleOnDestroy() {
        if (smsReceiver != null) {
            getContext().unregisterReceiver(smsReceiver);
            smsReceiver = null;
        }
    }
}
ES5

cat << 'ES6' > android/app/src/main/java/ir/divan/app/NativePrintPlugin.java
package ir.divan.app;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;
import java.util.UUID;

@CapacitorPlugin(name = "NativePrint")
public class NativePrintPlugin extends Plugin {

    private static final UUID PRINTER_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");

    @PluginMethod
    public void printText(PluginCall call) {
        String macAddress = call.getString("macAddress");
        String textToPrint = call.getString("text");

        if (macAddress == null || textToPrint == null) {
            call.reject("ورودی نامعتبر است");
            return;
        }

        new Thread(() -> {
            try {
                BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
                BluetoothDevice device = bluetoothAdapter.getRemoteDevice(macAddress);
                BluetoothSocket socket = device.createRfcommSocketToServiceRecord(PRINTER_UUID);
                
                socket.connect();
                OutputStream os = socket.getOutputStream();

                os.write(new byte[]{0x1B, 0x40});
                os.write(textToPrint.getBytes("UTF-8"));
                os.write(new byte[]{0x0A, 0x0A, 0x0A});

                os.close();
                socket.close();

                JSObject ret = new JSObject();
                ret.put("success", true);
                call.resolve(ret);
            } catch (Exception e) {
                call.reject("خطا در چاپ: " + e.getMessage());
            }
        }).start();
    }
}
ES6

# ۵. به‌روزرسانی AndroidManifest.xml
cat << 'ES7' > android/app/src/main/AndroidManifest.xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="ir.divan.app">

    <uses-permission android:name="android.permission.RECEIVE_SMS" />
    <uses-permission android:name="android.permission.READ_SMS" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

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
ES7

# ۶. ثبت تغییرات در Git و Push به GitHub
git add .
git commit -m "Feat: Complete Phase 1 - Database, SMS & Printer Plugin Integration"
git push origin main

echo "✅ تمامی کدهای فاز ۱ جای‌گذاری شده و روی گیت‌هاب آپلود شدند."
