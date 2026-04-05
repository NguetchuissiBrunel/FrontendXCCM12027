// src/app/(dashboard)/profdashboard/exercises/[courseId]/create/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  ChevronRight,
  Eye,
  Loader2,
  Plus
} from 'lucide-react';

import { ExerciseService } from '@/lib3/services/ExerciseService';
import { CourseClassService } from '@/lib/services/CourseClassService';
import ExerciseEditorV2 from '@/components/exercises/ExerciseEditorV2';
import { Exercise, ApiResponse } from '@/types/exercise';

// Helper function pour vérifier le type de façon safe
function isSuccessfulResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

export default function CreateExercisePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  // On garde params.courseId comme constante car on lit l'URL the Next, mais c'est contextuellement le classId
  const paramId = params?.courseId ? parseInt(params.courseId as string) : 0;

  const [classInfo, setClassInfo] = useState<{
    id: number;
    name: string;
    theme?: string;
    courses?: any[];
  } | null>(null);

  // Real course ID where the exercise will be created
  const [targetCourseId, setTargetCourseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      router.push('/login');
      return;
    }

    if (!paramId) {
      toast.error('ID de classe invalide');
      router.push('/profdashboard');
      return;
    }

    loadClassInfo();
  }, [user, router, paramId]);

  const loadClassInfo = async () => {
    try {
      setLoading(true);
      const response = await CourseClassService.getClassById(paramId);
      if (response && response.data) {
        const data = response.data;
        setClassInfo(data);
        if (data.courses && data.courses.length > 0) {
          setTargetCourseId(data.courses[0].id);
        } else {
          toast.error('Cette classe ne contient aucun cours.');
        }
      } else {
        toast.error('Classe introuvable.');
        router.push('/profdashboard');
      }
    } catch (error) {
      console.error('Erreur chargement infos cours/classe:', error);
      toast.error('Erreur de chargement des informations de la classe.');
      router.push('/profdashboard');
    } finally {
      setLoading(false);
    }
  };

  // Version alternative sans type guard (plus simple)
  const handleSaveSimple = async (result: ApiResponse<Exercise>) => {
    try {
      // Vérification explicite avec assertion de type
      if (result.success === true && result.data) {
        // Type assertion pour satisfaire TypeScript
        const exercise = result.data as Exercise;
        toast.success(result.message || '✅ Exercice créé avec succès !');

        setTimeout(() => {
          // Redirect to the view page of the newly created exercise, falling back to class dashboard
          router.push(`/profdashboard/exercises/${paramId}/view/${exercise.id}`);
        }, 1000);
      } else {
        const errorMessage = result.message || 'Erreur lors de la création';
        toast.error(`❌ ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      toast.error(error.message || 'Erreur inattendue lors de la création');
    }
  };

  const handleCancel = () => {
    if (confirm('Voulez-vous vraiment annuler la création ? Toutes les données seront perdues.')) {
      router.push(`/profdashboard/exercises/${paramId}`);
    }
  };

  const handlePreview = () => {
    toast.success('Aperçu de l\'exercice (données locales seulement)');
  };

  if (!paramId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Paramètres invalides
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            L'URL de la page est incorrecte.
          </p>
          <button
            onClick={() => router.push('/profdashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (!targetCourseId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Aucun cours rattaché
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            La classe "{classInfo?.name}" ne contient aucun cours. Les exercices doivent être rattachés à un cours.
          </p>
          <button
            onClick={() => router.push(`/profdashboard/exercises/${paramId}`)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour à la classe
          </button>
        </div>
      </div>
    );
  }

  // Prepare initial exercise data ONLY after we confirm targetCourseId exists
  const initialExerciseData: Exercise = {
    id: 0,
    courseId: targetCourseId,
    title: 'Nouvel exercice',
    description: '',
    maxScore: 20,
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    questions: [],
    version: '2.0',
    submissionCount: 0,
    averageScore: 0,
    completionRate: 0,
    pendingGrading: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link href="/profdashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Dashboard
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link href={`/profdashboard/exercises/${paramId}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              {classInfo?.name || '...'}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Création d'exercice
            </span>
          </div>

          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push(`/profdashboard/exercises/${paramId}`)}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
              >
                <Eye size={18} />
                Aperçu
              </button>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                <Plus size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Nouvel exercice
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Éditeur d'exercice */}
        <div className="mb-8">
          <ExerciseEditorV2
            courseId={targetCourseId}
            initialData={initialExerciseData!}
            onSave={handleSaveSimple}
            onCancel={handleCancel}
          />
        </div>

        {/* Notes importantes */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-12">
        </div>
      </div>
    </div>
  );
}