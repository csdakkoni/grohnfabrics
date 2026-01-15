import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // External packages that shouldn't be bundled
  serverExternalPackages: ['sharp', 'iyzipay', 'postman-request'],
  
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
  
  // iyzipay ve tüm bağımlılıklarını Vercel'e dahil et (Next.js 16+ format)
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/iyzipay/**/*',
      './node_modules/postman-request/**/*',
      './node_modules/@postman/**/*',
      './node_modules/extend/**/*',
      './node_modules/aws-sign2/**/*',
      './node_modules/aws4/**/*',
      './node_modules/caseless/**/*',
      './node_modules/combined-stream/**/*',
      './node_modules/forever-agent/**/*',
      './node_modules/http-signature/**/*',
      './node_modules/is-typedarray/**/*',
      './node_modules/isstream/**/*',
      './node_modules/json-stringify-safe/**/*',
      './node_modules/mime-types/**/*',
      './node_modules/oauth-sign/**/*',
      './node_modules/qs/**/*',
      './node_modules/safe-buffer/**/*',
      './node_modules/socks-proxy-agent/**/*',
      './node_modules/stream-length/**/*',
      './node_modules/uuid/**/*',
    ],
  },
  
  // Standalone output for better Vercel compatibility
  output: 'standalone',
  
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
