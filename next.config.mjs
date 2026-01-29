import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  eslint: {
    // Skip ESLint during production builds to avoid CI-time lint failures
    // caused by toolchain differences (safe because linting still runs
    // during development via `next dev` / `npm run lint`).
    ignoreDuringBuilds: true,
  },
};

export default withMDX(nextConfig);
