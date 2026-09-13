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
