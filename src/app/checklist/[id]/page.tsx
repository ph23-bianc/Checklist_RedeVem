"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CHECKLIST_SECTIONS } from "@/lib/checklist-data";
import { SubmissionWithProgress, FormState, ItemResponse } from "@/types";

const EMPTY_RESPONSE: ItemResponse = {
  score: null,
  observation: "",
  goal: "",
  deadline: "",
  responsible: "",
  action_plan: "",
  photos: [],
};

const SCORE_LABELS: Record<number, string> = {
  1: "Totalmente insatisfatório",
  2: "Insatisfatório",
  3: "Regular",
  4: "Satisfatório",
  5: "Totalmente atendido",
};

const SCORE_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#84cc16",
  5: "#22c55e",
};

export default function ChecklistPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [submission, setSubmission] = useState<SubmissionWithProgress | null>(null);
  const [formState, setFormState] = useState<FormState>({});
  const [previous, setPrevious] = useState<{ submission: SubmissionWithProgress; responses: FormState } | null>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [finishing, setFinishing] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    const [subRes, respRes, prevRes] = await Promise.all([
      fetch(`/api/submissions/${id}`),
      fetch(`/api/submissions/${id}/responses`),
      fetch(`/api/submissions/${id}/previous`),
    ]);

    if (!subRes.ok) { router.push("/"); return; }

    const sub = await subRes.json();
    setSubmission(sub);

    if (respRes.ok) {
      const resp = await respRes.json();
      setFormState(resp);
    }

    if (prevRes.ok) {
      const prev = await prevRes.json();
      setPrevious(prev);
    }
  }

  const scheduleAutoSave = useCallback((state: FormState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveResponses(state), 2000);
  }, []);

  async function saveResponses(state: FormState) {
    setSaving(true);
    try {
      const res = await fetch(`/api/submissions/${id}/responses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      setSaveStatus(res.ok ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
    setSaving(false);
    setTimeout(() => setSaveStatus("idle"), 3000);
  }

  function updateItem(itemId: string, field: keyof ItemResponse, value: string | number | null | string[]) {
    setFormState((prev) => {
      const updated = {
        ...prev,
        [itemId]: {
          ...(prev[itemId] ?? EMPTY_RESPONSE),
          [field]: value,
        },
      };
      scheduleAutoSave(updated);
      return updated;
    });
  }

  async function uploadPhotos(itemId: string, files: FileList) {
    setUploading((u) => ({ ...u, [itemId]: true }));
    const fd = new FormData();
    for (const f of Array.from(files)) fd.append("files", f);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    if (res.ok) {
      const { paths } = await res.json() as { paths: string[] };
      setFormState((prev) => {
        const current = prev[itemId] ?? EMPTY_RESPONSE;
        const updated = { ...prev, [itemId]: { ...current, photos: [...current.photos, ...paths] } };
        scheduleAutoSave(updated);
        return updated;
      });
    }
    setUploading((u) => ({ ...u, [itemId]: false }));
  }

  function removePhoto(itemId: string, photoPath: string) {
    setFormState((prev) => {
      const current = prev[itemId] ?? EMPTY_RESPONSE;
      const updated = { ...prev, [itemId]: { ...current, photos: current.photos.filter((p) => p !== photoPath) } };
      scheduleAutoSave(updated);
      return updated;
    });
  }

  async function handleFinish() {
    setFinishing(true);
    await saveResponses(formState);
    await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    router.push(`/relatorio/${id}`);
  }

  function toggleExpand(itemId: string) {
    setExpandedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }

  const section = CHECKLIST_SECTIONS[activeSection];
  const totalAnswered = Object.values(formState).filter((r) => r.score != null).length;
  const totalItems = CHECKLIST_SECTIONS.reduce((sum, s) => sum + s.items.length, 0);
  const overallPct = Math.round((totalAnswered / totalItems) * 100);

  const sectionAnswered = (sIdx: number) =>
    CHECKLIST_SECTIONS[sIdx].items.filter((item) => formState[item.id]?.score != null).length;

  if (!submission) {
    return <div className="flex items-center justify-center min-h-screen text-slate-400">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="text-blue-200 hover:text-white text-sm shrink-0">← Voltar</Link>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base truncate">{submission.store_name}</h1>
              <p className="text-blue-200 text-xs truncate">{submission.inspector_name} · {new Date(submission.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-blue-200">Progresso total</div>
              <div className="font-bold">{overallPct}% ({totalAnswered}/{totalItems})</div>
            </div>
            {saveStatus === "saved" && <span className="text-green-300 text-xs">✓ Salvo</span>}
            {saving && <span className="text-blue-200 text-xs animate-pulse">Salvando...</span>}
            {saveStatus === "error" && <span className="text-red-300 text-xs">Erro ao salvar</span>}
            <button
              onClick={() => saveResponses(formState)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Salvar
            </button>
          </div>
        </div>
        {/* Overall progress bar */}
        <div className="w-full bg-blue-950 h-1">
          <div className="bg-blue-400 h-1 transition-all duration-500" style={{ width: `${overallPct}%` }} />
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex gap-6">
        {/* Sidebar — sections */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-20">
            <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Seções</div>
            {CHECKLIST_SECTIONS.map((sec, idx) => {
              const answered = sectionAnswered(idx);
              const total = sec.items.length;
              const complete = answered === total;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(idx)}
                  className={`w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition-colors ${
                    activeSection === idx ? "bg-blue-50 border-l-4 border-l-blue-600" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${activeSection === idx ? "text-blue-700" : "text-slate-700"}`}>
                      {idx + 1}. {sec.title}
                    </span>
                    {complete ? (
                      <span className="text-green-500 text-xs">✓</span>
                    ) : answered > 0 ? (
                      <span className="text-amber-500 text-xs">{answered}/{total}</span>
                    ) : (
                      <span className="text-slate-300 text-xs">{total}</span>
                    )}
                  </div>
                  <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all ${complete ? "bg-green-500" : "bg-blue-400"}`}
                      style={{ width: `${(answered / total) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile section selector */}
          <div className="lg:hidden mb-4">
            <select
              value={activeSection}
              onChange={(e) => setActiveSection(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CHECKLIST_SECTIONS.map((sec, idx) => (
                <option key={sec.id} value={idx}>
                  {idx + 1}. {sec.title} ({sectionAnswered(idx)}/{sec.items.length})
                </option>
              ))}
            </select>
          </div>

          {/* Section header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-blue-900">{section.title}</h2>
              <span className="text-sm text-slate-500">
                {sectionAnswered(activeSection)}/{section.items.length} respondidos
              </span>
            </div>
            {previous && (
              <p className="text-xs text-slate-400 mt-1">
                ℹ️ Checklist anterior: {new Date(previous.submission.created_at).toLocaleDateString("pt-BR")} — notas exibidas para comparação
              </p>
            )}
          </div>

          {/* Items */}
          <div className="space-y-3">
            {section.items.map((item, itemIdx) => {
              const resp = formState[item.id] ?? EMPTY_RESPONSE;
              const prevResp = previous?.responses?.[item.id];
              const expanded = expandedItems[item.id] ?? false;
              const hasScore = resp.score != null;
              const delta = hasScore && prevResp?.score != null && resp.score != null ? resp.score - prevResp.score : null;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border-2 shadow-sm transition-all ${
                    hasScore ? "border-blue-100" : "border-slate-200"
                  }`}
                >
                  {/* Item header */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-slate-400 text-sm font-mono shrink-0 mt-0.5">{itemIdx + 1}.</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 leading-snug">{item.text}</p>

                        {/* Previous score */}
                        {prevResp?.score != null && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">Anterior:</span>
                            <span className="text-xs font-semibold" style={{ color: SCORE_COLORS[prevResp.score] }}>
                              {prevResp.score}/5 — {SCORE_LABELS[prevResp.score]}
                            </span>
                            {delta !== null && (
                              <span className={`text-xs font-bold ${delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-slate-400"}`}>
                                {delta > 0 ? `▲+${delta}` : delta < 0 ? `▼${delta}` : "= igual"}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Score buttons */}
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => updateItem(item.id, "score", resp.score === score ? null : score)}
                              className="score-btn"
                              style={{
                                borderColor: resp.score === score ? SCORE_COLORS[score] : "#cbd5e1",
                                backgroundColor: resp.score === score ? SCORE_COLORS[score] : "transparent",
                                color: resp.score === score ? "white" : SCORE_COLORS[score],
                              }}
                              title={SCORE_LABELS[score]}
                            >
                              {score}
                            </button>
                          ))}
                          {resp.score && (
                            <span className="text-xs text-slate-500 ml-1">{SCORE_LABELS[resp.score]}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expand button */}
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      {expanded ? "▲ Ocultar detalhes" : "▼ Observações, plano de ação e fotos"}
                      {(resp.observation || resp.goal || resp.action_plan || resp.photos.length > 0) && (
                        <span className="bg-blue-100 text-blue-700 rounded-full px-1.5 text-xs">
                          {[resp.observation, resp.goal, resp.action_plan].filter(Boolean).length + resp.photos.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {expanded && (
                    <div className="border-t border-slate-100 p-4 space-y-4 bg-slate-50 rounded-b-xl">
                      {/* Previous details */}
                      {prevResp && (prevResp.observation || prevResp.goal || prevResp.action_plan) && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs space-y-1">
                          <p className="font-semibold text-amber-800 mb-2">Registro anterior:</p>
                          {prevResp.observation && <p className="text-amber-700"><strong>Obs:</strong> {prevResp.observation}</p>}
                          {prevResp.goal && <p className="text-amber-700"><strong>Meta:</strong> {prevResp.goal}</p>}
                          {prevResp.deadline && <p className="text-amber-700"><strong>Prazo:</strong> {prevResp.deadline}</p>}
                          {prevResp.responsible && <p className="text-amber-700"><strong>Responsável:</strong> {prevResp.responsible}</p>}
                          {prevResp.action_plan && <p className="text-amber-700"><strong>Plano:</strong> {prevResp.action_plan}</p>}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Observações</label>
                        <textarea
                          value={resp.observation}
                          onChange={(e) => updateItem(item.id, "observation", e.target.value)}
                          rows={2}
                          placeholder="Descreva o que foi observado..."
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Meta de curto prazo</label>
                          <textarea
                            value={resp.goal}
                            onChange={(e) => updateItem(item.id, "goal", e.target.value)}
                            rows={2}
                            placeholder="Objetivo a atingir..."
                            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                          />
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Prazo</label>
                            <input
                              type="date"
                              value={resp.deadline}
                              onChange={(e) => updateItem(item.id, "deadline", e.target.value)}
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Responsável</label>
                            <input
                              type="text"
                              value={resp.responsible}
                              onChange={(e) => updateItem(item.id, "responsible", e.target.value)}
                              placeholder="Nome do responsável"
                              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Plano de Ação Detalhado</label>
                        <textarea
                          value={resp.action_plan}
                          onChange={(e) => updateItem(item.id, "action_plan", e.target.value)}
                          rows={3}
                          placeholder="Descreva as ações necessárias para atingir a meta..."
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
                        />
                      </div>

                      {/* Photos */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Evidências Fotográficas</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {resp.photos.map((photo) => (
                            <div key={photo} className="relative group">
                              <img src={photo} alt="Evidência" className="w-16 h-16 object-cover rounded-lg border border-slate-200" />
                              <button
                                onClick={() => removePhoto(item.id, photo)}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <label className="cursor-pointer inline-flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-300 hover:border-blue-500 rounded-lg px-3 py-2 transition-colors bg-white">
                          {uploading[item.id] ? "Enviando..." : "📷 Adicionar fotos"}
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={uploading[item.id]}
                            onChange={(e) => e.target.files && uploadPhotos(item.id, e.target.files)}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => setActiveSection((s) => Math.max(0, s - 1))}
              disabled={activeSection === 0}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            <span className="text-sm text-slate-500">{activeSection + 1} / {CHECKLIST_SECTIONS.length}</span>
            {activeSection < CHECKLIST_SECTIONS.length - 1 ? (
              <button
                onClick={() => setActiveSection((s) => Math.min(CHECKLIST_SECTIONS.length - 1, s + 1))}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Próxima →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={finishing}
                className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                {finishing ? "Finalizando..." : "✓ Finalizar e gerar relatório"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
