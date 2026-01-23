// app/(dashboard)/profdashboard/exercises/page.tsx - Version corrigée
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { BookOpen, FileText, Users, ArrowLeft, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLoading } from '@/contexts/LoadingContext';

export default function AllExercisesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadAllExercises = async () => {
      try {
        setLoading(true);

        // 1. Récupérer tous les cours du professeur
        const coursesResponse = await CourseControllerService.getAuthorCourses(user.id);
        const coursesData = coursesResponse.data || [];
        setCourses(coursesData);

        // 2. Pour chaque cours, récupérer les exercices
        const allExercises: any[] = [];

        for (const course of coursesData) {
          const courseId = course.id;
          if (!courseId) continue; // Skip si ID invalide
          
          try {
            const exercisesResponse = await ExercicesService.getExercisesForCourse(courseId);
            const courseExercises = exercisesResponse.data || [];

            // Ajouter les métadonnées du cours à chaque exercice
            const exercisesWithCourse = courseExercises.map((exercise: any) => ({
              ...exercise,
              courseTitle: course.title || 'Sans titre',
              courseId: courseId,
              courseCategory: course.category || 'Non catégorisé'
            }));

            allExercises.push(...exercisesWithCourse);
          } catch (error) {
            console.error(`Erreur chargement exercices cours ${courseId}:`, error);
            toast.error(`Erreur chargement exercices pour le cours: ${course.title}`);
          }
        }

        setExercises(allExercises);
      } catch (error) {
        console.error('Erreur chargement des exercices:', error);
        toast.error('Erreur de chargement des exercices');
      } finally {
        setLoading(false);
      }
    };

    loadAllExercises();
  }, [user]);

  const filteredExercises = exercises.filter(exercise =>
    exercise.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/profdashboard')}
            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
          </button>

          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-2">
            Tous mes exercices
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Vue d'ensemble de tous les exercices de tous vos cours
          </p>
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-purple-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un exercice ou un cours..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-purple-200 dark:border-gray-600 text-purple-600 dark:text-purple-400">
              <Filter size={20} />
              Filtrer
            </button>
          </div>
        </div>

        {/* Liste des exercices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200">
              {filteredExercises.length} exercice(s) trouvé(s)
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredExercises.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  {searchTerm ? 'Aucun exercice correspondant à votre recherche' : 'Aucun exercice créé pour le moment'}
                </p>
                {!searchTerm && exercises.length === 0 && (
                  <button
                    onClick={() => router.push('/profdashboard')}
                    className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Créer votre premier cours
                  </button>
                )}
              </div>
            ) : (
              filteredExercises.map((exercise) => (
                <div key={exercise.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                          {exercise.courseCategory}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {exercise.courseTitle}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                        {exercise.title || 'Exercice sans titre'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {exercise.description || 'Pas de description'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Difficulté: {exercise.difficulty || 'Non définie'}</span>
                        <span>•</span>
                        <span>Durée: {exercise.duration || 'Non définie'} min</span>
                        <span>•</span>
                        <span>Note max: {exercise.maxScore || 0} pts</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {/* CORRECTION : Le bouton "Gérer" doit rediriger vers la page du cours */}
                      <button
  onClick={() => {
    if (exercise.id && exercise.courseId) {
      // Rediriger vers la page de gestion de l'exercice spécifique
      router.push(`/profdashboard/exercises/${exercise.courseId}/view/${exercise.id}`);
    } else {
      // Fallback : rediriger vers les exercices du cours
      router.push(`/profdashboard/exercises/${exercise.courseId}`);
    }
  }}
  className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700"
>
  Gérer
</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}