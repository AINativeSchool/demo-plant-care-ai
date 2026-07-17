import type { NextConfig } from "next";

/** Subpath mount when the app is not served from domain root. */
const mountPath = "/plant-ai";

const nextConfig: NextConfig = {
  ...(mountPath
    ? {
        basePath: mountPath,
        assetPrefix: mountPath,
      }
    : {}),
};

export default {
  ...nextConfig,
  env: {
    ...nextConfig.env,
    // Client fetches use basePath only; assetPrefix is build-time for _next/static.
    NEXT_PUBLIC_BASE_PATH: mountPath,
  },
} satisfies NextConfig;
