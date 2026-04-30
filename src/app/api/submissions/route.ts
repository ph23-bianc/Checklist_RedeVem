import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { TOTAL_ITEMS } from "@/lib/checklist-data";

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const store = searchParams.get("store");

    let submissions;
    if (store) {
      submissions = db
        .prepare(
          `SELECT s.*, COUNT(r.id) as answered_count, ? as total_items
           FROM submissions s
           LEFT JOIN responses r ON r.submission_id = s.id AND r.score IS NOT NULL
           WHERE s.store_name = ?
           GROUP BY s.id
           ORDER BY s.created_at DESC`
        )
        .all(TOTAL_ITEMS, store);
    } else {
      submissions = db
        .prepare(
          `SELECT s.*, COUNT(r.id) as answered_count, ? as total_items
           FROM submissions s
           LEFT JOIN responses r ON r.submission_id = s.id AND r.score IS NOT NULL
           GROUP BY s.id
           ORDER BY s.created_at DESC`
        )
        .all(TOTAL_ITEMS);
    }

    return NextResponse.json(submissions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { store_name, inspector_name } = body;

    if (!store_name || !inspector_name) {
      return NextResponse.json({ error: "store_name and inspector_name are required" }, { status: 400 });
    }

    const result = db
      .prepare(`INSERT INTO submissions (store_name, inspector_name, created_at) VALUES (?, ?, datetime('now','localtime'))`)
      .run(store_name, inspector_name);

    const submission = db
      .prepare(
        `SELECT s.*, 0 as answered_count, ? as total_items FROM submissions s WHERE s.id = ?`
      )
      .get(TOTAL_ITEMS, result.lastInsertRowid);

    return NextResponse.json(submission, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
