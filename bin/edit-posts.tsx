#!/usr/bin/env node
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { Kysely, SqliteDialect } from 'kysely';
import SQLiteDatabase from 'better-sqlite3';
import { spawn } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Database setup
const databasePath = process.env.DATABASE_PATH || "./database/sqlite3.db";
const sqlite = new SQLiteDatabase(databasePath);

interface Database {
  posts: {
    id: string;
    user_id: string;
    title: string;
    body: string;
    description: string;
    slug: string;
    published: number;
    publish_date: string | null;
    created_at: string;
    updated_at: string;
  };
  tags: {
    id: string;
    value: string;
    created_at: string;
    updated_at: string;
  };
  posts_tags: {
    id: string;
    post_id: string;
    tag_id: string;
  };
}

const db = new Kysely<Database>({
  dialect: new SqliteDialect({
    database: sqlite,
  }),
});

interface Post {
  id: string;
  title: string;
  body: string;
  description: string;
  slug: string;
  published: number;
  publish_date: string | null;
}

interface SelectItem {
  label: string;
  value: string;
}

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const postsData = await db
        .selectFrom('posts')
        .select([
          'id',
          'title',
          'body',
          'description',
          'slug',
          'published',
          'publish_date',
        ])
        .orderBy('updated_at', 'desc')
        .execute();
      
      setPosts(postsData);
      setLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const editPost = async (post: Post) => {
    setEditing(true);
    
    // Get editor from environment variable
    const editor = process.env.EDITOR || process.env.VISUAL || 'vim';
    
    // Create temporary file with post content
    const tmpFile = join(tmpdir(), `post-${post.slug}-${Date.now()}.md`);
    
    // Create post content with frontmatter
    const frontmatter = [
      '---',
      `title: ${post.title}`,
      `description: ${post.description || ''}`,
      `slug: ${post.slug}`,
      `published: ${post.published ? 'true' : 'false'}`,
      post.publish_date ? `publish_date: ${post.publish_date}` : '',
      '---',
      '',
    ].filter(line => line !== '').join('\n');
    
    const content = `${frontmatter}${post.body}`;
    
    try {
      writeFileSync(tmpFile, content, 'utf8');
      
      // Open editor
      await new Promise<void>((resolve, reject) => {
        const editorProcess = spawn(editor, [tmpFile], {
          stdio: 'inherit',
        });
        
        editorProcess.on('exit', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Editor exited with code ${code}`));
          }
        });
        
        editorProcess.on('error', (err) => {
          reject(err);
        });
      });
      
      // Read edited content
      const editedContent = readFileSync(tmpFile, 'utf8');
      
      // Parse frontmatter and body
      const parts = editedContent.split(/^---$/m);
      if (parts.length < 3) {
        throw new Error('Invalid file format: frontmatter not found');
      }
      
      const frontmatterText = parts[1].trim();
      const bodyText = parts.slice(2).join('---').trim();
      
      // Parse frontmatter
      const frontmatterLines = frontmatterText.split('\n');
      const updatedData: Record<string, string | number | null> = {};
      
      for (const line of frontmatterLines) {
        const match = line.match(/^(\w+):\s*(.*)$/);
        if (match) {
          const [, key, value] = match;
          if (key === 'published') {
            updatedData[key] = value === 'true' ? 1 : 0;
          } else if (key === 'publish_date') {
            updatedData[key] = value || null;
          } else {
            updatedData[key] = value;
          }
        }
      }
      
      // Update database
      await db
        .updateTable('posts')
        .set({
          title: updatedData.title || post.title,
          description: updatedData.description || post.description,
          body: bodyText,
          published: updatedData.published ?? post.published,
          publish_date: updatedData.publish_date ?? post.publish_date,
        })
        .where('id', '=', post.id)
        .execute();
      
      // Clean up temp file
      unlinkSync(tmpFile);
      
      console.log(`\n✅ Post "${post.title}" updated successfully!`);
      process.exit(0);
      
    } catch (err) {
      setError((err as Error).message);
      setEditing(false);
      // Clean up temp file on error
      try {
        unlinkSync(tmpFile);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  };

  const handleSelect = (item: SelectItem) => {
    const post = posts.find(p => p.id === item.value);
    if (post) {
      editPost(post);
    }
  };

  if (loading) {
    return (
      <Box>
        <Text>Loading posts...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  if (editing) {
    return (
      <Box>
        <Text>Opening editor...</Text>
      </Box>
    );
  }

  if (posts.length === 0) {
    return (
      <Box>
        <Text>No posts found.</Text>
      </Box>
    );
  }

  const items: SelectItem[] = posts.map(post => ({
    label: `${post.published ? '✓' : '○'} ${post.title}`,
    value: post.id,
  }));

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Select a post to edit:</Text>
      </Box>
      <SelectInput items={items} onSelect={handleSelect} />
      <Box marginTop={1}>
        <Text dimColor>
          Use ↑↓ to navigate, Enter to select. Editor: {process.env.EDITOR || process.env.VISUAL || 'vim'}
        </Text>
      </Box>
    </Box>
  );
};

function showHelp(): void {
  console.log(`
Post Editor CLI

Usage: npm run edit-posts [options]

Options:
  -h, --help                 Show this help message

Environment Variables:
  EDITOR                     Editor to use (default: vim)
  VISUAL                     Alternative editor variable
  DATABASE_PATH              Path to SQLite database (default: ./database/sqlite3.db)

Description:
  Interactive CLI for editing blog posts stored in the database.
  Opens posts in your native terminal editor (defined by EDITOR environment variable).

Examples:
  npm run edit-posts                    # Use default editor (vim)
  EDITOR=nano npm run edit-posts        # Use nano as editor
  EDITOR=emacs npm run edit-posts       # Use emacs as editor

Notes:
  - Use ↑↓ arrow keys to navigate the post list
  - Press Enter to select a post to edit
  - Posts marked with ✓ are published, ○ are unpublished
  - Edit the frontmatter (between ---) to change post metadata
  - The body comes after the second ---
`);
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  // Check if database exists
  if (!existsSync(databasePath)) {
    console.error(`Error: Database not found at ${databasePath}`);
    console.error('Run "npm run mig" to create the database first.');
    process.exit(1);
  }

  render(<App />);
}

main();
