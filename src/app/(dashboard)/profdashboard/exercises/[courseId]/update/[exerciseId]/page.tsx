"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExercicesService } from '@/lib/services/ExercicesService';
import { EnseignantService } from '@/lib/services/EnseignantService';
import type { Exercise, Question } from '@/types/exercise';
import { toast } from 'react-hot-toast';

export default function UpdateExercisePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);
  const exerciseId = parseInt(params.exerciseId as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exercise, setExercise] = useState<Partial<Exercise> | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!exerciseId) return;
    const load = async () => {
      try {
        setLoading(true);
        const resp = await ExercicesService.getExerciseDetails(exerciseId);
        const data = (resp as any)?.data;
        if (!data) {
          toast.error('Exercice introuvable');
          router.back();
          return;
        }
        // Map API ExerciseResponse -> local Exercise shape (partial)
        const mapped: Partial<Exercise> = {
          id: data.id,
          courseId: data.courseId ?? courseId,
          title: data.title ?? '',
          description: data.description ?? '',
          maxScore: data.maxScore ?? 0,
          dueDate: data.dueDate ?? '',
          createdAt: data.createdAt ?? new Date().toISOString(),
          status: (data.status as any) || 'DRAFT'
        };
        setExercise(mapped);
        // Initialize questions if present in API response (best-effort)
        if (Array.isArray((data as any).questions)) {
          setQuestions((data as any).questions as Question[]);
        }
      } catch (err) {
        console.error('Erreur chargement exercice', err);
        toast.error('Erreur lors du chargement de l\'exercice');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [exerciseId, courseId, router]);

  const handleSave = async () => {
    if (!exerciseId || !exercise) return;
    if (!exercise.title || exercise.title.trim() === '') {
      toast.error('Le titre est requis');
      return;
    }

    try {
      setSaving(true);
      // Include questions in payload if present. The generated API typings may not include questions,
      // so we cast to `any` to send a best-effort payload.
      await EnseignantService.updateExercise(exerciseId, {
        title: exercise.title,
        description: exercise.description,
        maxScore: exercise.maxScore,
        dueDate: exercise.dueDate,
        questions: questions
      } as any);
      toast.success('Exercice mis à jour');
      router.push(`/profdashboard/exercises/${courseId}`);
    } catch (err) {
      console.error('Erreur mise à jour exercice', err);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Chargement de l'exercice...</div>;
  if (!exercise) return <div className="p-8">Exercice introuvable.</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">Modifier l'exercice</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Titre *</label>
          <input
            type="text"
            value={exercise.title || ''}
            onChange={(e) => setExercise({ ...exercise, title: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
          <textarea
            value={exercise.description || ''}
            onChange={(e) => setExercise({ ...exercise, description: e.target.value })}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            rows={4}
          />
        </div>

        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Score max</label>
            <input
              type="number"
              min={0}
              value={exercise.maxScore ?? 0}
              onChange={(e) => setExercise({ ...exercise, maxScore: parseInt(e.target.value || '0') })}
              className="px-3 py-2 border rounded w-28 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Date d'échéance</label>
            <input
              type="date"
              value={exercise.dueDate ? new Date(exercise.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => setExercise({ ...exercise, dueDate: e.target.value })}
              className="px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>
      </div>

      {/* Questions management */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold dark:text-white">Questions</h2>
          <button
            onClick={() => {
              const newQ: Question = {
                id: Date.now(),
                exerciseId: exercise.id || 0,
                question: '',
                questionType: 'TEXT',
                points: 5,
                options: []
              };
              setQuestions([...questions, newQ]);
            }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            + Ajouter
          </button>
        </div>

        <div className="space-y-4">
          {questions.length === 0 && (
            <div className="text-sm text-gray-500">Aucune question pour le moment.</div>
          )}

          {questions.map((q, idx) => (
            <div key={q.id} className="border rounded p-3 dark:border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <strong className="dark:text-white">Question {idx + 1}</strong>
                <div className="flex items-center gap-2">
                  <select
                    value={q.questionType}
                    onChange={(e) => {
                      const newQs = [...questions];
                      newQs[idx] = { ...newQs[idx], questionType: e.target.value as any };
                      setQuestions(newQs);
                    }}
                    className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="TEXT">Réponse texte</option>
                    <option value="MULTIPLE_CHOICE">Choix multiple</option>
                    <option value="CODE">Code</option>
                  </select>
                  <button
                    onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                    className="text-red-500"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <input
                type="text"
                value={q.question}
                onChange={(e) => {
                  const newQs = [...questions];
                  newQs[idx] = { ...newQs[idx], question: e.target.value };
                  setQuestions(newQs);
                }}
                placeholder="Énoncé de la question"
                className="w-full px-2 py-1 border rounded mb-2 dark:bg-gray-700 dark:border-gray-600"
              />

              <div className="flex items-center gap-4 mb-2">
                <label className="text-sm dark:text-gray-300">Points</label>
                <input
                  type="number"
                  min={0}
                  value={q.points}
                  onChange={(e) => {
                    const newQs = [...questions];
                    newQs[idx] = { ...newQs[idx], points: parseInt(e.target.value || '0') };
                    setQuestions(newQs);
                  }}
                  className="w-20 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              {q.questionType === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2">
                  {(q.options || []).map((opt, oi) => (
                    <div key={oi} className="flex gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newQs = [...questions];
                          const opts = [...(newQs[idx].options || [])];
                          opts[oi] = e.target.value;
                          newQs[idx] = { ...newQs[idx], options: opts };
                          setQuestions(newQs);
                        }}
                        className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                      />
                      <button
                        onClick={() => {
                          const newQs = [...questions];
                          const opts = (newQs[idx].options || []).filter((_, i) => i !== oi);
                          newQs[idx] = { ...newQs[idx], options: opts };
                          setQuestions(newQs);
                        }}
                        className="text-red-500"
                      >
                        X
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newQs = [...questions];
                      const opts = [...(newQs[idx].options || []), ''];
                      newQs[idx] = { ...newQs[idx], options: opts };
                      setQuestions(newQs);
                    }}
                    className="text-sm text-blue-500"
                  >
                    + Ajouter une option
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
          className="px-4 py-2 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
