import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Bez inkrementálnej cache: stránky sú dynamické, R2 bucket zatiaľ netreba.
export default defineCloudflareConfig({});
