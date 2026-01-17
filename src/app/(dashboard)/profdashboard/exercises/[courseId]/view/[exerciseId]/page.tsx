// src/app/(dashboard)/profdashboard/exercises/[courseId]/view/[exerciseId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ExercicesService } from '@/lib/services/ExercicesService';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import type { Exercise, Question } from '@/types/exercise';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Calendar,
  FileText,
  Users,
  Award,
  Clock,
  BookOpen,
  ChevronRight,
  CheckCircle,
  XCircle,
  BarChart3,
  Copy,
  Share2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ViewExercisePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const courseId = parseInt(params.courseId as string);
  const exerciseId = parseInt(params.exerciseId as string);
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseInfo, setCourseInfo] = useState<{
    title: string;
    category?: string;
  } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  useEffect(() => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      router.push('/login');
      return;
    }
    
    loadExercise();
    loadCourseInfo();
  }, [courseId, exerciseId, user, router]);
  
  const loadExercise = async () => {
    try {
      setLoading(true);
      console.log('Chargement exercice ID:', exerciseId);
      
      const resp = await ExercicesService.getExerciseDetails(exerciseId);
      console.log('Réponse API exercice:', resp);
      
      if (resp && resp.data) {
        const exerciseData = resp.data as any;
        console.log('Données exercice brutes:', exerciseData);
        
        // Extraire les questions - plusieurs possibilités de structure
        let extractedQuestions: Question[] = [];
        
        if (Array.isArray(exerciseData.questions)) {
          // Cas 1: questions directement dans exerciseData.questions
          extractedQuestions = exerciseData.questions.map((q: any, index: number) => ({
            id: q.id || index,
            exerciseId: q.exerciseId || exerciseId,
            question: q.question || q.text || '',
            questionType: (q.questionType || q.type || 'TEXT') as 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE',
            points: q.points || q.score || 0,
            options: q.options || [],
            correctAnswer: q.correctAnswer || q.answer || ''
          }));
        } else if (exerciseData.content && Array.isArray(exerciseData.content.questions)) {
          // Cas 2: questions dans content.questions
          extractedQuestions = exerciseData.content.questions.map((q: any, index: number) => ({
            id: q.id || index,
            exerciseId: q.exerciseId || exerciseId,
            question: q.question || q.text || '',
            questionType: (q.questionType || q.type || 'TEXT') as 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE',
            points: q.points || q.score || 0,
            options: q.options || [],
            correctAnswer: q.correctAnswer || q.answer || ''
          }));
        } else if (exerciseData.exerciseContent && Array.isArray(exerciseData.exerciseContent.questions)) {
          // Cas 3: questions dans exerciseContent.questions
          extractedQuestions = exerciseData.exerciseContent.questions.map((q: any, index: number) => ({
            id: q.id || index,
            exerciseId: q.exerciseId || exerciseId,
            question: q.question || q.text || '',
            questionType: (q.questionType || q.type || 'TEXT') as 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE',
            points: q.points || q.score || 0,
            options: q.options || [],
            correctAnswer: q.correctAnswer || q.answer || ''
          }));
        }
        
        console.log('Questions extraites:', extractedQuestions);
        
        const mappedExercise: Exercise = {
          id: exerciseData.id || exerciseId,
          courseId: exerciseData.courseId || courseId,
          title: exerciseData.title || exerciseData.name || 'Exercice sans titre',
          description: exerciseData.description || exerciseData.content?.description || '',
          maxScore: exerciseData.maxScore || exerciseData.maximumScore || exerciseData.totalPoints || 0,
          dueDate: exerciseData.dueDate || exerciseData.deadline || exerciseData.endDate || '',
          createdAt: exerciseData.createdAt || exerciseData.creationDate || new Date().toISOString(),
          updatedAt: exerciseData.updatedAt || exerciseData.modificationDate,
          status: (exerciseData.status?.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'CLOSED') || 'DRAFT',
          questions: extractedQuestions,
          submissionsCount: exerciseData.submissionsCount || exerciseData.totalSubmissions || 0,
          pendingCount: exerciseData.pendingCount || exerciseData.unreviewedSubmissions || 0,
          averageScore: exerciseData.averageScore || exerciseData.avgScore,
          totalStudents: exerciseData.totalStudents || exerciseData.studentCount
        };
        
        setExercise(mappedExercise);
        setQuestions(extractedQuestions);
      } else {
        console.warn('Réponse API vide ou sans data:', resp);
        toast.error('Exercice non trouvé');
      }
    } catch (error: any) {
      console.error('Erreur chargement exercice:', error);
      console.error('Détails erreur:', error.response?.data || error.message);
      toast.error('Erreur lors du chargement de l\'exercice');
    } finally {
      setLoading(false);
    }
  };
  
  const loadCourseInfo = async () => {
    try {
      const response = await CourseControllerService.getEnrichedCourse(courseId);
      if (response.data) {
        const courseData = response.data as any;
        setCourseInfo({
          title: courseData.title || `Cours #${courseId}`,
          category: courseData.category
        });
      }
    } catch (error) {
      console.error('Erreur chargement infos cours:', error);
    }
  };
  
  const handleEdit = () => {
    router.push(`/profdashboard/exercises/${courseId}/edit/${exerciseId}`);
  };
  
  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet exercice ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      // Vous devrez implémenter cette méthode dans EnseignantService
      // ou utiliser une API directe
      toast.success('Exercice supprimé');
      router.push(`/profdashboard/exercises/${courseId}`);
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };
  
  const handleViewSubmissions = () => {
    router.push(`/profdashboard/exercises/${courseId}/submissions/${exerciseId}`);
  };
  
  const handleDuplicate = async () => {
    try {
      toast.loading('Duplication en cours...');
      
      // Créer une copie de l'exercice
      const duplicateData = {
        title: `${exercise?.title} (Copie)`,
        description: exercise?.description,
        maxScore: exercise?.maxScore,
        dueDate: exercise?.dueDate,
        questions: questions.map(q => ({
          question: q.question,
          questionType: q.questionType,
          points: q.points,
          options: q.options,
          correctAnswer: q.correctAnswer
        })),
        status: 'DRAFT' as const
      };
      
      // Vous devrez implémenter cette méthode
      // await EnseignantService.createExercise(courseId, duplicateData);
      
      toast.dismiss();
      toast.success('Exercice dupliqué avec succès');
      // Recharger la liste des exercices
      loadExercise();
    } catch (error) {
      toast.dismiss();
      console.error('Erreur duplication:', error);
      toast.error('Erreur lors de la duplication');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement de l'exercice...</p>
        </div>
      </div>
    );
  }
  
  if (!exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Exercice non trouvé</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">L'exercice demandé n'existe pas ou vous n'y avez pas accès.</p>
          <button
            onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour aux exercices
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
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
              {exercise.title}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
              className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour aux exercices du cours
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Edit size={18} />
                Modifier
              </button>
              <button
                onClick={() => router.push('/profdashboard/exercises/' + courseId + '/update/' + exerciseId)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Eye size={18} />
                Voir soumissions
              </button>
            </div>
          </div>
        </div>
        
        {/* En-tête */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
                  <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                    {exercise.title}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      exercise.status === 'PUBLISHED' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : exercise.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {exercise.status === 'PUBLISHED' ? 'Publié' : 
                       exercise.status === 'DRAFT' ? 'Brouillon' : 'Fermé'}
                    </span>
                    {courseInfo?.category && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {courseInfo.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {exercise.description || 'Aucune description fournie.'}
                </p>
              </div>
              
              {/* Métadonnées */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {exercise.maxScore}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Points maximum
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {exercise.dueDate 
                          ? new Date(exercise.dueDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'Non définie'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Date limite
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {exercise.submissionsCount || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Soumissions
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {exercise.averageScore ? `${exercise.averageScore.toFixed(1)}` : '--'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Moyenne
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Questions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Questions ({questions.length})
            </h2>
            
            {questions.length === 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400">
                <AlertTriangle size={16} />
                <span className="text-sm">Aucune question</span>
              </div>
            )}
          </div>
          
          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-medium">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                          {question.question}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                            {question.questionType === 'TEXT' ? 'Texte libre' :
                             question.questionType === 'MULTIPLE_CHOICE' ? 'Choix multiple' : 'Code'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
                      {question.points} pts
                    </span>
                  </div>
                  
                  <div className="ml-11">
                    {/* Options pour les questions à choix multiple */}
                    {question.questionType === 'MULTIPLE_CHOICE' && question.options && question.options.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</span>
                        <ul className="mt-2 space-y-2">
                          {question.options.filter(opt => opt && opt.trim()).map((option, optIndex) => (
                            <li 
                              key={optIndex}
                              className={`flex items-center gap-2 text-sm p-2 rounded ${
                                option === question.correctAnswer
                                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                                  : 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              {option === question.correctAnswer ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" />
                              )}
                              <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                              <span>{option}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {/* Réponse correcte pour les autres types */}
                    {question.correctAnswer && question.questionType !== 'MULTIPLE_CHOICE' && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                          <CheckCircle size={16} />
                          Réponse correcte:
                        </span>
                        <p className="text-sm text-green-600 dark:text-green-300 mt-1 whitespace-pre-wrap">
                          {question.correctAnswer}
                        </p>
                      </div>
                    )}
                    
                    {!question.correctAnswer && question.questionType !== 'MULTIPLE_CHOICE' && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/20 rounded border border-gray-200 dark:border-gray-700">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Réponse attendue:
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">
                          Pas de réponse correcte définie. L'enseignant corrigera manuellement.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aucune question trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-6">
                Cet exercice ne contient pas encore de questions. Vous pouvez en ajouter en modifiant l'exercice.
              </p>
              <button
                onClick={() => router.push('/profdashboard/exercises/' + courseId + '/update/' + exerciseId)}
                className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Edit size={18} className="inline mr-2" />
                Ajouter des questions
              </button>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleEdit}
              className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
            >
              <Edit className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-800 dark:text-gray-200">Modifier</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Modifier les détails et questions
              </span>
            </button>
            
            <button
              onClick={handleViewSubmissions}
              className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
            >
              <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-800 dark:text-gray-200">Soumissions</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Voir et noter les soumissions
              </span>
            </button>
            
            <button
              onClick={handleDuplicate}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-colors group"
            >
              <Copy className="w-8 h-8 text-gray-600 dark:text-gray-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-800 dark:text-gray-200">Dupliquer</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Créer une copie de cet exercice
              </span>
            </button>
            
            <button
              onClick={handleDelete}
              className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
            >
              <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-gray-800 dark:text-gray-200">Supprimer</span>
              <span className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Supprimer définitivement cet exercice
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}