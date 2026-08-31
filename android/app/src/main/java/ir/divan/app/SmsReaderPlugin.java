package ir.divan.app;

import android.Manifest;
import android.database.Cursor;
import android.net.Uri;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "SmsReader",
    permissions = { @Permission(strings = { Manifest.permission.READ_SMS }, alias = "sms") }
)
public class SmsReaderPlugin extends Plugin {

    @PluginMethod
    public void requestSmsPermission(PluginCall call) {
        if (getPermissionState("sms") != PermissionState.GRANTED) {
            requestPermissionForAlias("sms", call, "smsPermsCallback");
        } else {
            JSObject ret = new JSObject();
            ret.put("granted", true);
            call.resolve(ret);
        }
    }

    @PermissionCallback
    private void smsPermsCallback(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", getPermissionState("sms") == PermissionState.GRANTED);
        call.resolve(ret);
    }

    @PluginMethod
    public void readMessages(PluginCall call) {
        if (getPermissionState("sms") != PermissionState.GRANTED) {
            call.reject("SMS permission not granted");
            return;
        }
        int limit = call.getInt("limit", 200);
        JSArray messages = new JSArray();
        Uri uri = Uri.parse("content://sms/inbox");
        String[] projection = { "address", "body", "date" };
        Cursor cursor = getContext()
            .getContentResolver()
            .query(uri, projection, null, null, "date DESC limit " + limit);
        if (cursor != null) {
            while (cursor.moveToNext()) {
                JSObject msg = new JSObject();
                msg.put("address", cursor.getString(cursor.getColumnIndexOrThrow("address")));
                msg.put("body", cursor.getString(cursor.getColumnIndexOrThrow("body")));
                msg.put("date", cursor.getLong(cursor.getColumnIndexOrThrow("date")));
                messages.put(msg);
            }
            cursor.close();
        }
        JSObject ret = new JSObject();
        ret.put("messages", messages);
        call.resolve(ret);
    }
}
