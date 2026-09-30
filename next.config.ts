import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/lesson/:slug", destination: "/labs/:slug", permanent: true },
      // "Python for AI" was renamed "Python Essentials".
      { source: "/tracks/python-for-ai", destination: "/tracks/python-essentials", permanent: true },
      { source: "/placement/python-for-ai", destination: "/placement/python-essentials", permanent: true },
    ];
  },
};

export default nextConfig;
