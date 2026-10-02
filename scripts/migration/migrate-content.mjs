#!/usr/bin/env node
/** One-shot, deterministic import. No network, Git commits, pushes, or deployments. */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from '../../code/web/node_modules/yaml/dist/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceRef = 'b5c52b93';
const output = path.resolve(process.env.MIGRATION_OUTPUT ?? '/tmp/website-quiescent-import');
const apply = process.argv.includes('--apply-public');
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 40 * 1024 * 1024 });
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
function idFor(slug) {
  // RFC 4122 UUIDv5, URL namespace, stable across every rerun.
  const namespace = Buffer.from('6ba7b8119dad11d180b400c04fd430c8','hex');
  const bytes = createHash('sha1').update(namespace).update(`https://ncrmro.com/posts/${slug}/`).digest().subarray(0,16);
  bytes[6] = (bytes[6] & 15) | 80; bytes[8] = (bytes[8] & 63) | 128;
  const s = bytes.toString('hex');
  return `${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20)}`;
}
function filename(source, oid) {
  const base = path.basename(source, path.extname(source)).normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,70) || 'image';
  return `${base}-${oid.slice(0,12)}${path.extname(source).toLowerCase()}`;
}
async function write(relative, data, destination) {
  const target = path.join(destination, relative);
  await mkdir(path.dirname(target), { recursive:true }); await writeFile(target,data);
}
const lfsAttributes = ['png','jpg','jpeg','webp','gif','avif','svg'].map(ext=>`*.${ext} filter=lfs diff=lfs merge=lfs -text`).join('\n')+'\n';
const sources = git('ls-tree','-r','--name-only',sourceRef,'docs/posts').toString().trim().split('\n').filter(Boolean);
const mediaSources = git('ls-tree','-r','--name-only',sourceRef,'code/web/public/posts').toString().trim().split('\n').filter(Boolean);
const manifest = { version:1, sourceRef:git('rev-parse',sourceRef).toString().trim(), publishedBranch:'feat/quiescent-concept', posts:[], assets:[] };
const usedMedia = new Set();
for (const source of sources) {
  const original = git('show',`${sourceRef}:${source}`);
  const text = original.toString();
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) throw new Error(`Missing frontmatter: ${source}`);
  const metadata = parse(match[1]);
  const originalBody = text.slice(match[0].length);
  let body = originalBody;
  const slug = path.basename(source).replace(/^\d{4}-\d{2}-\d{2}-/,'').replace(/\.mdx?$/,'');
  const createdAt = path.basename(source).slice(0,10);
  const id = idFor(slug);
  const published = metadata.published === true && metadata.draft !== true;
  const branch = published ? manifest.publishedBranch : `quiescent/posts/${id}/${id}`;
  const directory = `content/posts/${createdAt}-${slug}`;
  const destination = path.join(output, published ? 'published' : `drafts/${id}`);
  const replacements = [];
  const assets = [];
  for (const mediaSource of mediaSources.filter(p=>p.startsWith(`code/web/public/posts/${slug}/`))) {
    const stored = git('show',`${sourceRef}:${mediaSource}`);
    const storedPointer = stored.toString();
    let bytes;
    try { bytes = await readFile(path.join(root,mediaSource)); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const oid = /oid sha256:([a-f0-9]{64})/.exec(storedPointer)?.[1];
      if (!oid) bytes = stored;
      else {
        const common = path.resolve(root,git('rev-parse','--git-common-dir').toString().trim());
        bytes = await readFile(path.join(common,'lfs/objects',oid.slice(0,2),oid.slice(2,4),oid));
      }
    }
    if(bytes.subarray(0,42).toString().startsWith('version https://git-lfs')) throw new Error(`Unhydrated original: ${mediaSource}`);
    const oid = hash(bytes);
    const pointer = git('show',`${sourceRef}:${mediaSource}`).toString();
    if(pointer.startsWith('version https://git-lfs')) {
      if(!pointer.includes(`oid sha256:${oid}\n`) || !pointer.includes(`size ${bytes.length}\n`)) throw new Error(`LFS integrity mismatch: ${mediaSource}`);
    } else if(hash(git('show',`${sourceRef}:${mediaSource}`))!==oid) throw new Error(`Original changed: ${mediaSource}`);
    const name = filename(mediaSource,oid);
    const oldUrl = mediaSource.replace('code/web/public','');
    for(const reference of [`https://r2.ncrmro.com${oldUrl}`,oldUrl]) {
      const count = body.split(reference).length-1;
      if(count) { body = body.split(reference).join(name); replacements.push({from:reference,to:name,count}); }
    }
    assets.push({source:mediaSource,name,oid,size:bytes.length,path:`${directory}/${name}`,r2Key:`images/${id}/${oid}`});
    await write(`${directory}/${name}`,bytes,destination);
    usedMedia.add(mediaSource);
  }
  const {published:ignoredPublished,draft:ignoredDraft,heroImage,...fields} = metadata;
  const headerImage = heroImage ? assets.find(a=>path.basename(a.source)===heroImage)?.name : null;
  if(heroImage&&!headerImage) throw new Error(`Unresolved header image ${heroImage}: ${source}`);
  const frontmatter = {...fields,description:fields.description??'',tags:fields.tags??[],slug,headerImage,id,createdAt};
  const markdown = `---\n${stringify(frontmatter,{lineWidth:0})}---\n${body}`;
  const state = {directory,...(published?{publishedAt:new Date(metadata.publish_date??createdAt).toISOString()}:{})};
  const statePath = `content/posts/.quiescent/${id}.json`;
  await write(`${directory}/index.md`,markdown,destination);
  await write(statePath,JSON.stringify(state)+'\n',destination);
  if(assets.length)await write(`${directory}/.gitattributes`,lfsAttributes,destination);
  // Reconstruct the exact pre-import body; do not silently strip MDX, HTML, or code.
  let restored = body;
  for(const replacement of [...replacements].reverse()) restored=restored.split(replacement.to).join(replacement.from);
  if(restored!==originalBody) throw new Error(`Body reconciliation failed: ${source}`);
  const unresolved=[...body.matchAll(/(?:https:\/\/r2\.ncrmro\.com)?\/posts\/[^\s"'<>)]*\/media\/[^\s"'<>)]*/g)];
  if(unresolved.length)throw new Error(`Unresolved assets: ${source}: ${unresolved.map(x=>x[0]).join(', ')}`);
  manifest.posts.push({source,id,slug,createdAt,published,branch,directory,sourceSha256:hash(original),originalBodySha256:hash(originalBody),bodySha256:hash(body),markdownSha256:hash(markdown),statePath,replacements,assets:assets.map(a=>a.name)});
  manifest.assets.push(...assets.map(a=>({...a,id,published,branch})));
}
if(usedMedia.size!==mediaSources.length)throw new Error(`Unassigned media: ${mediaSources.filter(x=>!usedMedia.has(x)).join(', ')}`);
await mkdir(output,{recursive:true});
await writeFile(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
if(apply){
  for(const post of manifest.posts.filter(p=>p.published)){
    const files=[`${post.directory}/index.md`,post.statePath,...post.assets.map(n=>`${post.directory}/${n}`),...(post.assets.length?[`${post.directory}/.gitattributes`]:[])];
    for(const file of files){
      const target=path.join(root,file); const prepared=await readFile(path.join(output,'published',file));
      let existing; try{existing=await readFile(target);}catch(error){if(error.code!=='ENOENT')throw error;}
      if(existing&&!existing.equals(prepared))throw new Error(`Refusing to overwrite existing content: ${file}`);
      if(!existing){await mkdir(path.dirname(target),{recursive:true});await writeFile(target,prepared,{flag:'wx'});}
    }
  }
  await writeFile(path.join(root,'scripts/migration/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
}
console.log(JSON.stringify({output,applied:apply,posts:manifest.posts.length,published:manifest.posts.filter(p=>p.published).length,drafts:manifest.posts.filter(p=>!p.published).length,assets:manifest.assets.length,bytes:manifest.assets.reduce((n,a)=>n+a.size,0)},null,2));
