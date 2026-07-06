import { headers } from 'next/headers';
import { ResponsiveDesignPage } from '@/components/ResponsiveDesignPage';
import { isMobileUserAgent } from '@/lib/device';

export async function DeviceAwareDesignPage({ desktopPage = 'home', mobilePage = 'home' }) {
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get('user-agent') ?? '';
  const initialIsMobile = isMobileUserAgent(userAgent);

  return (
    <ResponsiveDesignPage
      desktopPage={desktopPage}
      mobilePage={mobilePage}
      initialIsMobile={initialIsMobile}
    />
  );
}

export function DeviceAwareHomePage() {
  return <DeviceAwareDesignPage desktopPage="home" mobilePage="home" />;
}
