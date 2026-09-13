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
