// src/app/(dashboard)/etudashboard/submissions/[submissionId]/page.tsx - VERSION CORRIGÉE
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useSubmissionDetails } from '@/hooks/useExercise';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  FileText, 
  Award, 
  AlertCircle,
  Calendar,
  User,
  Mail,
  Timer,
  Eye,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
  specialization?: string;
  level?: string;
}

export default function SubmissionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = parseInt(params.submissionId as string);
  
  const [user, setUser] = useState<AppUser | null>(null);
  
  // Utiliser le hook de soumission
  const { 
    submission, 
    isLoading: submissionLoading, 
    error: submissionError,
    refetch: refetchSubmission 
  } = useSubmissionDetails(submissionId);

  // Charger l'utilisateur
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      try {
        setUser(JSON.parse(currentUser));
      } catch (error) {
        console.error('Error parsing user:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleDownload = () => {
    if (!submission) return;
    
    const data = {
      student: submission.studentName,
      email: submission.studentEmail,
      exercise: submission.exerciseTitle || 'Exercice',
      score: submission.score,
      maxScore: submission.maxScore,
      submittedAt: submission.submittedAt,
      gradedAt: submission.gradedAt,
      gradedBy: submission.gradedBy,
      feedback: submission.feedback,
      answers: submission.answers
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soumission-${submission.studentName}-${submission.exerciseTitle || 'exercice'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('✅ Soumission téléchargée');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  const calculateTimeSpent = () => {
    if (!submission?.timeSpent) return 'Non enregistré';
    const minutes = Math.floor(submission.timeSpent / 60);
    const seconds = submission.timeSpent % 60;
    return `${minutes} min ${seconds} sec`;
  };

  const getScoreColor = (score?: number, maxScore?: number) => {
    if (score === undefined || maxScore === undefined || maxScore === 0) return 'text-gray-500';
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (submissionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Chargement de la soumission...</p>
        </div>
      </div>
    );
  }

  if (submissionError || !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Soumission non trouvée</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {submissionError?.message || 'Cette soumission n\'existe pas ou vous n\'y avez pas accès.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/etudashboard/submissions')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour à mes soumissions
            </button>
            <button
              onClick={() => refetchSubmission()}
              className="w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = `${user.firstName} ${user.lastName}`;
  const userLevel = user.specialization || user.level || 'Étudiant';
  const exerciseTitle = submission.exerciseTitle || 'Exercice';

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Sidebar
        userRole="student"
        userName={displayName}
        userLevel={userLevel}
        activeTab="soumissions"
      />

      <main className="flex-1 p-4 md:p-8 lg:ml-64">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/etudashboard/submissions')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Retour à mes soumissions</span>
          </button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Détails de la soumission
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {exerciseTitle}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <Download size={16} />
                  Télécharger
                </button>
                {submission.exerciseId && (
                  <button
                    onClick={() => router.push(`/etudashboard/exercises/${submission.exerciseId}`)}
                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Eye size={16} />
                    Voir l'exercice
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne gauche : Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statut et score */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Statut de la soumission
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {submission.graded ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-green-600">Noté</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium text-yellow-600">En attente</span>
                        </>
                      )}
                    </div>
                    {submission.gradedAt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Corrigé le {formatDate(submission.gradedAt)}
                        {submission.gradedBy && ` par ${submission.gradedBy}`}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Score</div>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-3xl font-bold ${getScoreColor(submission.score, submission.maxScore)}`}>
                        {submission.score !== undefined ? submission.score : '--'}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-xl text-gray-700 dark:text-gray-300">{submission.maxScore}</span>
                      {submission.score !== undefined && submission.maxScore > 0 && (
                        <span className="ml-2 text-lg text-gray-600">
                          ({Math.round((submission.score / submission.maxScore) * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-700">Soumis le</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">
                      {formatDate(submission.submittedAt)}
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Timer className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-700">Temps passé</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">
                      {calculateTimeSpent()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback */}
            {submission.feedback && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Feedback du correcteur
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {submission.feedback}
                  </p>
                </div>
              </div>
            )}

            {/* Réponses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Réponses soumises
              </h3>
              
              {submission.answers && submission.answers.length > 0 ? (
                <div className="space-y-4">
                  {submission.answers.map((answer, index) => (
                    <div key={answer.id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              Question {index + 1}
                            </span>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              ID: {answer.questionId}
                            </div>
                          </div>
                        </div>
                        
                        {answer.points !== undefined && (
                          <div className={`text-lg font-bold ${getScoreColor(answer.points, 10)}`}>
                            {answer.points} pts
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-sm text-gray-500 mb-1">Votre réponse :</div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                            {answer.answer || 'Aucune réponse'}
                          </p>
                        </div>
                      </div>
                      
                      {answer.feedback && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-sm text-gray-500 mb-1">Commentaire :</div>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {answer.feedback}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucune réponse disponible
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Colonne droite : Informations */}
          <div className="space-y-6">
            {/* Informations étudiant */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Informations étudiant
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Nom</span>
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {submission.studentName}
                  </p>
                </div>
                
                {submission.studentEmail && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">Email</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">
                      {submission.studentEmail}
                    </p>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">ID étudiant</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {submission.studentId}
                  </p>
                </div>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Métadonnées
              </h3>
              
              <div className="space-y-3">
                {submission.ipAddress && (
                  <div>
                    <div className="text-sm text-gray-500">Adresse IP</div>
                    <p className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                      {submission.ipAddress}
                    </p>
                  </div>
                )}
                
                {submission.lastModifiedAt && (
                  <div>
                    <div className="text-sm text-gray-500">Dernière modification</div>
                    <p className="text-gray-800 dark:text-gray-200 text-sm">
                      {formatDate(submission.lastModifiedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-gray-800 dark:text-white mb-3">
                Actions
              </h3>
              <div className="space-y-2">
                {submission.exerciseId && (
                  <button
                    onClick={() => router.push(`/etudashboard/exercises/${submission.exerciseId}`)}
                    className="w-full py-2.5 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Revoir l'exercice
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  className="w-full py-2.5 text-center border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Télécharger
                </button>
                <button
                  onClick={refetchSubmission}
                  className="w-full py-2.5 text-center border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw size={16} />
                  Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}