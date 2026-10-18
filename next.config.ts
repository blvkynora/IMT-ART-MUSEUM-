import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudinary is the delivery layer for every artwork asset.
    // Keep this list tight: only hosts we actually trust can be optimised.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
