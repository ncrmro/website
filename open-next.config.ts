import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Enable cache interception for better performance
  enableCacheInterception: true,
});
