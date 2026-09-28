import { useEffect, useState } from 'react';
import { getEnabledModules, subscribeModules, type ModuleKey } from './licensing';

/** لیست ماژول‌های فعال — با هر تغییر در تنظیمات، خودکار بروز می‌شود */
export function useEnabledModules(): ModuleKey[] {
  const [enabled, setEnabled] = useState<ModuleKey[]>(getEnabledModules);
  useEffect(() => subscribeModules(() => setEnabled(getEnabledModules())), []);
  return enabled;
}
