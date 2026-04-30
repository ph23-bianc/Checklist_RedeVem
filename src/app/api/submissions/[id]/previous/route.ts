import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { TOTAL_ITEMS } from "@/lib/checklist-data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    const current = db.prepare(`SELECT store_name, created_at FROM submissions WHERE id = ?`).get(id) as
      | { store_name: string; created_at: string }
      | undefined;

    if (!current) {
      return NextResponse.json(null);
    }

    const previous = db
      .prepare(
        `SELECT s.*, COUNT(r.id) as answered_count, ? as total_items
         FROM submissions s
         LEFT JOIN responses r ON r.submission_id = s.id AND r.score IS NOT NULL
         WHERE s.store_name = ? AND s.id != ? AND s.completed = 1
         GROUP BY s.id
         ORDER BY s.created_at DESC
         LIMIT 1`
      )
      .get(TOTAL_ITEMS, current.store_name, id);

    if (!previous) {
      return NextResponse.json(null);
    }

    const prevId = (previous as { id: number }).id;
    const prevResponses = db
      .prepare(`SELECT * FROM responses WHERE submission_id = ?`)
      .all(prevId) as Array<{
        item_id: string;
        score: number | null;
        observation: string | null;
        goal: string | null;
        deadline: string | null;
        responsible: string | null;
        action_plan: string | null;
        photos: string;
      }>;

    const responseMap: Record<string, {
      score: number | null;
      observation: string;
      goal: string;
      deadline: string;
      responsible: string;
      action_plan: string;
      photos: string[];
    }> = {};

    for (const row of prevResponses) {
      responseMap[row.item_id] = {
        score: row.score,
        observation: row.observation ?? "",
        goal: row.goal ?? "",
        deadline: row.deadline ?? "",
        responsible: row.responsible ?? "",
        action_plan: row.action_plan ?? "",
        photos: JSON.parse(row.photos ?? "[]"),
      };
    }

    return NextResponse.json({ submission: previous, responses: responseMap });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
