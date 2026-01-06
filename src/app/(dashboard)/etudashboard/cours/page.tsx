// app/etudashboard/cours/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { BookOpen, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { EnrollmentService } from '@/utils/enrollmentService';
import { useCourses } from '@/hooks/useCourses';
import { EnrichedCourse } from '@/types/enrollment';

export default function StudentCourses() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrichedCourse[]>([]);
  const { courses: allCourses, loading: coursesLoading } = useCourses();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'student') {
      router.push('/profdashboard');
      return;
    }

    const fetchMyEnrollments = async () => {
      try {
        setLoading(true);
        // Utiliser le service centralisé qui gère correctement la structure de réponse API
        const enrollments = await EnrollmentService.getMyEnrollments();

        // Joindre les informations des cours
        const enriched = enrollments.map((enrollment) => {
          const courseDetail = allCourses.find(c => c.id === enrollment.courseId);

          // Si on trouve les détails du cours, on les utilise
          if (courseDetail) {
            return {
              id: courseDetail.id,
              title: courseDetail.title,
              category: courseDetail.category || 'Formation',
              image: courseDetail.image,
              author: courseDetail.author,
              enrollment: {
                ...enrollment,
                status: enrollment.status // Ensure status is passed
              }
            } as unknown as EnrichedCourse;
          }

          // Sinon (si useCourses n'a pas encore chargé ou cours non trouvé dans la liste globale), 
          // on retourne un objet partiel pour afficher au moins l'inscription
          return {
            id: enrollment.courseId,
            title: `Cours #${enrollment.courseId}`,
            category: 'Cours',
            image: '', // Placeholder handled in UI
            author: {
              name: 'Inconnu',
              image: ''
            },
            enrollment: {
              ...enrollment,
              status: enrollment.status
            }
          } as EnrichedCourse;
        });

        setEnrolledCourses(enriched);
      } catch (err: any) {
        console.error('Erreur lors du chargement des inscriptions:', err);
        setError("Impossible de charger vos cours. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyEnrollments();
  }, [isAuthenticated, user, authLoading, coursesLoading, allCourses, router]);


  // Fonction pour formater la date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Date inconnue';
    }
  };

  if (loading || authLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement de vos cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md border border-red-100 dark:border-red-900/30">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Oups !</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = `${user.firstName || ''} ${user.lastName || ''}`;
  const userLevel = user.specialization || (user as any).level || 'Étudiant';

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
      <Sidebar
        userRole="student"
        userName={displayName}
        userLevel={userLevel}
        activeTab="cours"
      />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-8">Mes Cours</h1>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 border border-purple-200 dark:border-purple-900/30 hover:shadow-xl transition-all duration-300"
              >
                {/* Catégorie */}
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-4 block">
                  {course.category}
                </span>

                {/* Titre */}
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {course.title}
                </h3>

                {/* Auteur */}
                <div className="flex items-center mb-4">
                  <div className="relative w-8 h-8 mr-3">
                    <img
                      src={course.author.image?course.author.image:'/images/prof.jpeg'}
                      alt={course.author.name}
                      className="rounded-full object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {course.author.name}
                    </p>
                    {course.author.designation && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {course.author.designation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Progression */}
                {course.enrollment && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Progression</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {course.enrollment.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${course.enrollment.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Date d'enrôlement */}
                {course.enrollment && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Inscrit le {formatDate(course.enrollment.enrolledAt)}</span>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <Link href={`/courses/${course.id}`} className="flex-1">
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition-colors text-sm">
                      Voir le cours
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Message quand aucun cours enrôlé
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
            <div className="flex flex-col items-center justify-center text-center">
              <BookOpen className="h-20 w-20 text-gray-400 dark:text-gray-500 mb-6" />
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                Vous n'avez pas encore de cours
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-lg mb-8">
                Explorez la bibliothèque pour trouver des cours intéressants et commencez votre apprentissage !
              </p>
              <Link href="/bibliotheque">
                <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3">
                  <BookOpen className="h-6 w-6" />
                  Explorer la bibliothèque
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
