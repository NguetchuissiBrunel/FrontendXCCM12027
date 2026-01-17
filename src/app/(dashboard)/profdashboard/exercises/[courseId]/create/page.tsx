// src/app/(dashboard)/profdashboard/exercises/[courseId]/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { EnseignantService } from '@/lib/services/EnseignantService';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import type { Question, ExerciseFormData } from '@/types/exercise';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Type, 
  List, 
  Code,
  Calendar,
  Award,
  Clock,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// Interface pour la requête de création
interface ExerciseCreateRequestData {
  title: string;
  description?: string;
  maxScore: number;
  dueDate?: string;
  questions?: Array<{
    question: string;
    questionType: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
    points: number;
    options?: string[];
    correctAnswer?: string;
  }>;
  status?: 'DRAFT' | 'PUBLISHED';
}

export default function CreateExercisePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const courseId = parseInt(params.courseId as string);
  
  const [loading, setLoading] = useState(false);
  const [courseInfo, setCourseInfo] = useState<{
    title: string;
    category?: string;
  } | null>(null);
  
  // État du formulaire
  const [formData, setFormData] = useState<ExerciseFormData>({
    title: '',
    description: '',
    maxScore: 100,
    dueDate: '',
    questions: []
  });
  
  // Nouvelle question par défaut
  const [newQuestion, setNewQuestion] = useState<{
    question: string;
    questionType: 'TEXT' | 'MULTIPLE_CHOICE' | 'CODE';
    points: number;
    options: string[];
    correctAnswer?: string;
  }>({
    question: '',
    questionType: 'TEXT',
    points: 10,
    options: ['', '', '', ''],
    correctAnswer: ''
  });
  
  // État pour la durée (optionnel)
  const [duration, setDuration] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    if (!user) {
      toast.error('Veuillez vous connecter');
      router.push('/login');
      return;
    }
    
    if (!courseId || courseId <= 0) {
      toast.error('ID de cours invalide');
      router.push('/profdashboard');
      return;
    }
    
    loadCourseInfo();
  }, [courseId, user, router]);
  
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
  
  const handleInputChange = (field: keyof ExerciseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleQuestionChange = (index: number, field: keyof typeof newQuestion, value: any) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  const handleNewQuestionChange = (field: keyof typeof newQuestion, value: any) => {
    setNewQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...formData.questions];
    const options = [...(updatedQuestions[questionIndex].options || [])];
    options[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options
    };
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };
  
  const addQuestion = () => {
    if (!newQuestion.question.trim()) {
      toast.error('Veuillez saisir une question');
      return;
    }
    
    if (newQuestion.questionType === 'MULTIPLE_CHOICE') {
      const validOptions = newQuestion.options.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        toast.error('Veuillez saisir au moins 2 options pour les questions à choix multiples');
        return;
      }
      
      // Si une réponse correcte est définie mais vide, la retirer
      if (newQuestion.correctAnswer && !newQuestion.correctAnswer.trim()) {
        setNewQuestion(prev => ({ ...prev, correctAnswer: undefined }));
      }
    }
    
    // S'assurer que correctAnswer est undefined si vide
    const finalCorrectAnswer = newQuestion.correctAnswer?.trim() 
      ? newQuestion.correctAnswer 
      : undefined;
    
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { 
        ...newQuestion, 
        correctAnswer: finalCorrectAnswer 
      }]
    }));
    
    // Réinitialiser le formulaire de nouvelle question
    setNewQuestion({
      question: '',
      questionType: 'TEXT',
      points: 10,
      options: ['', '', '', ''],
      correctAnswer: ''
    });
    
    toast.success('Question ajoutée');
  };
  
  const removeQuestion = (index: number) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
    toast.success('Question supprimée');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Veuillez saisir un titre pour l\'exercice');
      return;
    }
    
    if (formData.questions.length === 0) {
      toast.error('Veuillez ajouter au moins une question');
      return;
    }
    
    // Validation des points totaux
    const totalPoints = formData.questions.reduce((sum, q) => sum + q.points, 0);
    if (totalPoints !== formData.maxScore) {
      const confirm = window.confirm(
        `La somme des points des questions (${totalPoints}) ne correspond pas à la note maximale (${formData.maxScore}).\nSouhaitez-vous ajuster la note maximale à ${totalPoints} ?`
      );
      
      if (confirm) {
        setFormData(prev => ({
          ...prev,
          maxScore: totalPoints
        }));
      } else {
        toast.error('Veuillez ajuster les points des questions pour correspondre à la note maximale');
        return;
      }
    }
    
    setLoading(true);
    
    try {
      // Préparer les données pour l'API - CORRECTEMENT TYPÉ
      const exerciseData: ExerciseCreateRequestData = {
        title: formData.title,
        description: formData.description || undefined,
        maxScore: formData.maxScore,
        dueDate: formData.dueDate || undefined, // Utiliser undefined au lieu de null
        questions: formData.questions.map((q) => ({
          question: q.question,
          questionType: q.questionType,
          points: q.points,
          options: q.questionType === 'MULTIPLE_CHOICE' 
            ? q.options.filter(opt => opt.trim()) 
            : undefined,
          correctAnswer: q.correctAnswer?.trim() || undefined
        })),
        status: 'DRAFT'
      };
      
      // Appeler l'API pour créer l'exercice
      const response = await EnseignantService.createExercise(courseId, exerciseData);
      
      toast.success('Exercice créé avec succès !');
      
      // Rediriger vers la liste des exercices du cours
      router.push(`/profdashboard/exercises/${courseId}`);
      
    } catch (error: any) {
      console.error('Erreur création exercice:', error);
      
      if (error.response?.status === 400) {
        toast.error('Données invalides. Veuillez vérifier les informations saisies.');
      } else if (error.response?.status === 403) {
        toast.error('Vous n\'êtes pas autorisé à créer un exercice dans ce cours');
      } else if (error.response?.status === 404) {
        toast.error('Cours non trouvé');
      } else {
        toast.error('Erreur lors de la création de l\'exercice');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      toast.error('Veuillez saisir un titre pour l\'exercice');
      return;
    }
    
    setLoading(true);
    
    try {
      const exerciseData: ExerciseCreateRequestData = {
        title: formData.title,
        description: formData.description || undefined,
        maxScore: formData.maxScore,
        dueDate: formData.dueDate || undefined,
        questions: formData.questions.map((q) => ({
          question: q.question,
          questionType: q.questionType,
          points: q.points,
          options: q.questionType === 'MULTIPLE_CHOICE' 
            ? q.options.filter(opt => opt.trim()) 
            : undefined,
          correctAnswer: q.correctAnswer?.trim() || undefined
        })),
        status: 'DRAFT'
      };
      
      const response = await EnseignantService.createExercise(courseId, exerciseData);
      toast.success('Exercice sauvegardé comme brouillon !');
      router.push(`/profdashboard/exercises/${courseId}`);
      
    } catch (error) {
      console.error('Erreur sauvegarde brouillon:', error);
      toast.error('Erreur lors de la sauvegarde du brouillon');
    } finally {
      setLoading(false);
    }
  };
  
  if (!courseId || courseId <= 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Cours non trouvé</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">L'identifiant du cours est invalide.</p>
          <button
            onClick={() => router.push('/profdashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Retour au dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Retour aux exercices
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
                <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Créer un nouvel exercice
                </h1>
                <div className="flex items-center gap-3">
                  {courseInfo?.category && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      {courseInfo.category}
                    </span>
                  )}
                  <span className="text-gray-600 dark:text-gray-300">
                    Cours: {courseInfo?.title || `Cours #${courseId}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Formulaire principal */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <form onSubmit={handleSubmit}>
            {/* Informations de base */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                Informations de l'exercice
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Titre de l'exercice *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Introduction à React"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note maximale *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.maxScore}
                      onChange={(e) => handleInputChange('maxScore', parseInt(e.target.value) || 100)}
                      className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                    <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Décrivez l'exercice, les objectifs d'apprentissage, les consignes..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date limite
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durée estimée (minutes)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={duration || ''}
                      onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: 60"
                    />
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Questions */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  Questions ({formData.questions.length})
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total des points: {formData.questions.reduce((sum, q) => sum + q.points, 0)} / {formData.maxScore}
                </div>
              </div>
              
              {/* Liste des questions existantes */}
              {formData.questions.length > 0 && (
                <div className="space-y-4 mb-6">
                  {formData.questions.map((question, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-medium">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                            {question.question}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm font-medium">
                            {question.points} pts
                          </span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="ml-11">
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type: </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {question.questionType.toLowerCase().replace('_', ' ')}
                          </span>
                        </div>
                        
                        {question.questionType === 'MULTIPLE_CHOICE' && question.options && (
                          <div className="mt-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</span>
                            <ul className="mt-1 space-y-1">
                              {question.options.filter(opt => opt.trim()).map((option, optIndex) => (
                                <li key={optIndex} className="text-sm text-gray-600 dark:text-gray-400">
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                  {option === question.correctAnswer && (
                                    <span className="ml-2 text-green-600 dark:text-green-400 text-xs font-medium">
                                      (Correcte)
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Formulaire pour ajouter une nouvelle question */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                  Ajouter une nouvelle question
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question *
                    </label>
                    <textarea
                      value={newQuestion.question}
                      onChange={(e) => handleNewQuestionChange('question', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Posez votre question..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type de question
                      </label>
                      <select
                        value={newQuestion.questionType}
                        onChange={(e) => handleNewQuestionChange('questionType', e.target.value as any)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="TEXT">Texte libre</option>
                        <option value="MULTIPLE_CHOICE">Choix multiple</option>
                        <option value="CODE">Code</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Points *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={formData.maxScore}
                        value={newQuestion.points}
                        onChange={(e) => handleNewQuestionChange('points', parseInt(e.target.value) || 10)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Réponse correcte
                      </label>
                      <input
                        type="text"
                        value={newQuestion.correctAnswer || ''}
                        onChange={(e) => handleNewQuestionChange('correctAnswer', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Facultatif"
                      />
                    </div>
                  </div>
                  
                  {/* Options pour les questions à choix multiple */}
                  {newQuestion.questionType === 'MULTIPLE_CHOICE' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Options de réponse *
                      </label>
                      <div className="space-y-2">
                        {newQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-6">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...newQuestion.options];
                                newOptions[index] = e.target.value;
                                handleNewQuestionChange('options', newOptions);
                              }}
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                              placeholder={`Option ${String.fromCharCode(65 + index)}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const isCurrentlyCorrect = option === newQuestion.correctAnswer;
                                handleNewQuestionChange('correctAnswer', isCurrentlyCorrect ? '' : option);
                              }}
                              className={`px-3 py-1 rounded text-sm ${
                                option === newQuestion.correctAnswer
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                              }`}
                            >
                              {option === newQuestion.correctAnswer ? 'Correcte' : 'Marquer'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    <Plus size={20} />
                    Ajouter cette question
                  </button>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.push(`/profdashboard/exercises/${courseId}`)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Annuler
              </button>
              
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading || !formData.title.trim()}
                className="px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Sauvegarder comme brouillon
              </button>
              
              <button
                type="submit"
                disabled={loading || formData.questions.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Créer l'exercice
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Aide */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Conseils pour créer un bon exercice
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Donnez un titre clair et explicite à votre exercice</li>
                <li>• Rédigez des consignes précises et compréhensibles</li>
                <li>• Assurez-vous que les questions couvrent les objectifs d'apprentissage</li>
                <li>• Vérifiez que la somme des points des questions correspond à la note maximale</li>
                <li>• Pour les QCM, proposez des options plausibles et une seule réponse correcte</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}