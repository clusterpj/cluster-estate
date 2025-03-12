import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './i18n/request.ts'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
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
      "https://vercel.live",
      "https://*.vercel.app",
      ...(isDevelopment ? ["http://localhost:*"] : [])
    ].join(' ');

    const scriptSrc = [
      "'self'",
      "https://www.paypal.com",
      "https://www.paypalobjects.com", 
      "https://vercel.live",
      "'unsafe-eval'"
    ].join(' ');

    const scriptSrcElem = [
      "'self'",
      "https://www.paypal.com",
      "https://www.paypalobjects.com",
      "https://vercel.live",
      "'unsafe-inline'"
    ].join(' ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src ${scriptSrc};
              script-src-elem ${scriptSrcElem};
              style-src 'self' 'unsafe-inline' https://www.paypal.com https://www.paypalobjects.com;
              img-src 'self' https://www.paypal.com https://www.paypalobjects.com https://ebydkdkayaukivmtljmo.supabase.co data:;
              connect-src ${connectSrc};
              frame-src 'self' https://www.paypal.com https://*.paypal.com https://vercel.live;
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

// Add custom domains
const customDomains = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'clustercreations.com',
          },
        ],
        destination: '/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.clustercreations.com',
          },
        ],
        destination: '/:path*',
      },
    ];
  },
};

// Apply next-intl plugin and custom domains
export default withNextIntl({
  ...nextConfig,
  ...customDomains
});