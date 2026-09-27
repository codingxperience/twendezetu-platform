import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const production = process.env.NODE_ENV === 'production';

// Scripts and styles come only from this site. Next.js still injects inline
// bootstrap scripts, and the pages use inline styles, so those two stay
// allowed; everything else is locked down. Card payments happen on Stripe's
// own page after a redirect, so no third-party script or frame is needed.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${production ? '' : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  // Posts may use any https image link (see schemas.imageUrl).
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(production ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The door check-in page uses the camera; nothing else needs a sensor.
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(production ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }] : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
  experimental: { serverActions: { bodySizeLimit: '5mb' } },

  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Reset links carry their token in the address; never pass it on.
      { source: '/sign-in', headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }] },
    ];
  },

  async redirects() {
    return [
      // Invite links: twendezetu.com/r/amina opens sign-up with the referrer set.
      { source: '/r/:handle', destination: '/sign-in?mode=register&ref=:handle', permanent: false },

      // Addresses from the first version of the site.
      { source: '/sign-up', destination: '/sign-in?mode=register', permanent: true },
      { source: '/dashboard', destination: '/my-twende', permanent: true },
      { source: '/dashboard/:path*', destination: '/my-twende', permanent: true },
      { source: '/vendor-dashboard', destination: '/provider-dashboard', permanent: true },
      { source: '/inbox', destination: '/messages', permanent: true },
      { source: '/account', destination: '/settings', permanent: true },
      { source: '/favorites', destination: '/my-twende?tab=saved', permanent: true },
      { source: '/browse', destination: '/providers', permanent: true },
      { source: '/vendors/:slug', destination: '/providers/:slug', permanent: true },
      { source: '/book/:id', destination: '/providers', permanent: true },
      { source: '/confirm/:id', destination: '/my-twende', permanent: true },
      { source: '/about', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
