import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Deleted pages — preserve bookmarks
      { source: '/dashboard/sourcing', destination: '/dashboard/import/analyze', permanent: true },
      { source: '/dashboard/suppliers', destination: '/dashboard/products', permanent: true },
      { source: '/dashboard/classifications', destination: '/dashboard/products', permanent: true },
      { source: '/dashboard/monitoring', destination: '/dashboard/products', permanent: true },
      // Legacy classify routes
      { source: '/dashboard/classify', destination: '/dashboard/import/analyze', permanent: true },
      { source: '/dashboard/classify/bulk', destination: '/dashboard/import/analyze?mode=bulk', permanent: true },
    ];
  },
};

export default nextConfig;
