export interface PrintSettings {
  storeName: string;
  storePhone: string;
  footerMessage: string;
  showLogo: boolean;
}

const SETTINGS_KEY = 'divan_print_settings';

export const savePrintSettings = (settings: PrintSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getPrintSettings = (): PrintSettings => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) return JSON.parse(saved);
  return {
    storeName: 'فروشگاه دیوان',
    storePhone: '',
    footerMessage: 'از خرید شما متشکریم!',
    showLogo: false
  };
};
