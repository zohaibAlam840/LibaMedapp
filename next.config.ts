import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack's persistent filesystem cache corrupts repeatedly on this
    // Windows setup ("Persisting failed / Compaction failed … os error 3"),
    // taking the dev server down. Disable it — dev uses in-memory caching
    // instead (slightly slower cold compiles, but stable).
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
