/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    silenceDeprecations: ["import"],
  },
  webpack(config) {
    config.resolve.alias['micromark-util-events-to-acorn'] =
      new URL('./node_modules/micromark-util-events-to-acorn/lib/index.js', import.meta.url).pathname;
    return config;
  },
};

export default nextConfig;
