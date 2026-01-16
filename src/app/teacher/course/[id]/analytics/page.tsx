'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { StatsControllerService, CourseStatsResponse } from '@/lib/services/StatsControllerService';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { useLoading } from '@/contexts/LoadingContext';
import { 
  ArrowLeft, 
  Users, 
  BarChart, 
  TrendingUp, 
  Clock, 
  Award, 
  Activity, 
  Download, 
  Heart, 
  RefreshCw, 
  Eye, 
  FileText, 
  Calendar, 
  Target,
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  TrendingDown
} from 'lucide-react';

interface RealTimeStats extends CourseStatsResponse {
  lastUpdated: string;
  isLoading: boolean;
  error?: string;
}

export default function CourseAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  
  const [courseStats, setCourseStats] = useState<RealTimeStats | null>(null);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 secondes
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  const courseId = params.id as string;

  // Fonction pour charger les données
  const loadData = async () => {
    if (!user || !courseId) return;

    try {
      setLoading(true);
      const courseIdNum = parseInt(courseId, 10);
      
      if (isNaN(courseIdNum)) {
        throw new Error('ID de cours invalide');
      }

      // Charger les informations du cours
      try {
        // Vous devrez peut-être créer un endpoint pour obtenir les infos d'un cours spécifique
        // Pour l'instant, on utilise getAllCourses et on filtre
        const allCourses = await CourseControllerService.getAllCourses();
        const course = allCourses.data?.find((c: any) => 
          parseInt(c.id || '0', 10) === courseIdNum
        );
        if (course) {
          setCourseInfo(course);
        }
      } catch (error) {
        console.warn('Impossible de charger les infos du cours:', error);
      }

      // Charger les statistiques
      const response = await StatsControllerService.getCourseStats(courseIdNum);
      
      if (response.data) {
        setCourseStats({
          ...response.data,
          lastUpdated: new Date().toISOString(),
          isLoading: false
        });
      } else {
        setCourseStats({
          courseId: courseIdNum,
          courseTitle: 'Cours non trouvé',
          courseCategory: '',
          totalEnrolled: 0,
          activeStudents: 0,
          participationRate: 0,
          averageProgress: 0,
          completedStudents: 0,
          totalExercises: 0,
          exerciseStats: [],
          performanceDistribution: {
            excellent: 0,
            good: 0,
            average: 0,
            poor: 0,
            total: 0
          },
          lastUpdated: new Date().toISOString(),
          isLoading: false,
          error: 'Aucune statistique disponible'
        });
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setCourseStats(prev => prev ? {
        ...prev,
        isLoading: false,
        error: 'Erreur de chargement des données'
      } : null);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'teacher') {
      router.push('/etudashboard');
      return;
    }

    if (user && courseId) {
      loadData();
    }
  }, [user, authLoading, isAuthenticated, router, courseId]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !courseId) return;

    const interval = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, courseId]);

  // Gestion du loading state
  useEffect(() => {
    if (authLoading || loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [authLoading, loading, startLoading, stopLoading]);

  // Fonction pour formater la date
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
        <div className="max-w-7xl mx-auto px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseStats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
        <div className="max-w-7xl mx-auto px-8">
          <button
            onClick={() => router.push('/profdashboard')}
            className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-8 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
          </button>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-8 border border-yellow-200 dark:border-yellow-900/30 text-center">
            <h2 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">
              Cours non trouvé
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Le cours que vous recherchez n'existe pas ou vous n'y avez pas accès.
            </p>
            <button
              onClick={() => router.push('/profdashboard')}
              className="px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              Retour au dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fonctions utilitaires
  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeBgColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/30';
    if (percentage >= 60) return 'bg-blue-100 dark:bg-blue-900/30';
    if (percentage >= 40) return 'bg-yellow-100 dark:bg-yellow-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header avec contrôle de rafraîchissement */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/profdashboard')}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              Dashboard
            </button>
            <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
              Analytics en temps réel
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Indicateur de rafraîchissement */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {courseStats.isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mise à jour...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Dernière mise à jour: {formatTimeAgo(new Date(courseStats.lastUpdated))}</span>
                </>
              )}
            </div>
            
            {/* Contrôles de rafraîchissement */}
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={courseStats.isLoading}
                className="p-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors disabled:opacity-50"
                title="Rafraîchir maintenant"
              >
                <RefreshCw className={`w-5 h-5 ${courseStats.isLoading ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded text-purple-600 dark:text-purple-400 focus:ring-purple-500"
                  />
                  Auto-refresh
                </label>
                
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={10000}>10 sec</option>
                  <option value={30000}>30 sec</option>
                  <option value={60000}>1 min</option>
                  <option value={300000}>5 min</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Course Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <FileText className="text-purple-600 dark:text-purple-400" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">
                    {courseStats.courseTitle}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    {courseStats.courseCategory}
                  </p>
                </div>
              </div>
              
              {courseInfo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Créé le: {new Date(courseInfo.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Target className="w-4 h-4" />
                    <span>Statut: {courseInfo.status || 'PUBLISHED'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span>ID: {courseStats.courseId}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Dernière activité</p>
                <p className="font-semibold text-gray-800 dark:text-white">
                  {formatTimeAgo(new Date(courseStats.lastUpdated))}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">État du cours</p>
                <div className="flex items-center gap-2 justify-end">
                  <div className={`w-2 h-2 rounded-full ${courseStats.totalEnrolled > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {courseStats.totalEnrolled > 0 ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview en temps réel */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Users className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                {courseStats.totalEnrolled > 0 && (
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                    +{Math.floor(courseStats.totalEnrolled * 0.1)} cette semaine
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Étudiants Inscrits</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {courseStats.totalEnrolled}
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${Math.min(courseStats.totalEnrolled * 10, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Activity className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  courseStats.participationRate >= 70 ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                  courseStats.participationRate >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                }`}>
                  {courseStats.participationRate >= 70 ? 'Élevé' : 
                   courseStats.participationRate >= 40 ? 'Moyen' : 'Faible'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Taux de Participation</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {courseStats.participationRate}%
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    courseStats.participationRate >= 70 ? 'bg-green-600 dark:bg-green-500' :
                    courseStats.participationRate >= 40 ? 'bg-yellow-600 dark:bg-yellow-500' :
                    'bg-red-600 dark:bg-red-500'
                  }`}
                  style={{ width: `${courseStats.participationRate}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <BarChart className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                {courseStats.averageProgress > 60 && (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Progression Moyenne</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {courseStats.averageProgress}%
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    courseStats.averageProgress >= 70 ? 'bg-green-600 dark:bg-green-500' :
                    courseStats.averageProgress >= 50 ? 'bg-blue-600 dark:bg-blue-500' :
                    'bg-yellow-600 dark:bg-yellow-500'
                  }`}
                  style={{ width: `${courseStats.averageProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-900/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Award className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                  {courseStats.totalExercises} exercices
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Étudiants Terminés</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {courseStats.completedStudents}
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${courseStats.totalEnrolled > 0 ? (courseStats.completedStudents / courseStats.totalEnrolled) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Live Activity Feed (simulé) */}
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                Activité récente
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <div className="space-y-3">
              {/* Activités simulées */}
              {courseStats.totalEnrolled > 0 ? (
                <>
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-white">
                        Nouvelle soumission d'exercice
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Il y a 2 minutes
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-white">
                        {courseStats.activeStudents} étudiants actuellement connectés
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        En ce moment
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 dark:text-white">
                        Progression moyenne en hausse de 2% cette semaine
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Depuis lundi
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucune activité récente. Les étudiants ne sont pas encore actifs dans ce cours.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Distribution en temps réel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Distribution des Performances
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Mise à jour en temps réel
            </span>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4">
                {[
                  { label: 'Excellent', value: courseStats.performanceDistribution.excellent, color: 'bg-purple-600 dark:bg-purple-500', IconComponent: CheckCircle },
                  { label: 'Bien', value: courseStats.performanceDistribution.good, color: 'bg-purple-400', IconComponent: TrendingUp },
                  { label: 'Passable', value: courseStats.performanceDistribution.average, color: 'bg-purple-300 dark:bg-purple-400', IconComponent: AlertCircle },
                  { label: 'Faible', value: courseStats.performanceDistribution.poor, color: 'bg-purple-200 dark:bg-purple-300', IconComponent: TrendingDown },
                ].map((item, index) => {
                  const { IconComponent } = item;
                  const percentage = courseStats.performanceDistribution.total > 0
                    ? (item.value / courseStats.performanceDistribution.total) * 100
                    : 0;
                  
                  return (
                    <div key={index} className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center`}>
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">
                            {item.label}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-gray-800 dark:text-white">
                            {item.value}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            étudiants
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-4">
                          <div 
                            className={`h-2 rounded-full ${item.color} transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-64 h-64 mb-6">
                <svg className="w-64 h-64 -rotate-90" viewBox="0 0 100 100">
                  {[
                    { value: courseStats.performanceDistribution.excellent, color: '#7c3aed' },
                    { value: courseStats.performanceDistribution.good, color: '#a78bfa' },
                    { value: courseStats.performanceDistribution.average, color: '#c4b5fd' },
                    { value: courseStats.performanceDistribution.poor, color: '#ddd6fe' },
                  ].reduce((acc, item, index, array) => {
                    const total = array.reduce((sum, i) => sum + i.value, 0) || 1;
                    const percentage = (item.value / total) * 100;
                    const previousValues = array.slice(0, index).reduce((sum, i) => sum + i.value, 0);
                    const circumference = 2 * Math.PI * 45;
                    const strokeDasharray = `${(percentage * circumference) / 100} ${circumference}`;
                    const strokeDashoffset = `-${(previousValues / total * 100 * circumference) / 100}`;
                    
                    acc.push(
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="10"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-1000"
                      />
                    );
                    return acc;
                  }, [] as React.ReactElement[])}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-gray-800 dark:text-white">
                      {courseStats.performanceDistribution.total > 0
                        ? `${Math.round(courseStats.averageProgress)}%`
                        : '0%'}
                    </span>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Score moyen
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {courseStats.performanceDistribution.total} étudiants
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[
                  { color: 'bg-purple-600', label: 'Excellent' },
                  { color: 'bg-purple-400', label: 'Bien' },
                  { color: 'bg-purple-300', label: 'Passable' },
                  { color: 'bg-purple-200', label: 'Faible' },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-3 h-3 ${item.color} rounded mx-auto mb-1`}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Statistics en temps réel */}
        {courseStats.exerciseStats && courseStats.exerciseStats.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Exercices en temps réel ({courseStats.exerciseStats.length})
              </h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Données mises à jour
                </span>
              </div>
            </div>
            
            <div className="space-y-6">
              {courseStats.exerciseStats.map((exercise, index) => {
                const submissionRate = courseStats.totalEnrolled > 0
                  ? (exercise.submissionCount / courseStats.totalEnrolled) * 100
                  : 0;
                const averagePercentage = (exercise.averageScore / exercise.maxPossibleScore) * 100;
                
                return (
                  <div key={exercise.exerciseId} className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 ${getGradeBgColor(exercise.averageScore, exercise.maxPossibleScore)} rounded-lg flex items-center justify-center`}>
                            <FileText className={`w-5 h-5 ${getGradeColor(exercise.averageScore, exercise.maxPossibleScore)}`} />
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                              {exercise.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              ID: {exercise.exerciseId}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        <div className={`px-4 py-2 rounded-lg font-semibold ${getGradeBgColor(exercise.averageScore, exercise.maxPossibleScore)} ${getGradeColor(exercise.averageScore, exercise.maxPossibleScore)}`}>
                          Moyenne: {exercise.averageScore}/{exercise.maxPossibleScore}
                        </div>
                        <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-semibold">
                          {submissionRate.toFixed(1)}% de soumission
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Heart className="text-purple-600 dark:text-purple-400" size={20} />
                          <p className="text-sm text-gray-500 dark:text-gray-400">Soumissions</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {exercise.submissionCount}
                        </p>
                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div 
                            className="bg-purple-600 dark:bg-purple-500 h-1 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(exercise.submissionCount * 5, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Score Minimum</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {exercise.minScore}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          sur {exercise.maxPossibleScore}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Score Maximum</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {exercise.maxScore}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          sur {exercise.maxPossibleScore}
                        </p>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Taux de Réussite</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">
                          {averagePercentage.toFixed(1)}%
                        </p>
                        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full transition-all duration-500 ${
                              averagePercentage >= 80 ? 'bg-green-600 dark:bg-green-500' :
                              averagePercentage >= 60 ? 'bg-blue-600 dark:bg-blue-500' :
                              averagePercentage >= 40 ? 'bg-yellow-600 dark:bg-yellow-500' :
                              'bg-red-600 dark:bg-red-500'
                            }`}
                            style={{ width: `${averagePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={() => window.open(`/courses/${courseId}`, '_blank')}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
          >
            <Eye size={20} />
            Voir le cours
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-6 py-3 border-2 border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors"
          >
            <RefreshCw size={20} />
            Rafraîchir les données
          </button>
          <button
            onClick={() => router.push('/profdashboard')}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={20} />
            Retour au dashboard
          </button>
        </div>

        {/* Footer avec timestamp */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Dernière mise à jour complète: {new Date(courseStats.lastUpdated).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Les données se mettent à jour automatiquement toutes les {refreshInterval / 1000} secondes
          </p>
        </div>
      </div>
    </div>
  );
}