import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages that shouldn't be bundled
  serverExternalPackages: ['sharp', 'iyzipay'],
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xfbcqbjfprtwqwiimdpn.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
    ],
  },

  // Increase body size limit for file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
