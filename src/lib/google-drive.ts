const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "REPLACE_WITH_YOUR_CLIENT_ID";

export const isGoogleDriveConfigured = (): boolean => {
  return (
    Boolean(GOOGLE_CLIENT_ID) &&
    !GOOGLE_CLIENT_ID.includes("REPLACE_WITH_YOUR_CLIENT_ID") &&
    GOOGLE_CLIENT_ID.trim() !== ""
  );
};

export const getGoogleDriveAuthConfig = () => {
  if (!isGoogleDriveConfigured()) {
    return {
      configured: false,
      errorMessage: "تنظیمات اتصال به گوگل درایو کامل نیست. لطفا کلید Client ID را در فایل تنظیمات وارد کنید.",
    };
  }

  return {
    configured: true,
    clientId: GOOGLE_CLIENT_ID,
  };
};
