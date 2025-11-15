/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Set canvas to false for client-side rendering
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
  // This tells Next.js to ignore these modules during server-side rendering
  experimental: {
    serverComponentsExternalPackages: ['canvas', 'pdfjs-dist'],
  },
};

module.exports = nextConfig;
