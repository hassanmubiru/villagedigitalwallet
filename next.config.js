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
    
    // Ignore certain problematic modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@celo/contractkit/lib/identity/metadata': false,
      '@celo/contractkit/lib/setupForKits': false,
    };
    
    return config;
  },
  // Disable swcMinify to avoid potential issues
  swcMinify: false,
}

module.exports = nextConfig
