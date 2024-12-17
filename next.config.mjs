import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable parallel routes handling
  experimental: {
    parallelRoutes: true,
  }
};

export default withNextIntl({
  ...nextConfig,
  // Ensure proper handling of dynamic routes
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/en/admin',
        permanent: true,
      },
    ];
  },
});
