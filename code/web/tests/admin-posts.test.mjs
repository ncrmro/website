import {test} from "node:test";
import assert from "node:assert/strict";
import {oldestFirst, postDate, coverFilename, thumbnailUrl} from "../src/writing/admin-posts.ts";
const post = (id, createdAt, frontmatter = {}, body = "") => ({document: {id,createdAt,frontmatter,body}, branch:null, headSha:"a".repeat(40),state:"published"});

test("sorts oldest first across publication dates and unpublished creation dates", () => {
  const recent=post("recent","2025-01-01",{publish_date:"2026-02-03"});
  const published=post("published","2025-01-01",{publish_date:"2020-06-10T12:00:00Z"});
  const draft=post("draft","2017-11-03",{publish_date:null});
  assert.deepEqual([recent,published,draft].sort(oldestFirst).map(p=>p.document.id),["draft","published","recent"]);
  assert.equal(postDate(draft),"2017-11-03");
});
test("artwork prefers cover metadata and ignores images inside code or outside document storage", () => {
  const p=post("id","2020-01-01",{},'```md\n![example](not-artwork.png)\n```\n\n![External](https://other.test/image.png)\n\n![Artwork](photo.png)');
  assert.equal(coverFilename(p),"photo.png");
  p.document.frontmatter.headerImage="cover.png";
  assert.equal(coverFilename(p),"cover.png");
});
test("thumbnail URLs preserve draft selection and do not fetch unsaved local images", () => {
  const p=post("id","2020-01-01",{headerImage:"cover.png"});
  p.branch="quiescent/posts/id/cycle";
  const url=new URL(thumbnailUrl("posts",p),"https://site.test");
  assert.equal(url.pathname,"/api/documents/posts/id/thumbnail");
  assert.equal(url.searchParams.get("branch"),p.branch);
  assert.equal(url.searchParams.get("filename"),"cover.png");
  assert.equal(url.searchParams.get("v"),p.headSha);
  p.headSha="";assert.equal(thumbnailUrl("posts",p),undefined);
});
