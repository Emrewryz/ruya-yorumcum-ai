export const isInAppBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // TikTok, Instagram, Facebook gibi embedded tarayıcı imzaları
  return (
    ua.indexOf("TikTok") > -1 || 
    ua.indexOf("Instagram") > -1 || 
    ua.indexOf("FBAN") > -1 || 
    ua.indexOf("FBAV") > -1
  );
};