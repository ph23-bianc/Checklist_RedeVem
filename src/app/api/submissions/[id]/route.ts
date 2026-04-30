import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { TOTAL_ITEMS } from "@/lib/checklist-data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    const submission = db
      .prepare(
        `SELECT s.*, COUNT(r.id) as answered_count, ? as total_items
         FROM submissions s
         LEFT JOIN responses r ON r.submission_id = s.id AND r.score IS NOT NULL
         WHERE s.id = ?
         GROUP BY s.id`
      )
      .get(TOTAL_ITEMS, id);

    if (!submission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await req.json();

    if (body.completed !== undefined) {
      const responses = db
        .prepare(`SELECT score FROM responses WHERE submission_id = ? AND score IS NOT NULL`)
        .all(id) as { score: number }[];

      const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
      const maxScore = responses.length * 5;

      db.prepare(
        `UPDATE submissions SET completed = ?, total_score = ?, max_score = ? WHERE id = ?`
      ).run(body.completed ? 1 : 0, totalScore, maxScore, id);
    }

    const submission = db
      .prepare(
        `SELECT s.*, COUNT(r.id) as answered_count, ? as total_items
         FROM submissions s
         LEFT JOIN responses r ON r.submission_id = s.id AND r.score IS NOT NULL
         WHERE s.id = ?
         GROUP BY s.id`
      )
      .get(TOTAL_ITEMS, id);

    return NextResponse.json(submission);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    db.prepare(`DELETE FROM submissions WHERE id = ?`).run(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
