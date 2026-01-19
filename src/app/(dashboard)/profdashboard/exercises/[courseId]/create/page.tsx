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
  FileText,
  BookOpen,
  ChevronRight,
  Shield,
  Clock,
  Users,
  Eye,
  Loader2,
  Plus
} from 'lucide-react';

import { ExerciseService } from '@/lib3/services/ExerciseService';
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
  
  const courseId = params?.courseId ? parseInt(params.courseId as string) : 0;
  const [courseInfo, setCourseInfo] = useState<{
    title: string;
    category?: string;
  } | null>(null);

  // Dans create/page.tsx - assurez-vous que l'exercice initial a bien id: 0
const initialExerciseData: Exercise = {
  id: 0, // TRÈS IMPORTANT : doit être 0 pour indiquer une création
  courseId: courseId,
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

  useEffect(() => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      router.push('/login');
      return;
    }
    
    if (!courseId) {
      toast.error('ID du cours invalide');
      router.push('/profdashboard/exercises');
      return;
    }
    
    loadCourseInfo();
  }, [user, router, courseId]);

  const loadCourseInfo = async () => {
    try {
      setCourseInfo({
        title: `Cours #${courseId}`,
        category: 'Informatique',
      });
    } catch (error) {
      console.error('Erreur chargement infos cours:', error);
    }
  };

  // CORRECTION DÉFINITIVE - Gestion type-safe
 // Dans create/page.tsx - CORRECTION DÉFINITIVE
const handleSave = async (result: ApiResponse<Exercise>) => {
  try {
    // CORRECTION : Vérification correcte du type
    if (result.success === true) {
      // Maintenant nous savons que success est true
      // Mais data peut encore être undefined selon le type
      
      if (result.data) {
        // data existe, nous pouvons l'utiliser
        const exercise = result.data;
        toast.success(result.message || '✅ Exercice créé avec succès !');
        
        setTimeout(() => {
          router.push(`/profdashboard/exercises/${courseId}/view/${exercise.id}`);
        }, 1000);
      } else {
        // success est true mais data est undefined
        // Cela ne devrait pas arriver, mais on gère le cas
        toast.success(result.message || '✅ Exercice créé avec succès !');
        
        setTimeout(() => {
          router.push(`/profdashboard/exercises/${courseId}`);
        }, 1000);
      }
    } else {
      // success est false
      const errorMessage = result.message || 'Erreur lors de la création';
      toast.error(`❌ ${errorMessage}`);
    }
  } catch (error: any) {
    console.error('Erreur lors de la création:', error);
    toast.error(error.message || 'Erreur lors de la création');
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
          router.push(`/profdashboard/exercises/${courseId}/view/${exercise.id}`);
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
      router.push(`/profdashboard/exercises/${courseId}`);
    }
  };

  const handlePreview = () => {
    toast.success('Aperçu de l\'exercice (données locales seulement)');
  };

  if (!courseId) {
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
            onClick={() => router.push('/profdashboard/exercises')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour aux exercices
          </button>
        </div>
      </div>
    );
  }

  if (!courseInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Chargement des informations du cours...</p>
        </div>
      </div>
    );
  }

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
            <Link href="/profdashboard/exercises" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              Exercices
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link href={`/profdashboard/exercises/${courseId}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              {courseInfo.title}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Création d'exercice
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour aux exercices
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreview}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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

        {/* Bannière d'information */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white">
            {/* ... contenu identique ... */}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
            {/* ... contenu identique ... */}
          </div>
        </div>

        {/* Éditeur d'exercice - UTILISEZ handleSaveSimple pour éviter l'erreur */}
        <div className="mb-8">
          <ExerciseEditorV2
            courseId={courseId}
            initialData={initialExerciseData}
            onSave={handleSaveSimple}  // Utilisez handleSaveSimple qui est type-safe
            onCancel={handleCancel}
          />
        </div>

        {/* Notes importantes */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-12">
          {/* ... contenu identique ... */}
        </div>
      </div>
    </div>
  );
}