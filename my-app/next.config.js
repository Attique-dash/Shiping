/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use the new configuration key instead of experimental
  serverExternalPackages: ['mongoose', 'mongodb', 'bcryptjs'],
  
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  
  images: {
    // Use remotePatterns instead of domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  
  // Disable type checking during build (optional, for faster builds)
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Disable ESLint during build (optional, for faster builds)
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig;