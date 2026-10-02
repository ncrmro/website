#!/usr/bin/env node
/** Create local draft refs from verified staging. Never pushes or edits the working tree. */
import {execFileSync} from 'node:child_process';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const base=process.argv[2];
if(!base||!process.argv.includes('--create-local-refs'))throw new Error('Usage: node scripts/migration/prepare-drafts.mjs <verified-final-migration-commit> --create-local-refs');
const output=path.resolve(process.env.MIGRATION_OUTPUT??'/tmp/website-quiescent-import');
const onlyId=process.argv.find(arg=>arg.startsWith('--only='))?.slice('--only='.length);
const sourcePrefix=process.argv.find(arg=>arg.startsWith('--source-prefix='))?.slice('--source-prefix='.length);
const manifest=JSON.parse(await readFile(path.join(output,'manifest.json'),'utf8'));
const git=(args,options={})=>execFileSync('git',args,{cwd:root,maxBuffer:40*1024*1024,...options}).toString().trim();
const baseCommit=git(['rev-parse',`${base}^{commit}`]);
if(git(['ls-tree','-r','--name-only',baseCommit,'docs/posts','code/web/public/posts','code/web/public/hold']))throw new Error('Base still contains legacy posts/media; finalize the migration base first.');
const hash=data=>createHash('sha256').update(data).digest('hex');
const temporary=await mkdtemp(path.join(os.tmpdir(),'quiescent-draft-index-'));
try{
  for(const post of manifest.posts.filter(p=>!p.published&&(!onlyId||p.id===onlyId)&&(!sourcePrefix||p.source.startsWith(sourcePrefix)))){
    const env={...process.env,GIT_INDEX_FILE:path.join(temporary,'index')};
    await rm(env.GIT_INDEX_FILE,{force:true});
    git(['read-tree',baseCommit],{env});
    const files=[`${post.directory}/index.md`,post.statePath,...post.assets.map(n=>`${post.directory}/${n}`),...(post.assets.length?[`${post.directory}/.gitattributes`]:[])];
    for(const file of files){
      let bytes=await readFile(path.join(output,'drafts',post.id,file));
      const asset=manifest.assets.find(a=>a.path===file&&a.id===post.id);
      if(asset){
        if(hash(bytes)!==asset.oid||bytes.length!==asset.size)throw new Error(`Staged asset changed: ${file}`);
        // Store original in LFS's local object database and verify generated pointer.
        const pointer=git(['lfs','clean','--',file],{input:bytes});
        if(!pointer.includes(`oid sha256:${asset.oid}\n`)||!pointer.endsWith(`size ${asset.size}`))throw new Error(`Unexpected LFS pointer: ${file}`);
        bytes=Buffer.from(`${pointer}\n`);
      }
      if(file===`${post.directory}/index.md`&&hash(bytes)!==post.markdownSha256)throw new Error(`Staged document changed: ${file}`);
      const blob=git(['hash-object','-w','--stdin'],{input:bytes});
      git(['update-index','--add','--cacheinfo',`100644,${blob},${file}`],{env});
    }
    const tree=git(['write-tree'],{env});
    let existing='';try{existing=git(['rev-parse','--verify',`refs/heads/${post.branch}`],{stdio:['pipe','pipe','ignore']});}catch{}
    if(existing){
      if(git(['rev-parse',`${existing}^{tree}`])!==tree)throw new Error(`Existing draft ref differs; refusing overwrite: ${post.branch}`);
      console.log(`verified ${post.branch}`);continue;
    }
    const commit=git(['commit-tree',tree,'-p',baseCommit],{input:`Import unpublished document: ${post.slug}\n`});
    git(['update-ref',`refs/heads/${post.branch}`,commit,'0000000000000000000000000000000000000000']);
    console.log(`created ${post.branch} ${commit}`);
  }
}finally{await rm(temporary,{recursive:true,force:true});}
