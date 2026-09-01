package ir.divan.app;

import android.content.Context;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintManager;
import android.webkit.WebView;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// window.print() is a no-op inside a plain Android WebView (unlike Chrome),
// so the web code's print/PDF button silently did nothing in the installed
// app. This bridges to WebView's own createPrintDocumentAdapter(), which
// Android's print system renders using the page's normal @media print CSS —
// the same layout the browser/PWA path already produces.
@CapacitorPlugin(name = "NativePrint")
public class NativePrintPlugin extends Plugin {

    @PluginMethod
    public void printPage(PluginCall call) {
        getActivity().runOnUiThread(() -> {
            WebView webView = getBridge().getWebView();
            PrintManager printManager = (PrintManager) getContext().getSystemService(Context.PRINT_SERVICE);
            String jobName = "divan-invoice";
            PrintDocumentAdapter adapter = webView.createPrintDocumentAdapter(jobName);
            printManager.print(jobName, adapter, new PrintAttributes.Builder().build());
        });
        JSObject ret = new JSObject();
        ret.put("started", true);
        call.resolve(ret);
    }
}
