#!/usr/bin/env node
// @ts-nocheck
import fs from 'fs/promises';
import path from 'path';
import { parse as parseYAML, stringify as stringifyYAML } from 'yaml';
import { slugify } from '../src/lib/utils';

interface CLIOptions {
  directory: string;
  push: boolean;
  serverUrl: string;
  help: boolean;
}

interface PostData {
  id?: string;
  title: string;
  description?: string;
  body: string;
  slug: string;
  published?: boolean;
  publish_date?: string;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

interface ObsidianPost {
  frontmatter: {
    title: string;
    description?: string;
    tags?: string[];
    published?: boolean;
    publish_date?: string;
    slug?: string;
  };
  content: string;
}

function showHelp(): void {
  console.log(`
Blog Post Sync CLI

Usage: npm run sync-posts [options]

Options:
  -d, --directory <path>     Local directory for blog posts (default: ./obsidian-posts)
  -p, --push                 Push local posts to server (default: download only)
  -s, --server <url>         Server URL (default: http://localhost:3000)
  -h, --help                 Show this help message

Examples:
  npm run sync-posts                                    # Download all posts as YAML
  npm run sync-posts -- -d ./my-posts                  # Download to specific directory
  npm run sync-posts -- --push                         # Push local posts to server
  npm run sync-posts -- -d ./posts --push -s https://mysite.com  # Push from directory to remote server

Note: For push operations, you need to set AUTH_COOKIE environment variable
`);
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    directory: './obsidian-posts',
    push: false,
    serverUrl: 'http://localhost:3000',
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
        
      case '-d':
      case '--directory':
        options.directory = args[++i];
        if (!options.directory) {
          console.error('Error: Directory path is required');
          process.exit(1);
        }
        break;
        
      case '-p':
      case '--push':
        options.push = true;
        break;
        
      case '-s':
      case '--server':
        options.serverUrl = args[++i];
        if (!options.serverUrl) {
          console.error('Error: Server URL is required');
          process.exit(1);
        }
        break;
        
      default:
        if (arg.startsWith('-')) {
          console.error(`Error: Unknown option '${arg}'`);
          console.log('Use --help for usage information');
          process.exit(1);
        }
    }
  }
  
  return options;
}

async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, (error as Error).message);
    process.exit(1);
  }
}

async function downloadPosts(options: CLIOptions): Promise<void> {
  try {
    console.log(`📥 Downloading posts from ${options.serverUrl}...`);
    
    const authCookie = process.env.AUTH_COOKIE;
    if (!authCookie) {
      console.error('Error: AUTH_COOKIE environment variable is required');
      process.exit(1);
    }

    const response = await fetch(`${options.serverUrl}/api/posts/sync`, {
      headers: {
        'Cookie': authCookie,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    const posts = data.posts || [];
    
    await ensureDirectory(options.directory);
    
    console.log(`📝 Writing ${posts.length} posts to ${options.directory}...`);
    
    for (const post of posts) {
      const filename = `${post.slug}.md`;
      const filePath = path.join(options.directory, filename);
      
      // Create frontmatter
      const frontmatter = {
        title: post.title,
        description: post.description || '',
        slug: post.slug,
        published: post.published,
        publish_date: post.publish_date,
        tags: post.tags || [],
        id: post.id,
        created_at: post.created_at,
        updated_at: post.updated_at,
      };
      
      // Remove empty values
      Object.keys(frontmatter).forEach(key => {
        if (frontmatter[key] === null || frontmatter[key] === undefined || frontmatter[key] === '') {
          delete frontmatter[key];
        }
      });
      
      // Create Obsidian-style markdown file
      const content = `---
${stringifyYAML(frontmatter).trim()}
---

${post.body}`;
      
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`  ✅ ${filename}`);
    }
    
    console.log(`\n🎉 Downloaded ${posts.length} posts successfully!`);
    
  } catch (error) {
    console.error('Error downloading posts:', (error as Error).message);
    process.exit(1);
  }
}

async function parseObsidianFile(filePath: string): Promise<ObsidianPost> {
  const content = await fs.readFile(filePath, 'utf8');
  
  // Check if file starts with frontmatter
  if (!content.startsWith('---')) {
    throw new Error(`File ${filePath} does not contain YAML frontmatter`);
  }
  
  // Split frontmatter and content
  const parts = content.split(/^---$/m);
  if (parts.length < 3) {
    throw new Error(`File ${filePath} has invalid frontmatter format`);
  }
  
  const frontmatterText = parts[1].trim();
  const bodyContent = parts.slice(2).join('---').trim();
  
  try {
    const frontmatter = parseYAML(frontmatterText) || {};
    return {
      frontmatter,
      content: bodyContent
    };
  } catch (error) {
    throw new Error(`Invalid YAML in ${filePath}: ${(error as Error).message}`);
  }
}

async function pushPosts(options: CLIOptions): Promise<void> {
  try {
    console.log(`📤 Pushing posts from ${options.directory} to ${options.serverUrl}...`);
    
    const authCookie = process.env.AUTH_COOKIE;
    if (!authCookie) {
      console.error('Error: AUTH_COOKIE environment variable is required');
      process.exit(1);
    }
    
    // Read all markdown files from directory
    const files = await fs.readdir(options.directory);
    const markdownFiles = files.filter(file => file.endsWith('.md'));
    
    if (markdownFiles.length === 0) {
      console.log('No markdown files found in directory');
      return;
    }
    
    console.log(`📂 Found ${markdownFiles.length} markdown files`);
    
    const posts: PostData[] = [];
    
    for (const filename of markdownFiles) {
      const filePath = path.join(options.directory, filename);
      
      try {
        const obsidianPost = await parseObsidianFile(filePath);
        const { frontmatter, content } = obsidianPost;
        
        // Validate required fields
        if (!frontmatter.title) {
          console.warn(`⚠️  Skipping ${filename}: Missing title`);
          continue;
        }
        
        // Generate slug if not provided
        const slug = frontmatter.slug || slugify(frontmatter.title);
        
        const postData: PostData = {
          title: frontmatter.title,
          description: frontmatter.description || '',
          body: content,
          slug,
          published: frontmatter.published || false,
          publish_date: frontmatter.publish_date || null,
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        };
        
        posts.push(postData);
        console.log(`  📄 Parsed ${filename} -> ${slug}`);
        
      } catch (error) {
        console.error(`❌ Error parsing ${filename}:`, (error as Error).message);
      }
    }
    
    if (posts.length === 0) {
      console.log('No valid posts to sync');
      return;
    }
    
    // Send posts to server
    console.log(`\n🚀 Syncing ${posts.length} posts to server...`);
    
    const response = await fetch(`${options.serverUrl}/api/posts/sync`, {
      method: 'POST',
      headers: {
        'Cookie': authCookie,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ posts }),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Display results
    const results = result.results || [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const res of results) {
      if (res.status === 'success') {
        console.log(`  ✅ ${res.message}: ${res.slug}`);
        successCount++;
      } else {
        console.error(`  ❌ Error: ${res.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Sync complete! ${successCount} successful, ${errorCount} errors`);
    
  } catch (error) {
    console.error('Error pushing posts:', (error as Error).message);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    return;
  }
  
  try {
    const options = parseArgs(args);
    
    if (options.help) {
      showHelp();
      return;
    }
    
    if (options.push) {
      await pushPosts(options);
    } else {
      await downloadPosts(options);
    }
    
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}