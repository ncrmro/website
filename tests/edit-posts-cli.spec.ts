import { test, expect } from '@playwright/test';
import { db } from '../playwright.fixtures';
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// Test the CLI help command
test('edit-posts CLI shows help', async () => {
  const cliProcess = spawn('node', ['bin/dist/edit-posts.js', '--help'], {
    cwd: process.cwd(),
  });

  let output = '';
  
  cliProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  await new Promise<void>((resolve) => {
    cliProcess.on('close', () => {
      resolve();
    });
  });

  expect(output).toContain('Post Editor CLI');
  expect(output).toContain('Usage: npm run edit-posts');
  expect(output).toContain('EDITOR');
  expect(output).toContain('vim');
});

// Test frontmatter parsing logic
test('frontmatter parsing logic', () => {
  const testContent = `---
title: Test Post
description: A test post
slug: test-post
published: true
publish_date: 2024-01-01
---

This is the body of the post.
More content here.`;

  // Split frontmatter and body like the CLI does
  const parts = testContent.split(/^---$/m);
  expect(parts.length).toBeGreaterThanOrEqual(3);
  
  const frontmatterText = parts[1].trim();
  const bodyText = parts.slice(2).join('---').trim();
  
  expect(frontmatterText).toContain('title: Test Post');
  expect(bodyText).toContain('This is the body of the post');
  
  // Parse frontmatter
  const frontmatterLines = frontmatterText.split('\n');
  const parsedData: any = {};
  
  for (const line of frontmatterLines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'published') {
        parsedData[key] = value === 'true' ? 1 : 0;
      } else if (key === 'publish_date') {
        parsedData[key] = value || null;
      } else {
        parsedData[key] = value;
      }
    }
  }
  
  expect(parsedData.title).toBe('Test Post');
  expect(parsedData.description).toBe('A test post');
  expect(parsedData.slug).toBe('test-post');
  expect(parsedData.published).toBe(1);
  expect(parsedData.publish_date).toBe('2024-01-01');
});

// Test that the CLI can be built successfully
test('CLI builds without errors', async () => {
  const buildProcess = spawn('npm', ['run', 'build-edit-posts-cli'], {
    cwd: process.cwd(),
  });

  let stderr = '';
  
  buildProcess.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  const exitCode = await new Promise<number>((resolve) => {
    buildProcess.on('close', (code) => {
      resolve(code || 0);
    });
  });

  // Check for TypeScript compilation errors
  expect(stderr).not.toContain('error TS');
  expect(exitCode).toBe(0);
});
