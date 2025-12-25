/**
 * Backward-compatibility re-export for test fixtures.
 * 
 * The playwright.fixtures.ts file imports `db` from this path because test files
 * cannot use the @/ path alias (tsconfig.json excludes them). This re-export
 * maintains a stable import path for the test infrastructure.
 */
export { db } from "../database";
