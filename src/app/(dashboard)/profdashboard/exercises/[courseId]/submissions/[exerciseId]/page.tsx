// src/app/(dashboard)/profdashboard/exercises/[courseId]/submissions/[exerciseId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { GradingInterface } from '@/components/exercises/GradingInterface';
import { ArrowLeft } from 'lucide-react';

export default function ExerciseSubmissionsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);
  const exerciseId = parseInt(params.exerciseId as string);
  
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadExercise();
  }, [exerciseId]);
  
  const loadExercise = async () => {
    try {
      const response = await ExercicesService.getExerciseDetails(exerciseId);
      // l'openapi-gen wrappe souvent la réponse dans .data
      const payload = (response as any).data ?? response;
      setExercise(payload?.exercise ?? payload);
    } catch (error) {
      console.error('Erreur chargement exercice:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft size={20} />
            Retour aux exercices
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Correction des soumissions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {exercise?.title}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <GradingInterface exerciseId={exerciseId} />
        </div>
      </div>
    </div>
  );
}