import { App } from '@capacitor/app';

export interface UpdateInfo {
  hasUpdate: boolean;
  version?: string;
  downloadUrl?: string;
}

// بررسی نسخه جدید از Releases گیتهاب
export const checkForUpdates = async (): Promise<UpdateInfo> => {
  try {
    const response = await fetch('https://api.github.com/repos/hadifaraji67/Divan/releases/latest');
    if (!response.ok) return { hasUpdate: false };
    
    const data = await response.json();
    const latestVersion = data.tag_name;
    
    // دریافت ورژن فعلی اپ
    let currentVersion = '1.0.0';
    try {
      const appInfo = await App.getInfo();
      currentVersion = appInfo.version;
    } catch {
      // در حالت PWA/Web
    }

    if (latestVersion !== currentVersion) {
      const apkAsset = data.assets?.find((asset: any) => asset.name.endsWith('.apk'));
      return {
        hasUpdate: true,
        version: latestVersion,
        downloadUrl: apkAsset ? apkAsset.browser_download_url : data.html_url
      };
    }
  } catch (error) {
    console.error('Update check failed:', error);
  }
  return { hasUpdate: false };
};
