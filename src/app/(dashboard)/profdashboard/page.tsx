// app/(dashboard)/profdashboard/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileCard from '@/components/professor/ProfileCard';
import CompositionsCard, { Composition } from '@/components/professor/CompositionsCard';
import TeachersCard from '@/components/professor/TeachersCard';
import axios from 'axios';

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
  const [user, setUser] = useState<User | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
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

        if (userData.role !== 'teacher') {
          router.push('/etudashboard');
          return;
        }

        setUser(userData);

        try {
          const response = await axios.get('http://localhost:4000/users');
          const allTeachers = response.data.filter(
            (u: User) => u.role === 'teacher' && u.id !== userData.id
          );
          setTeachers(allTeachers);
        } catch (error) {
          console.error('Erreur lors du chargement des enseignants:', error);
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

  const professor = {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    city: user.city || 'Non spécifiée',
    university: user.university || 'Non spécifiée',
    grade: user.grade || 'Enseignant',
    certification: user.certification || 'Non spécifiée',
    totalStudents: 0,
    participationRate: 92,
    publications: 0,
    photoUrl: user.photoUrl,
    performanceDistribution: [
      { range: 'Excellent', value: 35, color: 'bg-purple-600 dark:bg-purple-500' },
      { range: 'Bien', value: 30, color: 'bg-purple-400' },
      { range: 'Passable', value: 20, color: 'bg-purple-300 dark:bg-purple-400' },
      { range: 'Faible', value: 15, color: 'bg-purple-200 dark:bg-purple-300' },
    ]
  };

  const compositions: Composition[] = [];

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
      {/* Top Section with Welcome */}
      <div className="bg-white dark:bg-gray-800 px-8 py-6 mb-8 border-b border-purple-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-400 mb-3">
            Bienvenue Professeur {user.firstName} !
          </h1>
          <p className="text-gray-600 dark:text-gray-300 italic">
            "L'éducation est l'arme la plus puissante que vous puissiez utiliser pour changer le monde." - Nelson Mandela
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 pb-8 space-y-8">
        {/* Profile Card */}
        <ProfileCard professor={professor} />

        {/* Compositions Card */}
        {compositions.length > 0 && (
          <CompositionsCard compositions={compositions} />
        )}

        {/* Teachers Network Card */}
        {teachersList.length > 0 && (
          <TeachersCard teachers={teachersList} />
        )}

        {/* Message si pas d'autres enseignants */}
        {teachersList.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm dark:shadow-gray-900/50 border border-purple-200 dark:border-gray-700 text-center">
            <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-4">
              Rencontrez d'autres enseignants
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Aucun autre enseignant inscrit pour le moment. Invitez vos collègues à rejoindre la plateforme !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
