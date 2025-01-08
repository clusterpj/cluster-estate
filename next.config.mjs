import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' https://www.paypal.com https://www.paypalobjects.com 'unsafe-eval';
              script-src-elem 'self' https://www.paypal.com https://www.paypalobjects.com 'unsafe-inline';
              style-src 'self' 'unsafe-inline' https://www.paypal.com https://www.paypalobjects.com;
              img-src 'self' https://www.paypal.com https://www.paypalobjects.com data:;
              connect-src 'self' https://www.paypal.com https://*.paypal.com https://api.sandbox.paypal.com https://*.supabase.co https://www.sandbox.paypal.com https://www.paypalobjects.com;
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
