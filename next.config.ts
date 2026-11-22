import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

export default nextConfig;

// Sprístupní Cloudflare bindingy (D1) aj pri `next dev`.
initOpenNextCloudflareForDev();
