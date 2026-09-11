export const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || '';

export const backupToDrive = async (data: any) => {
  console.log("Backing up to Google Drive...", data);
  return Promise.resolve(true);
};
