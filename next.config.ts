import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/managed-services",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/portal/tickets",
        destination: "/portal/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
