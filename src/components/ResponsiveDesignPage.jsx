'use client';

import { useEffect, useState } from 'react';
import { ClaudeDesignPage } from '@/components/ClaudeDesignPage';
import { MobileWebPage } from '@/components/MobileWebPage';

const MOBILE_MEDIA_QUERY = '(max-width: 900px), (hover: none) and (pointer: coarse)';

export function ResponsiveDesignPage({ desktopPage = 'home', mobilePage = 'home', initialIsMobile = false }) {
  const [isMobile, setIsMobile] = useState(initialIsMobile);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const syncPageToViewport = () => {
      setIsMobile(mediaQuery.matches);
    };

    syncPageToViewport();
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncPageToViewport);
      return () => mediaQuery.removeEventListener('change', syncPageToViewport);
    }

    mediaQuery.addListener(syncPageToViewport);
    return () => mediaQuery.removeListener(syncPageToViewport);
  }, []);

  return isMobile ? <MobileWebPage page={mobilePage} /> : <ClaudeDesignPage page={desktopPage} />;
}
