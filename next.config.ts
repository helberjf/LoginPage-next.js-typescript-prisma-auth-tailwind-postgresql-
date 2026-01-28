import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_R2_PUBLIC_URL:
      process.env.R2_PUBLIC_URL ?? process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "",
  },
  images: {
    remotePatterns: [
      // Unsplash
      { protocol: "https", hostname: "source.unsplash.com" },
      { protocol: "https", hostname: "images.unsplash.com" },

      // Cloudflare R2 (Public URL)
      {
        protocol: "https",
        hostname: "pub-0d1f4c0efcf44c449115ecee3253aaa9.r2.dev",
      },
      {
        protocol: "https",
        hostname: "ff4d60ccfa8fc4b230270a19d877728e.r2.cloudflarestorage.com",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
