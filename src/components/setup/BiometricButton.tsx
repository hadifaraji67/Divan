import React, { useState, useEffect } from 'react';
import { Fingerprint, Scan, Loader2 } from 'lucide-react';
import {
  checkBiometricAvailability,
  loginWithBiometric,
  isBiometricEnabled,
  type BiometricAvailability,
} from '../../lib/server/biometric';

interface Props {
  onSuccess: (username: string, password: string) => void;
  onError?: (error: string) => void;
}

export const BiometricButton: React.FC<Props> = ({ onSuccess, onError }) => {
  const [avail, setAvail] = useState<BiometricAvailability | null>(null);
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    (async () => {
      const a = await checkBiometricAvailability();
      setAvail(a);
      setEnabled(isBiometricEnabled());
    })();
  }, []);

  if (!avail?.available || !enabled) return null;

  const handleClick = async () => {
    setBusy(true);
    try {
      const cred = await loginWithBiometric();
      if (cred) {
        onSuccess(cred.username, cred.password);
      } else {
        onError?.('تأیید هویت ناموفق بود');
      }
    } catch (err: any) {
      onError?.(err.message || 'خطا در ورود');
    } finally {
      setBusy(false);
    }
  };

  const Icon = avail.type === 'face' ? Scan : Fingerprint;
  const label = avail.type === 'face' ? 'ورود با چهره' : 'ورود با اثر انگشت';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 p-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
    >
      {busy ? (
        <><Loader2 className="w-5 h-5 animate-spin" /> در حال تأیید...</>
      ) : (
        <><Icon className="w-5 h-5" /> {label}</>
      )}
    </button>
  );
};

export default BiometricButton;
