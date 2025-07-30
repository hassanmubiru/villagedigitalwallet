/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Handle Node.js modules that are not available in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http: false,
        https: false,
        stream: false,
        path: false,
        os: false,
        crypto: false,
        buffer: false,
        util: false,
        url: false,
        querystring: false,
      };
    }
    
    return config;
  },
  // SWC is enabled by default in Next.js 15+ and doesn't need explicit configuration
  experimental: {
    // Any experimental features can be configured here if needed
  },
}

module.exports = nextConfig
