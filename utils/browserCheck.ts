export const isInAppBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Daha kapsamlı ve agresif kontrol listesi (Regex)
  const rules = [
    /TikTok/i,          // TikTok (Global)
    /Bytedance/i,       // TikTok (Ana Şirket)
    /Musical_ly/i,      // TikTok (Eski Adı)
    /Instagram/i,       // Instagram
    /FBAN/i,            // Facebook App Name
    /FBAV/i,            // Facebook App Version
    /Snapchat/i,        // Snapchat
    /WhatsApp/i,        // WhatsApp
    /Line/i,            // Line
    /Trill/i,           // TikTok (Bazı bölgeler)
    /wv/i               // Android WebView (Genel)
  ];

  return rules.some((rule) => rule.test(ua));
};