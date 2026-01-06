// app/etudashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { BookOpen } from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
  specialization?: string;
  level?: string;
  university?: string;
  city?: string;
}

export default function StudentHome() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]); // Utiliser un type plus précis si possible
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
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

        // Charger les cours
        // Note: Il faudrait idéalement une méthode qui retourne les cours ENTIERS + l'objet enrollment
        // Pour l'instant on simule ou on utilise ce qu'on a.
        // On va essayer de récupérer via EnrollmentService.getMyEnrollments()
        // Si cette méthode ne retourne que les enrollments sans les détails du cours, il faudra peut-être fetcher les cours ensuite.
        // Supposons que le backend a été malin et renvoie les détails du cours dans le DTO ou qu'on doit faire avec.

        // Temporaire : on va juste vérifier si EnrollmentService est disponible et essayer
        try {
          // Import dynamique pour éviter les soucis de cycle ou de type si pas encore 100% prêt
          const { EnrollmentService } = await import('@/utils/enrollmentService');
          const enrollments = await EnrollmentService.getMyEnrollments();
          setEnrolledCourses(enrollments);
        } catch (err) {
          console.error("Impossible de charger les cours", err);
        }

      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

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
        activeTab="accueil"
      />

      <main className="flex-1 p-8">
        {/* Welcome Message */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700">
          <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-4">
            Bienvenue {user.firstName} !
          </h1>
          <p className="text-gray-600 dark:text-gray-300 italic">
            "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte."
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <BookOpen className="text-purple-600" />
              Mes Cours ({enrolledCourses.length})
            </h2>
            <button
              onClick={() => router.push('/bibliotheque')}
              className="text-purple-600 hover:text-purple-700 font-medium hover:underline"
            >
              Explorer la bibliothèque →
            </button>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment) => (
                <div key={enrollment.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                    {/* Image placeholder ou réelle si dispo */}
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <BookOpen className="w-12 h-12 opacity-50" />
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${enrollment.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                          enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {enrollment.status === 'APPROVED' ? 'Actif' : enrollment.status === 'PENDING' ? 'En attente' : enrollment.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Cours #{enrollment.courseId}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">
                      Cours #{enrollment.courseId}
                    </h3>

                    {enrollment.status === 'APPROVED' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1 text-gray-500">
                          <span>Progression</span>
                          <span>{enrollment.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${enrollment.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => router.push(`/courses/${enrollment.courseId}`)} // Adapt ID if routing uses slug
                      disabled={enrollment.status !== 'APPROVED'}
                      className={`mt-4 w-full py-2 rounded-lg font-medium transition-colors ${enrollment.status === 'APPROVED'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {enrollment.status === 'APPROVED' ? 'Continuer' : 'En attente'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Aucun cours pour le moment</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Vous n'êtes inscrit à aucun cours.</p>
              <button
                onClick={() => router.push('/bibliotheque')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Découvrir les cours
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
