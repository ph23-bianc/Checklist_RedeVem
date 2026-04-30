import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "checklist.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  initSchema(db);
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_name TEXT NOT NULL,
      inspector_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      completed INTEGER NOT NULL DEFAULT 0,
      total_score REAL,
      max_score REAL
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
      section_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      score INTEGER CHECK(score BETWEEN 1 AND 5),
      observation TEXT,
      goal TEXT,
      deadline TEXT,
      responsible TEXT,
      action_plan TEXT,
      photos TEXT DEFAULT '[]',
      UNIQUE(submission_id, item_id)
    );
  `);
}

export type Submission = {
  id: number;
  store_name: string;
  inspector_name: string;
  created_at: string;
  completed: number;
  total_score: number | null;
  max_score: number | null;
};

export type Response = {
  id: number;
  submission_id: number;
  section_id: string;
  item_id: string;
  score: number | null;
  observation: string | null;
  goal: string | null;
  deadline: string | null;
  responsible: string | null;
  action_plan: string | null;
  photos: string;
};
