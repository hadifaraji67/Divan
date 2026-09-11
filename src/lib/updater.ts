import packageJson from '../../package.json';

export interface UpdateInfo {
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseNotes?: string;
  downloadUrl?: string;
}

const GITHUB_REPO = 'hadifaraji67/Divan';

export const checkForUpdates = async (): Promise<UpdateInfo> => {
  const currentVersion = packageJson.version;
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
    if (!response.ok) throw new Error('Failed to fetch release info');
    const data = await response.json();
    const latestVersion = data.tag_name.replace(/^v/, '');
    
    return {
      currentVersion,
      latestVersion,
      hasUpdate: latestVersion !== currentVersion,
      releaseNotes: data.body,
      downloadUrl: data.html_url,
    };
  } catch {
    return { currentVersion, latestVersion: currentVersion, hasUpdate: false };
  }
};
