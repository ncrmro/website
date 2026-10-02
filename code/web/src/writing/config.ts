import type { MediaBucket } from "@quiescent/server";
export interface WritingEnv {
 SERVICE_TOKEN?: string;
 WRITING_MEDIA?: MediaBucket;
 WRITING_AUTHOR_NAME?: string;
 WRITING_AUTHOR_EMAIL?: string;
}
