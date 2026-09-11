import packageJson from '../../package.json';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseNotes?: string;
  downloadUrl?: string;
  publishedAt?: string;
}

const GITHUB_REPO = 'hadifaraji67/Divan';

/**
 * بررسی وجود نسخه جدید در GitHub Releases
 */
export const checkForUpdates = async (): Promise<UpdateInfo> => {
  const currentVersion = packageJson.version;

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('خطا در دریافت اطلاعات نسخه از گیت‌هاب');
    }

    const data = await response.json();
    const latestVersion = data.tag_name.replace(/^v/, ''); // حذف v از ابتدای نسخه

    const hasUpdate = isVersionGreater(latestVersion, currentVersion);

    return {
      currentVersion,
      latestVersion,
      hasUpdate,
      releaseNotes: data.body || 'توضیحاتی برای این نسخه ثبت نشده است.',
      downloadUrl: data.html_url,
      publishedAt: data.published_at,
    };
  } catch (error) {
    console.error('Update Check Error:', error);
    return {
      currentVersion,
      latestVersion: currentVersion,
      hasUpdate: false,
    };
  }
};

/**
 * مقایسه دو نسخه بر اساس Semantic Versioning
 */
const isVersionGreater = (latest: string, current: string): boolean => {
  const lParts = latest.split('.').map(Number);
  const cParts = current.split('.').map(Number);

  for (let i = 0; i < Math.max(lParts.length, cParts.length); i++) {
    const l = lParts[i] || 0;
    const c = cParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
};
