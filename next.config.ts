import type { NextConfig } from "next"
import { products } from "./data/products"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cvxsplmseiitbyppjxxr.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  cacheComponents: true,
  cacheLife: {
    products: {
      stale: 300,
      revalidate: 900,
      expire: 3600
    }
  }
}

export default nextConfig
