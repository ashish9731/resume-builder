/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Allow larger files to be uploaded
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth'],
  },
  
  // Optional: Configure images if you're using Next.js Image optimization
  images: {
    domains: [],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Optional: Webpack configuration for specific packages
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve certain modules on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },

  // Disable static optimization for pages that require dynamic data
  output: 'standalone',
  generateBuildId: async () => {
    return 'build-' + new Date().getTime();
  },
}

module.exports = nextConfig