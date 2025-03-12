import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has type errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠️ Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ebydkdkayaukivmtljmo.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  headers: async () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const connectSrc = [
      "'self'",
      "https://www.paypal.com",
      "https://*.paypal.com",
      "https://api.sandbox.paypal.com",
      "https://*.supabase.co",
      "https://www.sandbox.paypal.com",
      "https://www.paypalobjects.com",
      "https://vercel.live",  // Added for Vercel live feedback
      ...(isDevelopment ? ["http://localhost:*"] : [])
    ].join(' ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' https://www.paypal.com https://www.paypalobjects.com https://vercel.live 'unsafe-eval';
              script-src-elem 'self' https://www.paypal.com https://www.paypalobjects.com https://vercel.live 'unsafe-inline';
              style-src 'self' 'unsafe-inline' https://www.paypal.com https://www.paypalobjects.com;
              img-src 'self' https://www.paypal.com https://www.paypalobjects.com https://ebydkdkayaukivmtljmo.supabase.co data:;
              connect-src ${connectSrc};
              frame-src 'self' https://www.paypal.com https://*.paypal.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ]
  }
};

// Apply next-intl plugin
export default withNextIntl(nextConfig);