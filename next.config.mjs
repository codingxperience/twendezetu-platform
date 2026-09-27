import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
  experimental: { serverActions: { bodySizeLimit: '5mb' } },

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
