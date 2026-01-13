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
    ],
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
