const MOBILE_USER_AGENT_PATTERN =
  /Android|BlackBerry|iPhone|iPad|iPod|IEMobile|Kindle|Mobile|Opera Mini|Silk|Windows Phone/i;

export function isMobileUserAgent(userAgent = '') {
  return MOBILE_USER_AGENT_PATTERN.test(userAgent);
}
