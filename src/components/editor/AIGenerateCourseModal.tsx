'use client';

import React, { useState } from 'react';
import { Sparkles, X, Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { useAIGenerate, type AIGenerateRequest } from '@/hooks/useAIGenerate';

interface AIGenerateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (content: object, title: string, description: string) => void;
}

const DISCIPLINES = [
  { value: 'general', label: 'Général' },
  { value: 'computer_science', label: 'Informatique' },
  { value: 'mathematics', label: 'Mathématiques' },
  { value: 'physics', label: 'Physique' },
  { value: 'life_sciences', label: 'Sciences de la vie' },
  { value: 'databases', label: 'Bases de données' },
  { value: 'artificial_intelligence', label: 'Intelligence Artificielle' },
];

const LEVELS = ['L1', 'L2', 'L3', 'M1', 'M2'];

const STEP_ICONS: Record<string, string> = {
  started: '🔍',
  spec_ready: '📋',
  progress: '⚙️',
  done: '✅',
  error: '❌',
};

export default function AIGenerateCourseModal({
  isOpen,
  onClose,
  onGenerated,
}: AIGenerateCourseModalProps) {
  const [form, setForm] = useState<AIGenerateRequest>({
    description: '',
    discipline: 'general',
    level: 'L1',
    language: 'fr',
    exercisesPerChapter: 1,
  });

  const { generate, isGenerating, steps, result, error, reset } = useAIGenerate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) return;
    await generate(form);
  };

  const handleApply = () => {
    if (!result) return;
    onGenerated(result.content, result.title, result.description);
    onClose();
    reset();
  };

  const handleClose = () => {
    if (isGenerating) return;
    onClose();
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-indigo-600">
          <Sparkles className="h-5 w-5 text-white" />
          <h2 className="text-base font-semibold text-white">Générer un cours avec l'IA</h2>
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="ml-auto text-white/70 hover:text-white transition-colors disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Form */}
          {!result && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description du cours <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  disabled={isGenerating}
                  placeholder="Ex: Un cours d'introduction à la programmation orientée objet en Java pour des étudiants de L2 informatique, couvrant les classes, l'héritage, le polymorphisme et les interfaces..."
                  className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none disabled:opacity-60"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discipline
                  </label>
                  <select
                    disabled={isGenerating}
                    className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                    value={form.discipline}
                    onChange={e => setForm(f => ({ ...f, discipline: e.target.value }))}
                  >
                    {DISCIPLINES.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Niveau
                  </label>
                  <select
                    disabled={isGenerating}
                    className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                    value={form.level}
                    onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                  >
                    {LEVELS.map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Langue
                  </label>
                  <select
                    disabled={isGenerating}
                    className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                    value={form.language}
                    onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                  >
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Exercices / chapitre
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    disabled={isGenerating}
                    className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
                    value={form.exercisesPerChapter}
                    onChange={e => setForm(f => ({ ...f, exercisesPerChapter: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {!isGenerating && (
                <button
                  type="submit"
                  disabled={!form.description.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles size={16} />
                  Générer le cours
                </button>
              )}
            </form>
          )}

          {/* Progress */}
          {(isGenerating || steps.length > 0) && !result && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                {isGenerating && <Loader2 size={14} className="animate-spin text-purple-500" />}
                Génération en cours...
              </h3>
              <div className="space-y-1.5">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 animate-in slide-in-from-left-2 duration-300"
                  >
                    <span className="mt-0.5 flex-none">{STEP_ICONS[step.event] || '•'}</span>
                    <span>{step.message}</span>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex items-center gap-2 text-sm text-purple-500">
                    <Loader2 size={12} className="animate-spin" />
                    <span>En cours...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle size={18} className="text-red-500 flex-none mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">Erreur de génération</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
              </div>
              <button
                onClick={reset}
                className="ml-auto text-red-400 hover:text-red-600 text-xs underline"
              >
                Réessayer
              </button>
            </div>
          )}

          {/* Result preview */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 size={18} />
                <span className="text-sm font-semibold">Cours généré avec succès !</span>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">Titre</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{result.title}</p>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {result.discipline}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {result.level} • {result.difficulty}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    {result.language === 'fr' ? 'Français' : 'English'}
                  </span>
                </div>

                {result.pedagogical_objectives?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Objectifs</p>
                    <ul className="space-y-0.5">
                      {result.pedagogical_objectives.slice(0, 3).map((obj, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700 dark:text-gray-300">
                          <ChevronRight size={12} className="mt-1 flex-none text-purple-400" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  {Object.entries(result.generation_meta.nodes_generated).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{val}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{key}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-400 text-right">
                  Généré en {(result.generation_meta.duration_ms / 1000).toFixed(1)}s avec {result.generation_meta.agents_used.length} agents IA
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {result && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
            <button
              onClick={() => { reset(); }}
              className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Recommencer
            </button>
            <button
              onClick={handleApply}
              className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
            >
              Insérer dans l'éditeur
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
