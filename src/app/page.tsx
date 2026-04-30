"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SubmissionWithProgress } from "@/types";

export default function HomePage() {
  const [submissions, setSubmissions] = useState<SubmissionWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [storeName, setStoreName] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [creating, setCreating] = useState(false);
  const [filterStore, setFilterStore] = useState("");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    setLoading(true);
    const res = await fetch("/api/submissions");
    if (res.ok) setSubmissions(await res.json());
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!storeName.trim() || !inspectorName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ store_name: storeName.trim(), inspector_name: inspectorName.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      window.location.href = `/checklist/${data.id}`;
    }
    setCreating(false);
  }

  const storeNames = [...new Set(submissions.map((s) => s.store_name))].sort();
  const filtered = filterStore ? submissions.filter((s) => s.store_name === filterStore) : submissions;

  function scoreColor(score: number | null, max: number | null) {
    if (!score || !max) return "text-slate-400";
    const pct = score / max;
    if (pct >= 0.8) return "text-green-600";
    if (pct >= 0.6) return "text-yellow-600";
    return "text-red-600";
  }

  function cardBorder(score: number | null, max: number | null, completed: number) {
    if (!completed) return "border-amber-300";
    if (!score || !max) return "border-slate-200";
    const pct = score / max;
    if (pct >= 0.8) return "border-green-300";
    if (pct >= 0.6) return "border-yellow-300";
    return "border-red-300";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CHECK LIST LOJAS</h1>
            <p className="text-blue-200 text-sm mt-0.5">RedeVem — Sistema de Avaliação Operacional</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow"
          >
            + Novo Checklist
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {showNew && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Novo Preenchimento</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Loja</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ex: Loja Centro"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    list="store-suggestions"
                  />
                  <datalist id="store-suggestions">
                    {storeNames.map((s) => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Avaliador</label>
                  <input
                    type="text"
                    value={inspectorName}
                    onChange={(e) => setInspectorName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowNew(false); setStoreName(""); setInspectorName(""); }}
                    className="flex-1 border border-slate-300 text-slate-700 font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {creating ? "Criando..." : "Iniciar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {storeNames.length > 1 && (
          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600">Filtrar:</label>
            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Todas as lojas</option>
              {storeNames.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-400 text-lg">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-slate-600 mb-2">Nenhum checklist encontrado</h2>
            <p className="text-slate-400 mb-6">Clique em "Novo Checklist" para começar.</p>
            <button
              onClick={() => setShowNew(true)}
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Novo Checklist
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => {
              const pct = Math.round((s.answered_count / s.total_items) * 100);
              const scoreLabel = s.total_score != null && s.max_score
                ? `${s.total_score}/${s.max_score} (${Math.round((s.total_score / s.max_score) * 100)}%)`
                : null;
              return (
                <div key={s.id} className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-shadow p-5 ${cardBorder(s.total_score, s.max_score, s.completed)}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-slate-800">{s.store_name}</h3>
                      <p className="text-xs text-slate-500">{s.inspector_name}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.completed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {s.completed ? "Concluído" : "Em andamento"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    {new Date(s.created_at).toLocaleString("pt-BR")}
                  </p>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progresso</span>
                      <span>{s.answered_count}/{s.total_items} itens</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {scoreLabel && (
                    <p className={`text-sm font-bold mb-3 ${scoreColor(s.total_score, s.max_score)}`}>
                      Pontuação: {scoreLabel}
                    </p>
                  )}
                  <div className="flex gap-2">
                    {!s.completed && (
                      <Link href={`/checklist/${s.id}`} className="flex-1 text-center text-sm font-semibold bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Continuar
                      </Link>
                    )}
                    <Link href={`/relatorio/${s.id}`} className={`text-center text-sm font-semibold py-2 px-3 rounded-lg transition-colors ${s.completed ? "flex-1 bg-emerald-600 text-white hover:bg-emerald-700" : "border border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                      {s.completed ? "Ver Relatório" : "Prévia"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
