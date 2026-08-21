import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1MB, too small for the site-content form (profile photo +
      // resume PDF together) and ProjectForm (cover + multiple gallery
      // images). Capped at 4mb, just under Vercel's own hard 4.5MB request
      // body limit for serverless functions — going higher wouldn't help,
      // Vercel would reject it before this check ever ran.
      bodySizeLimit: '4mb',
    },
  },
};

export default nextConfig;
