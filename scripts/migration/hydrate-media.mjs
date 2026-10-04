#!/usr/bin/env node
/** Idempotent remote upload with read-back SHA-256 proof; uses Wrangler's normal auth. */
import {execFileSync} from 'node:child_process';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
if(!process.argv.includes('--upload-and-verify'))throw new Error('Explicit --upload-and-verify is required; this writes Cloudflare R2 objects.');
const output=path.resolve(process.env.MIGRATION_OUTPUT??'/tmp/website-quiescent-import');
const manifest=JSON.parse(await readFile(path.join(output,'manifest.json'),'utf8'));
const temporary=await mkdtemp(path.join(os.tmpdir(),'quiescent-r2-verify-'));
const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml'};
const hash=data=>createHash('sha256').update(data).digest('hex');
const wrangler=path.join(root,'code/web/node_modules/wrangler/bin/wrangler.js');
function command(args){execFileSync(process.execPath,[wrangler,'r2','object',...args],{cwd:path.join(root,'code/web'),stdio:'pipe',maxBuffer:1024*1024});}
try{
  for(const asset of manifest.assets){
    const source=path.join(output,asset.published?'published':`drafts/${asset.id}`,asset.path);
    const bytes=await readFile(source);
    if(hash(bytes)!==asset.oid||bytes.length!==asset.size)throw new Error(`Invalid source: ${asset.path}`);
    const key=`ncrmro-website-quiescent-media/${asset.r2Key}`;
    const contentType=mime[path.extname(asset.name)];
    if(!contentType)throw new Error(`Unsupported media: ${asset.name}`);
    command(['put',key,'--file',source,'--content-type',contentType,'--remote']);
    const readback=path.join(temporary,asset.oid);
    command(['get',key,'--file',readback,'--remote']);
    const restored=await readFile(readback);
    if(hash(restored)!==asset.oid||restored.length!==asset.size)throw new Error(`R2 verification failed: ${key}`);
    await rm(readback);console.log(`verified ${asset.r2Key} ${asset.size}`);
  }
}finally{await rm(temporary,{recursive:true,force:true});}
