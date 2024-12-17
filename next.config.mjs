import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable parallel routes handling
  experimental: {
    // Remove parallelRoutes as it's not needed and might cause conflicts
  }
};

// Apply next-intl plugin
export default withNextIntl(nextConfig);
