import { test, expect } from "@playwright/test";

/**
 * Test suite for admin-only dashboard access
 * Ensures that only users with admin=true can access the dashboard
 * 
 * These tests verify that unauthenticated users are redirected to sign-in
 * when attempting to access any dashboard route.
 */

test("unauthenticated users cannot access dashboard home", async ({ page }) => {
  await page.goto("/dashboard");
  
  // Should be redirected to sign in with callback URL
  await page.waitForURL((url) => url.toString().includes("/api/auth/signin"));
  
  expect(page.url()).toContain("/api/auth/signin");
  expect(page.url()).toContain("callbackUrl");
});

test("unauthenticated users cannot access dashboard posts", async ({ page }) => {
  await page.goto("/dashboard/posts");
  
  // Should be redirected to sign in
  await page.waitForURL((url) => url.toString().includes("/api/auth/signin"));
  
  expect(page.url()).toContain("/api/auth/signin");
});

test("unauthenticated users cannot access dashboard journal", async ({ page }) => {
  await page.goto("/dashboard/journal");
  
  // Should be redirected to sign in
  await page.waitForURL((url) => url.toString().includes("/api/auth/signin"));
  
  expect(page.url()).toContain("/api/auth/signin");
});

test("unauthenticated users cannot access new post page", async ({ page }) => {
  await page.goto("/dashboard/posts/new");
  
  // Should be redirected to sign in
  await page.waitForURL((url) => url.toString().includes("/api/auth/signin"));
  
  expect(page.url()).toContain("/api/auth/signin");
});
