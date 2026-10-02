import { publicSlug, reservedSlugs, canPublish } from '../src/writing/policy.ts';
import assert from 'node:assert/strict';
import { encode } from '@auth/core/jwt';
import { defineDocumentConfig, configuredCollection } from '@quiescent/server/documents';
import configuration from '../quiescent.config.json' with { type: 'json' };

assert.equal(publicSlug({id: 'uuid', slug: '2026-10-01-notes'}), '2026-10-01-notes');
assert.equal(publicSlug({id: '2026-10-01-notes'}), 'notes');
for (const slug of ['new', 'tech', 'food', 'travel', 'the-bottom-turtle-is-a-yubikey', 'sops-secrets-with-a-yubikey']) assert.ok(reservedSlugs.has(slug));
assert.ok(canPublish('ncrmro.com') && canPublish('ncrmro-website.ncrmro.workers.dev'));
assert.ok(!canPublish('preview-ncrmro-website.ncrmro.workers.dev'));
const base = process.env.BASE_URL;
assert.ok(base, 'Set BASE_URL to this checkout’s preview URL');
const config = defineDocumentConfig(configuration);
assert.equal(config.repository.publishedBranch, 'feat/quiescent-concept');
assert.equal(config.collections.posts.directory, 'content/posts');
assert.ok(configuredCollection(config, 'posts'));
const request = (path, options = {}) => fetch(new URL(path, base), {redirect: 'manual', ...options});
for (const path of ['/', '/posts/', '/resume', '/projects', '/rss.xml', '/posts/bootstrapping-nixos-secrets-before-first-boot/']) {
  const response = await request(path);
  assert.equal(response.status, 200, path);
  assert.ok((await response.text()).length > 1000, path);
}
const sitemap = await (await request('/sitemap-0.xml')).text();
assert.ok(sitemap.includes('/posts/bootstrapping-nixos-secrets-before-first-boot/'));
assert.ok(!sitemap.includes('/write') && !sitemap.includes('/posts/new/</loc>') && !sitemap.includes('/drafts/'));
for (const path of ['/api/documents/posts', '/api/documents/posts/schema', '/api/tags/posts']) {
  const response = await request(path);
  assert.equal(response.status, 401, path);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
}
assert.equal((await request('/api/documents/posts', {method: 'POST', headers: {Origin: base}})).status, 401);
for (const path of ['/write', '/posts/new', '/posts/00000000-0000-0000-0000-000000000000/edit']) {
  const response = await request(path);
  assert.equal(response.status, 302);
  assert.match(response.headers.get('location'), /\/api\/auth\/signin/);
}
// Local-only signed test sessions exercise the real JWT allowlist without an OAuth round trip.
if (process.env.TEST_AUTH_SECRET) {
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(base).hostname));
  const session = async email => {
    const name = 'authjs.session-token';
    const token = await encode({secret: process.env.TEST_AUTH_SECRET, salt: name, token: {email, name: 'Local test'}});
    return {Cookie: `${name}=${token}`};
  };
  const headers = await session('ncrmro@gmail.com');
  for (const path of ['/write', '/posts/new']) {
    const response = await request(path, {headers});
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.ok((await response.text()).includes('awaiting its repository connection'));
  }
  if (process.env.PREVIEW_URL) {
  assert.ok(['127.0.0.1', 'localhost'].includes(new URL(process.env.PREVIEW_URL).hostname));
  const previewRequest = (path, options) => fetch(new URL(path, process.env.PREVIEW_URL), {redirect: 'manual', ...options});
  const previewHeaders = headers;
  for (const method of ['GET', 'HEAD', 'POST']) {
    assert.equal((await previewRequest('/api/documents/posts/00000000-0000-0000-0000-000000000000', {method, headers: previewHeaders})).status, 403);
  }
  for (const path of ['/write', '/posts/new']) {
    const response = await previewRequest(path, {headers: previewHeaders});
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.ok(html.includes('This preview is read-only'));
    assert.ok(!html.includes('id="writing"') && !html.includes('<section data-collection='));
  }
  }
  assert.equal((await request('/api/documents/posts', {headers})).status, 503);
  assert.equal((await request('/api/documents/posts', {method: 'POST', headers: {...headers, Origin: 'https://other.invalid'}})).status, 403);
  assert.equal((await request('/api/documents/posts', {headers: await session('other@example.invalid')})).status, 401);
}
console.log('Writing smoke passed: configured branch, legacy pages, sitemap, private routes and optional local JWT checks.');
