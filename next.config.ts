import type { NextConfig } from "next";
import { normalizeMountPath } from "./lib/mount-path";

const mountPath = normalizeMountPath(process.env.NEXT_PUBLIC_BASE_PATH);

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
