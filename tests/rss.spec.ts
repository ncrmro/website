import { test, expect } from '@playwright/test';

test.describe('RSS Feed', () => {
  test('should return valid RSS XML', async ({ page }) => {
    const response = await page.goto('/feed.xml');
    
    // Check that we got a successful response
    expect(response?.status()).toBe(200);
    
    // Check content type
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('application/rss+xml');
    
    // Get the page content as text
    const content = await page.content();
    
    // Verify it's valid XML starting with XML declaration
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    
    // Verify RSS structure
    expect(content).toContain('<rss version="2.0"');
    expect(content).toContain('<channel>');
    expect(content).toContain('<title>Nicholas Romero</title>');
    expect(content).toContain('<link>');
    expect(content).toContain('<description>');
    expect(content).toContain('</channel>');
    expect(content).toContain('</rss>');
  });

  test('should include RSS feed link in HTML head', async ({ page }) => {
    await page.goto('/');
    
    // Check for alternate RSS link in the page head
    const rssLink = await page.locator('link[type="application/rss+xml"]').getAttribute('href');
    expect(rssLink).toBe('/feed.xml');
  });
});
