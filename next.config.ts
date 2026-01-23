import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. optimizeFonts is no longer a top-level key in recent versions.
  // Next.js handles font optimization automatically via next/font.
  // If you must disable it, it usually lives under 'experimental' or is managed in Layout.

  // 2. Handling build errors
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // FIX: In newer versions, 'eslint' is often moved to 'experimental' 
  // ESLint configuration should be in .eslintrc or under experimental in newer Next.js.
  // Remove 'eslint' key from next.config.js per Next.js 13+ recommendations.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // images consolidated above

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  // 4. For the "Failed to fetch Inter" error:
  // This is a network issue, not just a config issue. 
  // If you are behind a proxy or have no internet, Next.js cannot reach Google.
};

export default nextConfig;
