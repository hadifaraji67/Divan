// Google Drive backup — uses Google Identity Services (loaded from
// __root.tsx) with the narrow "drive.file" scope, which only ever sees
// files this app itself created in the user's Drive (no broad access,
// no Google verification review needed for this scope).
//
// GOOGLE_CLIENT_ID must be filled in from your own Google Cloud project —
// see the setup steps in the chat message this shipped with.
export const GOOGLE_CLIENT_ID = "REPLACE_WITH_YOUR_CLIENT_ID.apps.googleusercontent.com";

const SCOPE = "https://www.googleapis.com/auth/drive.file";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }): { requestAccessToken: () => void };
        };
      };
    };
  }
}

function waitForGoogleIdentity(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) return resolve();
    let tries = 0;
    const id = window.setInterval(() => {
      tries++;
      if (window.google?.accounts?.oauth2) {
        window.clearInterval(id);
        resolve();
      } else if (tries > 100) {
        window.clearInterval(id);
        reject(new Error("Google Identity Services failed to load"));
      }
    }, 100);
  });
}

async function getAccessToken(): Promise<string> {
  await waitForGoogleIdentity();
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPE,
      callback: (resp) => {
        if (resp.access_token) resolve(resp.access_token);
        else reject(new Error(resp.error ?? "auth failed"));
      },
    });
    client.requestAccessToken();
  });
}

export async function backupToDrive(json: string, filename: string): Promise<void> {
  const token = await getAccessToken();
  const boundary = "divan-backup-boundary";
  const metadata = { name: filename, mimeType: "application/json" };
  const body =
    `--${boundary}\r\n` +
    "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    "Content-Type: application/json\r\n\r\n" +
    `${json}\r\n` +
    `--${boundary}--`;

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });
  if (!res.ok) throw new Error(`Drive upload failed: ${res.status}`);
}
