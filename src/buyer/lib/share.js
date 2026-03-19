// =============================================
// SHARE UTILITY
// =============================================
export const shareUrl = (url, text, medium) => {
  const utmUrl = `${url}${url.includes('?') ? '&' : '?'}utm_source=share&utm_medium=${medium}&utm_campaign=organic`;
  if (medium === 'native' && navigator.share) {
    navigator.share({ title: 'SiamClones', text, url: utmUrl }).catch(() => {});
    return;
  }
  const encodedUrl = encodeURIComponent(utmUrl);
  const encodedText = encodeURIComponent(text);
  const shareUrls = {
    line: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    copy: null,
  };
  if (medium === 'copy') {
    navigator.clipboard?.writeText(utmUrl);
    return true;
  }
  if (shareUrls[medium]) window.open(shareUrls[medium], '_blank', 'noopener,noreferrer');
};
