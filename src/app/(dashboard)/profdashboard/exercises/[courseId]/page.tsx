// src/app/(dashboard)/profdashboard/exercises/[courseId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ExerciseService } from '@/lib/services/ExerciseService';
import type { Exercise } from '@/types/exercise';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  BarChart3,
  Calendar,
  FileText,
  Users,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CourseExercisesPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = parseInt(params.courseId as string);
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseInfo, setCourseInfo] = useState<{
    title: string;
    category?: string;
  } | null>(null);
  
  // États pour les filtres
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all');
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    loadExercises();
    loadCourseInfo();
  }, [courseId]);
  
  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await ExerciseService.getTeacherCourseExercises(courseId);
      setExercises(data);
    } catch (error) {
      console.error('Erreur chargement exercices:', error);
      toast.error('Erreur lors du chargement des exercices');
    } finally {
      setLoading(false);
    }
  };
  
  const loadCourseInfo = async () => {
    try {
      // Vous devrez peut-être appeler un service pour obtenir les infos du cours
      // Pour l'instant, on utilise des valeurs par défaut
      setCourseInfo({
        title: `Cours #${courseId}`,
        category: 'Non spécifié'
      });
    } catch (error) {
      console.error('Erreur chargement infos cours:', error);
    }
  };
  
  const handleCreateExercise = () => {
    router.push(`/profdashboard/exercises/${courseId}/create`);
  };
  
  const handleEditExercise = (exerciseId: number) => {
    router.push(`/profdashboard/exercises/${courseId}/edit/${exerciseId}`);
  };
  
  const handleViewSubmissions = (exerciseId: number) => {
    router.push(`/profdashboard/exercises/${courseId}/submissions/${exerciseId}`);
  };
  
  const handleDeleteExercise = async (exerciseId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
      try {
        await ExerciseService.deleteExercise(exerciseId);
        toast.success('Exercice supprimé avec succès');
        loadExercises(); // Recharger la liste
      } catch (error) {
        console.error('Erreur suppression exercice:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };
  
  const handlePublishExercise = async (exerciseId: number) => {
    try {
      await ExerciseService.publishExercise(exerciseId);
      toast.success('Exercice publié');
      loadExercises();
    } catch (error) {
      console.error('Erreur publication:', error);
      toast.error('Erreur lors de la publication');
    }
  };
  
  const handleCloseExercise = async (exerciseId: number) => {
    try {
      await ExerciseService.closeExercise(exerciseId);
      toast.success('Exercice fermé');
      loadExercises();
    } catch (error) {
      console.error('Erreur fermeture:', error);
      toast.error('Erreur lors de la fermeture');
    }
  };
  
  // Filtrer les exercices
  const filteredExercises = exercises.filter(exercise => {
    // Filtre par statut
    if (filter !== 'all' && exercise.status?.toLowerCase() !== filter) {
      return false;
    }
    
    // Filtre par recherche
    if (search && !exercise.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement des exercices...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/profdashboard')}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestion des exercices
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {courseInfo?.title} • {filteredExercises.length} exercices
              </p>
            </div>
            
            <button
              onClick={handleCreateExercise}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              <Plus size={20} />
              Nouvel exercice
            </button>
          </div>
        </div>
        
        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un exercice..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <FileText className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
            </div>
            
            {/* Filtres par statut */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Tous' },
                { value: 'published', label: 'Publiés' },
                { value: 'draft', label: 'Brouillons' },
                { value: 'closed', label: 'Fermés' }
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as any)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Liste des exercices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {exercises.length === 0 ? 'Aucun exercice créé' : 'Aucun exercice ne correspond aux filtres'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {exercises.length === 0 
                  ? 'Commencez par créer votre premier exercice pour ce cours.'
                  : 'Essayez de modifier vos critères de recherche.'
                }
              </p>
              {exercises.length === 0 && (
                <button
                  onClick={handleCreateExercise}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                >
                  Créer un exercice
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExercises.map((exercise) => (
                <div key={exercise.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Informations de l'exercice */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {exercise.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          exercise.status === 'PUBLISHED' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : exercise.status === 'DRAFT'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {exercise.status === 'PUBLISHED' ? 'Publié' : 
                           exercise.status === 'DRAFT' ? 'Brouillon' : 'Fermé'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {exercise.description || 'Aucune description'}
                      </p>
                      
                      {/* Métadonnées */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span>Échéance: {new Date(exercise.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 size={16} />
                          <span>Score max: {exercise.maxScore}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          <span>
                            {exercise.submissionsCount || 0} soumissions • 
                            {exercise.pendingCount || 0} en attente
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleViewSubmissions(exercise.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Eye size={16} />
                        Voir soumissions
                      </button>
                      
                      <button
                        onClick={() => handleEditExercise(exercise.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                      >
                        <Edit size={16} />
                        Modifier
                      </button>
                      
                      {exercise.status === 'DRAFT' && (
                        <button
                          onClick={() => handlePublishExercise(exercise.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Download size={16} />
                          Publier
                        </button>
                      )}
                      
                      {exercise.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleCloseExercise(exercise.id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          Fermer
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteExercise(exercise.id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 size={16} />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Statistiques */}
        {exercises.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {exercises.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Exercices totaux
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {exercises.filter(e => e.status === 'PUBLISHED').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Exercices publiés
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {exercises.filter(e => e.status === 'DRAFT').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Brouillons
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {exercises.reduce((sum, e) => sum + (e.submissionsCount || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Soumissions totales
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}