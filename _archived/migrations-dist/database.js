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
exports.sql = exports.db = exports.sqlite = void 0;
const kysely_1 = require("kysely");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const crypto = __importStar(require("crypto"));
/*
  slugify needs to be a relative import here
 */
const utils_1 = require("./utils");
const databasePath = process.env.DATABASE_PATH || "./database/sqlite3.db";
exports.sqlite = new better_sqlite3_1.default(databasePath);
exports.sqlite.pragma("journal_mode = WAL");
exports.sqlite.pragma("foreign_keys = ON;");
exports.sqlite.function("regexp", { deterministic: true }, (regex, text) => new RegExp(regex).test(text) ? 1 : 0);
exports.sqlite.function("uuid", () => crypto.randomUUID());
exports.sqlite.function("slugify", { deterministic: true }, (text) => {
    if (typeof text !== "string")
        throw new Error("Argument was not a string");
    return (0, utils_1.slugify)(text);
});
// You'd create one of these when you start your app.
exports.db = new kysely_1.Kysely({
    // Use MysqlDialect for MySQL and SqliteDialect for SQLite.
    dialect: new kysely_1.SqliteDialect({
        database: exports.sqlite,
    }),
});
var kysely_2 = require("kysely");
Object.defineProperty(exports, "sql", { enumerable: true, get: function () { return kysely_2.sql; } });
