// @ts-nocheck
import { db, sqlite } from "./database";
import fs from "fs/promises";
import * as crypto from "crypto";

const migrationsTable = `
    CREATE TABLE IF NOT EXISTS migrations
    (
        id         integer                             NOT NULL PRIMARY KEY,
        filename   text                                NOT NULL UNIQUE,
        sha        text                                NOT NULL UNIQUE,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
    CREATE TRIGGER IF NOT EXISTS migrations_insert_timestamp_trigger
        AFTER INSERT
        ON migrations
    BEGIN
        UPDATE migrations
        SET created_at = CURRENT_TIMESTAMP
        WHERE id = new.id;
    END;

    CREATE TRIGGER IF NOT EXISTS migrations_update_timestamp_trigger
        AFTER UPDATE
        ON migrations
    BEGIN
        UPDATE migrations
        SET created_at = old.created_at AND updated_at = CURRENT_TIMESTAMP
        WHERE id = new.id;
    END;
`;

function sha256(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

function log(message: TemplateStringsArray, ...values: any[]) {
  console.log("MESSAGE", message.raw[0]);
  console.info(`MIG: ${message}`);
}

let uptoDate = true;

async function runMigrations() {
  sqlite.exec(migrationsTable);
  const [committedMigrations, migrationFilenames] = await Promise.all([
    // @ts-ignore
    db.selectFrom("migrations").select(["id", "filename", "sha"]).execute(),
    fs.readdir("database/migrations"),
  ]);
  const migrations = new Map(
    committedMigrations.map((row) => [row.filename, row])
  );

  for (const migrationFilename of migrationFilenames.sort()) {
    const migration = await fs.readFile(
      `database/migrations/${migrationFilename}`,
      "utf8"
    );
    const sha = sha256(migration);
    const committedSHA = migrations.get(migrationFilename)?.sha;

    // Check committed migration and filesystem migration's contents match.
    if (committedSHA && committedSHA !== sha) {
      throw new Error(
        `Existing migration ${migrationFilename} SHA doesn't match SHA from filesystem migration`
      );
    } else if (!committedSHA) {
      uptoDate = false;
      console.log(`Running migration ${migrationFilename}`);
      const query = `
        BEGIN TRANSACTION;
        ${migration}
        INSERT INTO migrations (filename, sha)
        VALUES ('${migrationFilename}', '${sha}');
        END TRANSACTION;
      `;
      sqlite.exec(query);
    }
  }
}

async function seed() {
  if (process.argv.find((arg) => arg === "--seed")) {
    console.log("Running seeds");
    const seeds = await fs.readdir("database/seeds");
    for (const filename of seeds.sort()) {
      console.log(`Running seed ${filename}`);
      const seed = await fs.readFile(`database/seeds/${filename}`, "utf8");
      sqlite.exec(seed);
    }
  }
}

async function main() {
  await runMigrations();
  uptoDate ? log`Already up to date` : log`Finished migrations`;
  // TODO seeds need to not run in prod
  await seed();
}

main().then(async () => await db.destroy());
