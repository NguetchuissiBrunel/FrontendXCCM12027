// src/app/(dashboard)/profdashboard/exercises/[courseId]/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExerciseEditor } from '@/components/exercises/ExerciseEditor';
import { ArrowLeft, Lightbulb, Target, BarChart3, BookOpen } from 'lucide-react';

export default function CreateExercisePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);
  const [courseTitle, setCourseTitle] = useState('Mon Cours');
  
  const handleSave = (exercise: any) => {
    // Rediriger vers la liste des exercices après création
    router.push(`/profdashboard/exercises/${courseId}`);
  };
  
  const handleCancel = () => {
    router.push(`/profdashboard/exercises/${courseId}`);
  };

  // Simuler la récupération du nom du cours (à adapter avec votre API réelle)
  useEffect(() => {
    // Option 1: Récupérer depuis le localStorage ou les paramètres d'URL
    const storedCourses = localStorage.getItem('professorCourses');
    if (storedCourses) {
      try {
        const courses = JSON.parse(storedCourses);
        const currentCourse = courses.find((c: any) => c.id === courseId);
        if (currentCourse?.title) {
          setCourseTitle(currentCourse.title);
        }
      } catch (error) {
        console.error('Erreur parsing courses:', error);
      }
    }
    
    // Option 2: Si vous avez une autre méthode pour récupérer le cours
    // Vous pouvez utiliser l'une de ces méthodes selon votre API :
    // - CourseControllerService.getCourses() puis filtrer
    // - CourseControllerService.getAuthorCourses(userId)
    // - Ou passer le titre via props/state depuis la page précédente
  }, [courseId]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Navigation Header avec style enrichi */}
        <div className="bg-gradient-to-r from-white to-purple-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl p-6 mb-8 shadow-md dark:shadow-gray-900/30 border border-purple-100/50 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-600 transition-all duration-200 border border-purple-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-gray-500 shadow-sm"
              >
                <ArrowLeft size={20} />
                Retour aux exercices
              </button>
              <div className="h-8 w-px bg-purple-200 dark:bg-gray-600 hidden md:block"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-1">
                  Créer un nouvel exercice
                </h1>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <BookOpen size={16} />
                  <span className="italic">Pour le cours : </span>
                  <span className="font-medium text-purple-600 dark:text-purple-400">{courseTitle}</span>
                </div>
              </div>
            </div>
            
            {/* Badge du cours */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/30">
                <Target size={16} />
                <span className="text-sm font-medium truncate max-w-[200px]">{courseTitle}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section conseils avant création */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Conseils pédagogiques */}
          <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-5 border border-purple-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/20 rounded-lg">
                <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Conseils pédagogiques</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
                <span>Définissez des objectifs clairs pour chaque exercice</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
                <span>Variez les types de questions (QCM, texte libre, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
                <span>Ajoutez des indices pour guider les étudiants</span>
              </li>
            </ul>
          </div>

          {/* Objectifs d'apprentissage */}
          <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-5 border border-blue-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Objectifs recommandés</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                <span>Durée recommandée : 15-30 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                <span>Niveau de difficulté : Progressif</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                <span>Inclure une solution commentée</span>
              </li>
            </ul>
          </div>

          {/* Statistiques de création */}
          <div className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-5 border border-emerald-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Bonnes pratiques</h3>
            </div>
            <ul className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                <span>Testez l'exercice avant publication</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                <span>Prévoyez une note sur 10 ou 20 points</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                <span>Ajoutez des métadonnées pour le suivi</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Éditeur d'exercice avec fond moins blanc */}
        <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* En-tête de l'éditeur */}
          <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Éditeur d'exercice
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Remplissez tous les champs pour créer votre exercice
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Enregistrement automatique</span>
              </div>
            </div>
          </div>
          
          {/* Contenu de l'éditeur avec fond atténué */}
          <div className="p-6 bg-gray-50/50 dark:bg-gray-900/30">
            <ExerciseEditor
              courseId={courseId}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
          
          {/* Footer de l'éditeur */}
          <div className="px-8 py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-100/50 dark:bg-gray-800/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-purple-600 dark:text-purple-400">Important :</span> 
                {' '}L'exercice sera visible pour les étudiants après validation
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium shadow-sm"
                >
                  Annuler
                </button>
                <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200">
                  Prévisualiser
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Note d'information */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200 dark:border-purple-700/30">
            <Lightbulb size={16} className="text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium text-purple-600 dark:text-purple-400">Astuce :</span> 
              {' '}Vous pourrez modifier l'exercice à tout moment après sa création
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}