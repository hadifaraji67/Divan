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
