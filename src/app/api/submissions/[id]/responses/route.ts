import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { CHECKLIST_SECTIONS } from "@/lib/checklist-data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;

    const rows = db
      .prepare(`SELECT * FROM responses WHERE submission_id = ?`)
      .all(id) as Array<{
        item_id: string;
        section_id: string;
        score: number | null;
        observation: string | null;
        goal: string | null;
        deadline: string | null;
        responsible: string | null;
        action_plan: string | null;
        photos: string;
      }>;

    const result: Record<string, {
      score: number | null;
      observation: string;
      goal: string;
      deadline: string;
      responsible: string;
      action_plan: string;
      photos: string[];
    }> = {};

    for (const row of rows) {
      result[row.item_id] = {
        score: row.score,
        observation: row.observation ?? "",
        goal: row.goal ?? "",
        deadline: row.deadline ?? "",
        responsible: row.responsible ?? "",
        action_plan: row.action_plan ?? "",
        photos: JSON.parse(row.photos ?? "[]"),
      };
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const db = getDb();
    const { id } = await params;
    const body = await req.json() as Record<string, {
      score: number | null;
      observation: string;
      goal: string;
      deadline: string;
      responsible: string;
      action_plan: string;
      photos: string[];
    }>;

    const upsert = db.prepare(`
      INSERT INTO responses (submission_id, section_id, item_id, score, observation, goal, deadline, responsible, action_plan, photos)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(submission_id, item_id) DO UPDATE SET
        score = excluded.score,
        observation = excluded.observation,
        goal = excluded.goal,
        deadline = excluded.deadline,
        responsible = excluded.responsible,
        action_plan = excluded.action_plan,
        photos = excluded.photos
    `);

    const sectionMap: Record<string, string> = {};
    for (const section of CHECKLIST_SECTIONS) {
      for (const item of section.items) {
        sectionMap[item.id] = section.id;
      }
    }

    const runAll = db.transaction(() => {
      for (const [itemId, data] of Object.entries(body)) {
        upsert.run(
          id,
          sectionMap[itemId] ?? "",
          itemId,
          data.score ?? null,
          data.observation || null,
          data.goal || null,
          data.deadline || null,
          data.responsible || null,
          data.action_plan || null,
          JSON.stringify(data.photos ?? [])
        );
      }
    });

    runAll();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
