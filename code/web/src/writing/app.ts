import { reservedSlugs } from "./policy";
import { getCollection } from "astro:content";
import { postSlug } from "../lib/posts";
import { createForge, createLfsClient, requirePublishingForge } from "@quiescent/git";
import {
  configuredCollection,
  createDocumentService,
  DocumentError,
  defineDocumentConfig,
  localR2Media,
  type MediaStorage,
  WritingConfigurationError,
} from "@quiescent/server";
import { markdownImages } from "@quiescent/server/content";
import configuration from "../../quiescent.config.json" with { type: "json" };
import type { Collection, ExampleMetadata } from "./collections";
import type { WritingEnv } from "./config";

const documentConfig = defineDocumentConfig(configuration);

export { writingAuthor } from "./auth";
export type { WritingEnv } from "./config";

function configuredMedia(env: WritingEnv): MediaStorage {
  if (env.WRITING_MEDIA) return localR2Media(env.WRITING_MEDIA);
  throw new WritingConfigurationError("Writing media storage is not configured.");
}
export function writingApp(env: WritingEnv, collection: Collection = "posts") {
  if (!env.SERVICE_TOKEN)
    throw new WritingConfigurationError("Set SERVICE_TOKEN to connect the writing repository.");
  const owner = documentConfig.repository.owner;
  const repo = documentConfig.repository.name;
  const forge = requirePublishingForge(
    createForge({
      kind: documentConfig.repository.provider,
      owner,
      repo,
      token: env.SERVICE_TOKEN,
    }),
  );
  const delivery = configuredMedia(env);
  const media: MediaStorage = {
    ...delivery,
    async prepare(id, type, size) {
      const ticket = await delivery.prepare(id, type, size);
      if (ticket.url.startsWith("/"))
        ticket.url = `/api/documents/${collection}/${id}/uploads/${ticket.assetId}`;
      return ticket;
    },
  };
  const service = createDocumentService<ExampleMetadata>({
    ...configuredCollection<ExampleMetadata>(documentConfig, collection),
    references: (document) => [
      ...markdownImages(document.body),
      ...(document.frontmatter.headerImage ? [document.frontmatter.headerImage] : []),
    ],
    async beforePublish(document) {
      const reserved = new Set([...reservedSlugs, ...(await getCollection("blog")).map((post) => postSlug(post.id))]);
      if (reserved.has(document.frontmatter.slug)) throw new DocumentError("This slug is reserved by an existing page", "conflict");
      if (!document.frontmatter.title.trim())
        throw new DocumentError("Add a title before publishing", "invalid");
      if (
        (await service.listPublished()).some(
          (other) =>
            other.document.id !== document.id &&
            other.document.frontmatter.slug === document.frontmatter.slug,
        )
      )
        throw new DocumentError("This slug is already published", "conflict");
    },
    forge,
    media,
    lfs: createLfsClient({
      endpoint: `https://github.com/${owner}/${repo}.git/info/lfs`,
      authorization: `Basic ${btoa(`${owner}:${env.SERVICE_TOKEN}`)}`,
    }),
    author: {
      name: env.WRITING_AUTHOR_NAME ?? "Nicholas Romero",
      email: env.WRITING_AUTHOR_EMAIL ?? "ncrmro@gmail.com",
    },
  });
  return { media, service };
}
