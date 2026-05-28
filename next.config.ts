import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages that shouldn't be bundled
  serverExternalPackages: ['sharp', 'iyzipay', 'postman-request'],
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 256, 384],
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
  
  // Standalone output for better Vercel compatibility
  output: 'standalone',
  
  // Tüm iyzipay kütüphanesini Vercel'e dahil et
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/iyzipay/**/*'],
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
