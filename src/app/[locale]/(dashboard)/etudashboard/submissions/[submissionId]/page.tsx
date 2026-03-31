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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('submissionDetails');
  const params = useParams();
  const router = useRouter();
  const submissionId = parseInt(params?.submissionId as string);

  const [user, setUser] = useState<AppUser | null>(null);

  const {
    submission,
    isLoading: submissionLoading,
    error: submissionError,
    refetch: refetchSubmission
  } = useSubmissionDetails(submissionId);

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
      exercise: submission.exerciseTitle || t('exerciseLabel'),
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
    toast.success(t('downloadSuccess'));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('notAvailable');
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
      return t('invalidDate');
    }
  };

  const calculateTimeSpent = () => {
    if (!submission?.timeSpent) return t('timeNotRecorded');
    const minutes = Math.floor(submission.timeSpent / 60);
    const seconds = submission.timeSpent % 60;
    return t('timeFormat', { minutes, seconds });
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
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (submissionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loadingSubmission')}</p>
        </div>
      </div>
    );
  }

  if (submissionError || !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('notFound.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {submissionError?.message || t('notFound.message')}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/etudashboard/submissions')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('backToSubmissions')}
            </button>
            <button
              onClick={() => refetchSubmission()}
              className="w-full px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = `${user.firstName} ${user.lastName}`;
  const userLevel = user.specialization || user.level || t('studentDefault');
  const exerciseTitle = submission.exerciseTitle || t('exerciseLabel');

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Sidebar
        userRole="student"
        userName={displayName}
        userLevel={userLevel}
        activeTab="soumissions"
      />

      <main className="flex-1 p-4 md:p-8 lg:ml-64">
        <div className="mb-8">
          <button
            onClick={() => router.push('/etudashboard/submissions')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>{t('backToSubmissions')}</span>
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {exerciseTitle}
                </p>
              </div>

              {submission.exerciseId && (
                <button
                  onClick={() => router.push(`/etudashboard/exercises/${submission.exerciseId}`)}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
                >
                  <Eye size={16} />
                  {t('viewExercise')}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {t('status.title')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {submission.score !== undefined ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-green-600">{t('status.graded')}</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-yellow-500" />
                          <span className="font-medium text-yellow-600">{t('status.pending')}</span>
                        </>
                      )}
                    </div>
                    {submission.gradedAt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t('status.gradedOn', { date: formatDate(submission.gradedAt) })}
                        {submission.gradedBy && t('status.gradedBy', { name: submission.gradedBy })}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">{t('score')}</div>
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
                      <span className="font-medium text-gray-700">{t('submittedOn')}</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">
                      {formatDate(submission.submittedAt)}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Timer className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-700">{t('timeSpent')}</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">
                      {calculateTimeSpent()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {submission.feedback && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  {t('feedback.title')}
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {submission.feedback}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {t('answers.title')}
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
                              {t('answers.question', { number: index + 1 })}
                            </span>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {t('answers.id', { id: answer.questionId })}
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
                        <div className="text-sm text-gray-500 mb-1">{t('answers.yourAnswer')}</div>
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                            {answer.answer || t('answers.noAnswer')}
                          </p>
                        </div>
                      </div>

                      {answer.feedback && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-sm text-gray-500 mb-1">{t('feedback.comment')}</div>
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
                    {t('answers.noAnswers')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {t('studentInfo.title')}
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">{t('studentInfo.name')}</span>
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {submission.studentName}
                  </p>
                </div>

                {submission.studentEmail && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{t('studentInfo.email')}</span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200">
                      {submission.studentEmail}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">{t('studentInfo.id')}</span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-mono text-sm">
                    {submission.studentId}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}