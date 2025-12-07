"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const database_1 = require("./database");
const promises_1 = __importDefault(require("fs/promises"));
const crypto = __importStar(require("crypto"));
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
function sha256(content) {
    return crypto.createHash("sha256").update(content).digest("hex");
}
function log(message, ...values) {
    console.log("MESSAGE", message.raw[0]);
    console.info(`MIG: ${message}`);
}
let uptoDate = true;
async function runMigrations() {
    database_1.sqlite.exec(migrationsTable);
    const [committedMigrations, migrationFilenames] = await Promise.all([
        // @ts-ignore
        database_1.db.selectFrom("migrations").select(["id", "filename", "sha"]).execute(),
        promises_1.default.readdir("database/migrations"),
    ]);
    const migrations = new Map(committedMigrations.map((row) => [row.filename, row]));
    for (const migrationFilename of migrationFilenames.sort()) {
        const migration = await promises_1.default.readFile(`database/migrations/${migrationFilename}`, "utf8");
        const sha = sha256(migration);
        const committedSHA = migrations.get(migrationFilename)?.sha;
        // Check committed migration and filesystem migration's contents match.
        if (committedSHA && committedSHA !== sha) {
            throw new Error(`Existing migration ${migrationFilename} SHA doesn't match SHA from filesystem migration`);
        }
        else if (!committedSHA) {
            uptoDate = false;
            console.log(`Running migration ${migrationFilename}`);
            const query = `
        BEGIN TRANSACTION;
        ${migration}
        INSERT INTO migrations (filename, sha)
        VALUES ('${migrationFilename}', '${sha}');
        END TRANSACTION;
      `;
            database_1.sqlite.exec(query);
        }
    }
}
async function seed() {
    if (process.argv.find((arg) => arg === "--seed")) {
        console.log("Running seeds");
        const seeds = await promises_1.default.readdir("database/seeds");
        for (const filename of seeds.sort()) {
            console.log(`Running seed ${filename}`);
            const seed = await promises_1.default.readFile(`database/seeds/${filename}`, "utf8");
            database_1.sqlite.exec(seed);
        }
    }
}
async function main() {
    await runMigrations();
    uptoDate ? log `Already up to date` : log `Finished migrations`;
    // TODO seeds need to not run in prod
    await seed();
}
main().then(async () => await database_1.db.destroy());
