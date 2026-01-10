// app/(dashboard)/profdashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileCard from '@/components/professor/ProfileCard';
import CompositionsCard, { Composition } from '@/components/professor/CompositionsCard';
import { useAuth } from '@/contexts/AuthContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { CourseResponse } from '@/lib/models/CourseResponse';
import CreateCourseModal from '@/./components/create-course/page';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  photoUrl?: string;
  city?: string;
  university?: string;
  grade?: string;
  certification?: string;
  subjects?: string[];
  teachingGrades?: string[];
  teachingGoal?: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  subjects?: string[];
  university?: string;
}

export default function ProfessorDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'teacher') {
      router.push('/etudashboard');
      return;
    }

    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // 1. Fetch courses (compositions) for this teacher
        const coursesResponse = await CourseControllerService.getAuthorCourses(user.id);
        if (coursesResponse.data) {
          const mappedCompositions: Composition[] = coursesResponse.data.map((c: CourseResponse) => ({
            id: c.id?.toString() || Math.random().toString(),
            title: c.title || 'Sans titre',
            class: c.category || 'Non spécifiée',
            participants: Math.floor(Math.random() * 50), // Mock data as backend might not have this yet
            likes: 0,
            downloads: 0
          }));
          setCompositions(mappedCompositions);
        }

        // 2. Fetch other teachers (optional feature, if API exists)
        // For now, let's keep it empty or mock it if there's no "get all teachers" endpoint
        // or just use public courses authors
        setTeachers([]);

      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
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

  const displayName = (user.firstName || user.lastName)
    ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
    : user.email.split('@')[0];

  const professor = {
    id: user.id,
    name: displayName,
    city: user.city || 'Non spécifiée',
    university: user.university || 'Non spécifiée',
    grade: user.grade || 'Enseignant',
    certification: user.certification || 'Enseignement',
    totalStudents: compositions.reduce((acc, c) => acc + c.participants, 0),
    participationRate: 92,
    publications: compositions.length,
    photoUrl: '/images/prof.jpeg',
    performanceDistribution: [
      { range: 'Excellent', value: 35, color: 'bg-purple-600 dark:bg-purple-500' },
      { range: 'Bien', value: 30, color: 'bg-purple-400' },
      { range: 'Passable', value: 20, color: 'bg-purple-300 dark:bg-purple-400' },
      { range: 'Faible', value: 15, color: 'bg-purple-200 dark:bg-purple-300' },
    ]
  };

  const teachersList = teachers.map(t => ({
    id: t.id,
    name: `${t.firstName} ${t.lastName}`,
    subject: t.subjects?.[0] || 'Enseignement',
    rating: 4.5,
    students: 0,
    image: '',
    university: t.university
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 py-15">
        {/* Modale de création de cours */}
        <CreateCourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />

        {/* Top Section with Welcome */}
        <div className="bg-white dark:bg-gray-800 px-8 py-6 mb-8 border-b border-purple-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-3">
              Bienvenue Professeur {user.firstName} !
            </h1>
            <p className="text-gray-600 dark:text-gray-300 italic">
              "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde." - Nelson Mandela
            </p>
          </div>
          <div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push('/teacher/inscriptions')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gérer les inscriptions
              </button>


            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-8 pb-8 space-y-8">
          {/* Profile Card */}
          <ProfileCard professor={professor} />

          {/* Compositions Card */}
          {compositions.length > 0 ? (
            <CompositionsCard compositions={compositions} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700 text-center">
              <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-4">
                Mes Compositions
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Vous n'avez pas encore créé de cours.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold shadow-lg hover:bg-purple-700 transition mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Créer un cours
              </button>
            </div>
          )}


        </div>
      </div>
  );
}