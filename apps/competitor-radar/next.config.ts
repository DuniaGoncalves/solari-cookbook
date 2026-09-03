import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@solarisdk/browser",
    "@solarisdk/sandbox",
    "patchright-core",
    "chromium-bidi",
  ],
};

export default nextConfig;