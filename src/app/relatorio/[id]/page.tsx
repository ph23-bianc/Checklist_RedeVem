"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CHECKLIST_SECTIONS } from "@/lib/checklist-data";
import { SubmissionWithProgress, FormState } from "@/types";

const SCORE_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#84cc16",
  5: "#22c55e",
};

const SCORE_LABELS: Record<number, string> = {
  1: "Totalmente insatisfatório",
  2: "Insatisfatório",
  3: "Regular",
  4: "Satisfatório",
  5: "Totalmente atendido",
};

function ScoreBar({ value, max, prev }: { value: number; max: number; prev?: number }) {
  const pct = (value / max) * 100;
  const prevPct = prev !== undefined ? (prev / max) * 100 : null;
  const color = pct >= 80 ? "#22c55e" : pct >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="relative">
      <div className="w-full bg-slate-200 rounded-full h-4">
        {prevPct !== null && (
          <div
            className="absolute top-0 left-0 h-4 rounded-full opacity-30 bg-slate-500"
            style={{ width: `${prevPct}%` }}
          />
        )}
        <div className="h-4 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function DeltaBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="text-xs text-slate-400">= igual</span>;
  return (
    <span className={`text-xs font-bold ${delta > 0 ? "text-green-600" : "text-red-600"}`}>
      {delta > 0 ? `▲ +${delta.toFixed(1)}` : `▼ ${delta.toFixed(1)}`}
    </span>
  );
}

export default function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [submission, setSubmission] = useState<SubmissionWithProgress | null>(null);
  const [responses, setResponses] = useState<FormState>({});
  const [previous, setPrevious] = useState<{ submission: SubmissionWithProgress; responses: FormState } | null>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const [subRes, respRes, prevRes] = await Promise.all([
      fetch(`/api/submissions/${id}`),
      fetch(`/api/submissions/${id}/responses`),
      fetch(`/api/submissions/${id}/previous`),
    ]);

    if (subRes.ok) setSubmission(await subRes.json());
    if (respRes.ok) setResponses(await respRes.json());
    if (prevRes.ok) setPrevious(await prevRes.json());
    setLoading(false);
  }

  function handlePrint() {
    window.print();
  }

  async function handleExportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: html2canvas } = await import("html2canvas");
    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current, { scale: 1.5, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const fileName = `checklist-${submission?.store_name ?? "loja"}-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;
    pdf.save(fileName);
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400">Carregando relatório...</div>;
  }

  if (!submission) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400">Checklist não encontrado.</div>;
  }

  // Calculate section stats
  const sectionStats = CHECKLIST_SECTIONS.map((sec) => {
    const items = sec.items;
    const scores = items.map((item) => responses[item.id]?.score).filter((s): s is number => s != null);
    const prevScores = items.map((item) => previous?.responses?.[item.id]?.score).filter((s): s is number => s != null);

    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    const prevAvg = prevScores.length > 0 ? prevScores.reduce((a, b) => a + b, 0) / prevScores.length : null;
    const total = scores.reduce((a, b) => a + b, 0);
    const maxTotal = items.length * 5;

    return { section: sec, avg, prevAvg, total, maxTotal, answeredCount: scores.length };
  });

  const allScores = Object.values(responses).map((r) => r.score).filter((s): s is number => s != null);
  const totalScore = allScores.reduce((a, b) => a + b, 0);
  const maxPossible = CHECKLIST_SECTIONS.reduce((sum, s) => sum + s.items.length, 0) * 5;
  const overallPct = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

  const prevAllScores = previous
    ? Object.values(previous.responses).map((r) => r.score).filter((s): s is number => s != null)
    : [];
  const prevTotalScore = prevAllScores.reduce((a, b) => a + b, 0);
  const prevOverallPct = previous && prevAllScores.length > 0 ? Math.round((prevTotalScore / maxPossible) * 100) : null;

  // Action items
  const actionItems = CHECKLIST_SECTIONS.flatMap((sec) =>
    sec.items
      .map((item) => ({ item, resp: responses[item.id], section: sec.title }))
      .filter((x) => x.resp && (x.resp.goal || x.resp.action_plan || x.resp.responsible))
  );

  const overallColor = overallPct >= 80 ? "text-green-600" : overallPct >= 60 ? "text-yellow-600" : "text-red-600";
  const overallBg = overallPct >= 80 ? "bg-green-50 border-green-300" : overallPct >= 60 ? "bg-yellow-50 border-yellow-300" : "bg-red-50 border-red-300";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-blue-900 text-white shadow-lg no-print">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-blue-200 hover:text-white text-sm">← Início</Link>
            {!submission.completed && (
              <Link href={`/checklist/${id}`} className="text-blue-200 hover:text-white text-sm">← Continuar preenchimento</Link>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="text-sm border border-blue-400 text-white px-4 py-1.5 rounded-lg hover:bg-blue-800 transition-colors"
            >
              🖨️ Imprimir
            </button>
            <button
              onClick={handleExportPDF}
              className="text-sm bg-blue-500 hover:bg-blue-400 text-white px-4 py-1.5 rounded-lg transition-colors font-medium"
            >
              📄 Exportar PDF
            </button>
          </div>
        </div>
      </header>

      {/* Printable content */}
      <div ref={printRef} className="max-w-5xl mx-auto px-4 py-8">
        {/* Report header */}
        <div className="bg-blue-900 text-white rounded-xl p-6 mb-6">
          <h1 className="text-2xl font-bold">CHECK LIST LOJAS — RELATÓRIO CONSOLIDADO</h1>
          <div className="flex flex-wrap gap-6 mt-3 text-blue-100 text-sm">
            <span><strong>Loja:</strong> {submission.store_name}</span>
            <span><strong>Avaliador:</strong> {submission.inspector_name}</span>
            <span><strong>Data:</strong> {new Date(submission.created_at).toLocaleString("pt-BR")}</span>
            <span><strong>Status:</strong> {submission.completed ? "Concluído" : "Em andamento"}</span>
          </div>
        </div>

        {/* Overall score */}
        <div className={`rounded-xl border-2 p-6 mb-6 ${overallBg}`}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-700">Pontuação Geral</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {allScores.length} de {CHECKLIST_SECTIONS.reduce((sum, s) => sum + s.items.length, 0)} itens avaliados
              </p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-black ${overallColor}`}>{overallPct}%</div>
              <div className="text-sm text-slate-500">{totalScore} / {maxPossible} pts</div>
              {prevOverallPct !== null && (
                <div className="flex items-center justify-end gap-2 mt-1">
                  <span className="text-xs text-slate-400">Anterior: {prevOverallPct}%</span>
                  <DeltaBadge delta={overallPct - prevOverallPct} />
                </div>
              )}
            </div>
          </div>
          <div className="mt-4">
            <ScoreBar value={totalScore} max={maxPossible} prev={prevOverallPct !== null ? prevTotalScore : undefined} />
          </div>
        </div>

        {/* Section breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Desempenho por Seção</h2>
          <div className="space-y-4">
            {sectionStats.map(({ section, avg, prevAvg, total, maxTotal, answeredCount }) => {
              const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
              const prevPct = prevAvg !== null && prevAvg !== undefined ? Math.round((prevAvg / 5) * 100) : null;
              const sectionColor = pct >= 80 ? "text-green-600" : pct >= 60 ? "text-yellow-600" : "text-red-600";

              return (
                <div key={section.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{section.title}</span>
                      <span className="text-xs text-slate-400">({answeredCount}/{section.items.length})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {prevAvg !== null && prevAvg !== undefined && avg !== null && (
                        <DeltaBadge delta={parseFloat(((avg - prevAvg) * (maxTotal / section.items.length / 5) * 100).toFixed(1)) / 100 * (section.items.length * 5 / maxTotal) * (section.items.length)} />
                      )}
                      <span className={`text-sm font-bold ${sectionColor}`}>{pct}%</span>
                      {avg !== null && <span className="text-xs text-slate-400">({avg.toFixed(1)}/5)</span>}
                    </div>
                  </div>
                  <ScoreBar
                    value={total}
                    max={maxTotal}
                    prev={prevAvg !== null && prevAvg !== undefined ? (prevAvg / 5) * maxTotal : undefined}
                  />
                  {prevPct !== null && (
                    <div className="text-xs text-slate-400 mt-0.5">Anterior: {prevPct}%</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual chart — simple bars */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Comparativo Visual por Seção</h2>
          <div className="flex items-end gap-2 h-48 overflow-x-auto pb-2">
            {sectionStats.map(({ section, total, maxTotal, prevAvg }) => {
              const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
              const prevPct = prevAvg !== null && prevAvg !== undefined ? (prevAvg / 5) * 100 : null;
              const barColor = pct >= 80 ? "#22c55e" : pct >= 60 ? "#eab308" : "#ef4444";

              return (
                <div key={section.id} className="flex flex-col items-center gap-1 flex-1 min-w-[60px]">
                  <span className="text-xs font-bold text-slate-600">{Math.round(pct)}%</span>
                  <div className="w-full relative flex justify-center items-end h-32">
                    {prevPct !== null && (
                      <div
                        className="absolute bottom-0 w-full bg-slate-300 opacity-50 rounded-t"
                        style={{ height: `${prevPct}%` }}
                      />
                    )}
                    <div
                      className="w-full rounded-t transition-all"
                      style={{ height: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 text-center leading-tight" style={{ fontSize: "10px" }}>
                    {section.title.split("/")[0].trim()}
                  </span>
                </div>
              );
            })}
          </div>
          {previous && (
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ backgroundColor: "#22c55e" }} /> Atual</div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-slate-300 opacity-50" /> Anterior</div>
            </div>
          )}
        </div>

        {/* Detailed items per section */}
        {CHECKLIST_SECTIONS.map((sec) => {
          const items = sec.items.map((item) => ({
            item,
            resp: responses[item.id],
            prevResp: previous?.responses?.[item.id],
          }));

          return (
            <div key={sec.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-4">
              <h3 className="text-base font-bold text-blue-900 mb-3 border-b border-slate-100 pb-2">{sec.title}</h3>
              <div className="space-y-2">
                {items.map(({ item, resp, prevResp }) => {
                  const score = resp?.score;
                  const prevScore = prevResp?.score;
                  const delta = score != null && prevScore != null ? score - prevScore : null;

                  return (
                    <div key={item.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-700">{item.text}</p>
                        {resp?.observation && (
                          <p className="text-xs text-slate-400 mt-0.5 italic">Obs: {resp.observation}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {prevScore != null && (
                          <span className="text-xs text-slate-400">{prevScore}/5</span>
                        )}
                        {delta !== null && <DeltaBadge delta={delta} />}
                        {score != null ? (
                          <span
                            className="text-sm font-bold px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: SCORE_COLORS[score] }}
                          >
                            {score}/5
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300 px-2 py-0.5 border border-slate-200 rounded-full">N/A</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Action Plan */}
        {actionItems.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Plano de Ação Consolidado</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="text-left p-2 border border-slate-200 font-semibold">Seção</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Item</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Nota</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Meta</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Plano de Ação</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Responsável</th>
                    <th className="text-left p-2 border border-slate-200 font-semibold">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map(({ item, resp, section }) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2 border border-slate-200 text-slate-500 whitespace-nowrap">{section}</td>
                      <td className="p-2 border border-slate-200">{item.text}</td>
                      <td className="p-2 border border-slate-200 text-center">
                        {resp?.score != null ? (
                          <span className="font-bold" style={{ color: SCORE_COLORS[resp.score] }}>{resp.score}/5</span>
                        ) : "—"}
                      </td>
                      <td className="p-2 border border-slate-200">{resp?.goal || "—"}</td>
                      <td className="p-2 border border-slate-200">{resp?.action_plan || "—"}</td>
                      <td className="p-2 border border-slate-200 font-medium text-blue-700">{resp?.responsible || "—"}</td>
                      <td className="p-2 border border-slate-200 whitespace-nowrap">
                        {resp?.deadline ? new Date(resp.deadline + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 mt-8 pb-4">
          Relatório gerado em {new Date().toLocaleString("pt-BR")} · RedeVem Check List Lojas
        </div>
      </div>
    </div>
  );
}
