const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  experimental: {
    mdxRs: true,
  },
  devServer: {
    port: 4000,
  },
  images: {
    domains: ["localhost", "your-cdn-domain.com"],
  },
};

module.exports = withMDX(nextConfig);
