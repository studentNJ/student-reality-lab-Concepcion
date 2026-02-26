import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "127.0.0.1:4173", "localhost:4173"],
};

export default nextConfig;
