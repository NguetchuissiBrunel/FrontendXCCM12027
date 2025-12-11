// app/etudashboard/cours/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { BookOpen, Clock } from 'lucide-react';
import Link from 'next/link';
import { EnrollmentService } from '@/utils/enrollmentService';
import { courses } from '@/data/CourseData';
import { EnrichedCourse } from '@/types/enrollment';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  specialization?: string;
  level?: string;
}

export default function StudentCourses() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrichedCourse[]>([]);
  const router = useRouter();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(currentUser);
      
      if (userData.role !== 'student') {
        router.push('/profdashboard');
        return;
      }
      
      setUser(userData);

          // Charger les cours enrôlés avec leurs données
    const enrollments = EnrollmentService.getEnrollments(userData.id);
    const enrolledCoursesData = courses
      .filter(course => enrollments.some(e => e.courseId === course.id))
      .map(course => {
        const enrollment = enrollments.find(e => e.courseId === course.id);
        return {
          id: course.id,
          title: course.title,
          category: course.category || 'Formation',
          image: course.image,
          author: course.author,
          enrollment: enrollment || undefined
        } as EnrichedCourse;
      });
    
    setEnrolledCourses(enrolledCoursesData);

    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);


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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = `${user.firstName} ${user.lastName}`;
  const userLevel = user.specialization || user.level || 'Étudiant';

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
                    src={course.author.image}
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
