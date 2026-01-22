'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { BookOpen, Users, GraduationCap, MapPin, Building2, Award, Heart, Eye, Download } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { GestionDesUtilisateursService } from '@/lib/services/GestionDesUtilisateursService';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface Teacher {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  photoUrl?: string;
  city?: string;
  university?: string;
  grade?: string;
  certification?: string;
  subjects?: string[];
  activities?: string[];
}

interface Course {
  id: number;
  title: string;
  description?: string;
  category?: string;
  photoUrl?: string;
  image?: string;
  viewCount?: number;
  likeCount?: number;
  downloadCount?: number;
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  author?: {
    id?: string;
    name?: string;
  };
}

interface TeacherStats {
  totalCourses: number;
  totalStudents: number;
  publishedCourses: number;
}

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const teacherId = params.id as string;
  const { startLoading, stopLoading } = useLoading();
  const { loading: authLoading } = useAuth();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalCourses: 0,
    totalStudents: 0,
    publishedCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && teacherId) {
      loadTeacherData();
    }
  }, [teacherId, authLoading]);

  useEffect(() => {
    if (loading) startLoading();
    else stopLoading();
  }, [loading, startLoading, stopLoading]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Chargement du profil enseignant:', teacherId);

      // Charger les infos de l'enseignant via GestionDesUtilisateursService
      // On utilise l'ID direct maintenant car on a attendu la restauration du token
      const teacherResponse = await GestionDesUtilisateursService.getTeacherById1(teacherId);

      if (!teacherResponse.success || !teacherResponse.data) {
        throw new Error('Enseignant non trouvé');
      }

      const teacherData = teacherResponse.data;
      console.log('✅ Données enseignant récupérées:', teacherData);

      setTeacher(teacherData as Teacher);

      // Charger les cours de l'enseignant via CourseControllerService
      // Utilisation de getAllCourses + filtrage car getAuthorCourses retourne 403
      const coursesResponse = await CourseControllerService.getAllCourses();

      if (coursesResponse.data) {
        let allCourses = coursesResponse.data as Course[];
        console.log(`📚 Total cours récupérés: ${allCourses.length}`);

        // Filtrer pour ne garder que les cours de cet enseignant
        allCourses = allCourses.filter(course => course.author?.id === teacherId);
        console.log(`👤 Cours de cet enseignant: ${allCourses.length}`);

        setCourses(allCourses);

        // Calculer les statistiques
        const publishedCourses = allCourses.filter(
          (c: Course) => c.status === 'PUBLISHED'
        );

        setStats({
          totalCourses: allCourses.length,
          publishedCourses: publishedCourses.length,
          totalStudents: 0 // À calculer avec EnrollmentService si nécessaire
        });

        console.log('📈 Statistiques calculées:', {
          totalCourses: allCourses.length,
          publishedCourses: publishedCourses.length
        });
      } else {
        console.log('⚠️ Aucun cours trouvé');
        setCourses([]);
      }

    } catch (err: any) {
      console.error('❌ Erreur chargement profil enseignant:', err);
      setError(err.message || 'Impossible de charger le profil');
      toast.error('Erreur de chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    return num > 999 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  };

  if (loading) {
    return null; // Le LoadingProvider gère l'affichage
  }

  if (error || !teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center pt-16">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md border border-red-100 dark:border-red-900/30">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Enseignant non trouvé
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "Cet enseignant n'existe pas ou a été supprimé"}
          </p>
          <button
            onClick={() => router.push('/bibliotheque')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
          >
            Retour à la bibliothèque
          </button>
        </div>
      </div>
    );
  }

  const displayName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'Enseignant';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="grow pt-16">
        {/* Header Banner */}
        <div className="relative h-48 bg-gradient-to-r from-purple-600 to-purple-800 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
            <div className="flex items-center gap-6">
              {/* Photo de profil */}
              <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-white">
                <Image
                  src={teacher.photoUrl || '/images/prof.jpeg'}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Infos principales */}
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{displayName}</h1>
                <div className="flex items-center gap-2 text-white/90 mb-2">
                  <GraduationCap className="w-5 h-5" />
                  <span className="text-lg">{teacher.grade || 'Enseignant'}</span>
                </div>
                {teacher.certification && (
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Award className="w-4 h-4" />
                    <span>{teacher.certification}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Informations et Statistiques */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8 border border-purple-100 dark:border-purple-900/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Informations */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                  Informations
                </h2>

                <div className="space-y-4">
                  {teacher.university && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Université</p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {teacher.university}
                        </p>
                      </div>
                    </div>
                  )}

                  {teacher.city && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ville</p>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {teacher.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-purple-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Spécialités</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {teacher.subjects.map((subject, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistiques */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  Statistiques
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-900/30">
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 text-center">
                      {stats.publishedCourses}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                      Cours publiés
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-900/30">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 text-center">
                      {stats.totalCourses}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                      Total de cours
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des cours */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Cours de {teacher.firstName} ({courses.length})
              </h2>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <BookOpen className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Aucun cours publié
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  Cet enseignant n'a pas encore publié de cours.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => handleCourseClick(course.id)}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-purple-50 dark:border-purple-900/20 flex flex-col overflow-hidden group cursor-pointer"
                  >
                    {/* Image du cours */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={course.photoUrl || course.image || '/images/Capture2.png'}
                        alt={course.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {course.status && (
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${course.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                            }`}>
                            {course.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-purple-600 dark:text-purple-400 text-xs font-bold px-3 py-1 rounded-full uppercase shadow-sm">
                          {course.category || 'Formation'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-grow">
                      {/* Titre */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-purple-600 transition-colors leading-tight">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-grow">
                        {course.description || 'Aucune description disponible'}
                      </p>

                      {/* Statistiques */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 text-xs">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {formatNumber(course.viewCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {formatNumber(course.likeCount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4" />
                            {formatNumber(course.downloadCount)}
                          </span>
                        </div>
                      </div>

                      {/* Bouton d'accès */}
                      <button
                        className="mt-4 w-full py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCourseClick(course.id);
                        }}
                      >
                        Accéder au cours
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
