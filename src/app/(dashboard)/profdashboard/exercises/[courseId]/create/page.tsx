// src/app/(dashboard)/profdashboard/exercises/[courseId]/new/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExerciseEditor } from '@/components/exercises/ExerciseEditor';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { Exercise, ApiResponse } from '@/types/exercise';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  FileText, 
  BookOpen, 
  Sparkles,
  Info,
  Lightbulb,
  Shield,
  Clock,
  Users,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function NewExercisePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);
  
  const [courseInfo, setCourseInfo] = useState<{
    title: string;
    category?: string;
    description?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseInfo();
  }, [courseId]);

  const loadCourseInfo = async () => {
    try {
      const response = await CourseControllerService.getEnrichedCourse(courseId);
      if (response.data) {
        const courseData = response.data as any;
        setCourseInfo({
          title: courseData.title || `Cours #${courseId}`,
          category: courseData.category,
          description: courseData.description
        });
      }
    } catch (error) {
      console.error('Erreur chargement infos cours:', error);
    } finally {
      setLoading(false);
    }
  };

 // CORRECTION FINALE - Version complète
const handleSave = (apiResponse: ApiResponse<Exercise>) => {
  // Extraire l'exercice de la réponse API
  const savedExercise = apiResponse?.data;
  
  if (!savedExercise || !savedExercise.id) {
    toast.error('Erreur : impossible de récupérer l\'exercice créé');
    console.error('Réponse API invalide:', apiResponse);
    return;
  }
  
  toast.success('🎉 Exercice créé et publié avec succès !', {
    duration: 4000,
    icon: '✅',
    style: {
      background: '#10B981',
      color: 'white',
    },
  });
  
  // Redirection après un court délai pour voir le toast
  setTimeout(() => {
    router.push(`/profdashboard/exercises/${courseId}/view/${savedExercise.id}`);
  }, 1000);
};

  const handleCancel = () => {
    if (confirm('Voulez-vous vraiment annuler la création de cet exercice ? Les modifications non enregistrées seront perdues.')) {
      router.push(`/profdashboard/exercises/${courseId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation et en-tête */}
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Link 
              href="/profdashboard" 
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link 
              href="/profdashboard/exercises" 
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Exercices
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link 
              href={`/profdashboard/exercises/${courseId}`}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {courseInfo?.title || `Cours #${courseId}`}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-800 dark:text-gray-200 font-medium">
              Nouvel exercice
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
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30">
              <Sparkles size={16} className="text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                Création d'exercice
              </span>
            </div>
          </div>
        </div>

        {/* Bannière d'information */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold mb-1">
                      Créer un nouvel exercice
                    </h1>
                    <p className="text-purple-100">
                      Pour le cours : {courseInfo?.title}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Shield size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Publication automatique</div>
                      <div className="text-xs text-purple-200">Immédiatement visible</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Échéance flexible</div>
                      <div className="text-xs text-purple-200">Définissez une date limite</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Correction simplifiée</div>
                      <div className="text-xs text-purple-200">Interface de notation</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {courseInfo?.category && (
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium self-start">
                  {courseInfo.category}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conseils et astuces */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 p-5 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Conseil</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Structurez vos questions clairement et donnez des points proportionnels à la difficulté.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 p-5 rounded-xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                <Lightbulb className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Astuce</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Utilisez différents types de questions pour varier les modalités d'évaluation.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 p-5 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-800/30 rounded-lg">
                <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Rappel</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Vérifiez que le total des points correspond au score maximum de l'exercice.
            </p>
          </div>
        </div>

        {/* Éditeur d'exercice */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-lg">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                Éditeur d'exercice
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Remplissez le formulaire ci-dessous pour créer votre exercice
              </p>
            </div>
            
            <div className="p-6">
              <ExerciseEditor
                courseId={courseId}
                onSave={handleSave}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>

        {/* Informations complémentaires */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-500" />
            À propos de la création d'exercices
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">📝 Types de questions supportés</h4>
              <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Réponse libre (texte)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Choix multiple (QCM)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Code (développement)</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">⚡ Bonnes pratiques</h4>
              <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Un titre clair et explicite</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Des instructions détaillées</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Une date d'échéance réaliste</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                L'exercice sera automatiquement publié après création
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Système en ligne</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}