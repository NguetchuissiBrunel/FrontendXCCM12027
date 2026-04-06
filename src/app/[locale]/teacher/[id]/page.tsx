'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { BookOpen, Users, GraduationCap, MapPin, Building2, Award, Heart, Eye, Download, LayoutTemplate, ChevronRight, BookUp } from 'lucide-react';
import { useLoading } from '@/contexts/LoadingContext';
import { CourseControllerService } from '@/lib/services/CourseControllerService';
import { GestionDesUtilisateursService } from '@/lib/services/GestionDesUtilisateursService';
import { CourseClassService } from '@/lib/services/CourseClassService';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import EnrollmentButton from '@/components/EnrollmentButton';

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
}

interface CourseClass {
  id: number;
  name: string;
  theme?: string;
  description?: string;
  coverImage?: string;
  status?: 'OPEN' | 'CLOSED' | 'ARCHIVED';
  maxStudents?: number;
  studentCount?: number;
  teacher?: {
    id: string;
    name: string;
  };
  courses?: Course[];
}

interface TeacherStats {
  totalClasses: number;
  totalCourses: number;
  totalStudents: number;
}

export default function TeacherProfilePage() {
  const t = useTranslations('teacherProfile');
  const params = useParams();
  const router = useRouter();
  const teacherId = params?.id as string;
  const { startLoading, stopLoading } = useLoading();
  const { loading: authLoading } = useAuth();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [courseClasses, setCourseClasses] = useState<CourseClass[]>([]);
  const [standaloneCourses, setStandaloneCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalCourses: 0,
    totalStudents: 0
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

      // 1. Charger les infos de l'enseignant
      const teacherResponse = await GestionDesUtilisateursService.getTeacherById1(teacherId);

      if (!teacherResponse.success || !teacherResponse.data) {
        throw new Error(t('notFoundTitle'));
      }

      const teacherData = teacherResponse.data as Teacher;
      setTeacher(teacherData);

      // 2. Charger et filtrer les classes (comparaison robuste)
      const classesResponse = await CourseClassService.getAllOpenClasses();
      let filteredClasses: CourseClass[] = [];
      let totalStudents = 0;

      if (classesResponse.data && Array.isArray(classesResponse.data)) {
        filteredClasses = (classesResponse.data as any[]).filter(c => {
          const classTeacherId = c.teacher?.id || c.teacherId;
          return String(classTeacherId) === String(teacherId);
        });
        totalStudents = filteredClasses.reduce((acc, cls) => acc + (cls.studentCount || 0), 0);
      }
      setCourseClasses(filteredClasses);

      // 3. Charger et filtrer les cours (comparaison robuste)
      // On utilise getAllCourses pour plus de fiabilité si getAuthorCourses échoue ou est incomplet
      const coursesResponse = await CourseControllerService.getAllCourses();
      let authorCourses: any[] = [];

      if (coursesResponse.success && Array.isArray(coursesResponse.data)) {
        authorCourses = (coursesResponse.data as any[]).filter(c => {
          const courseAuthorId = c.author?.id || c.authorId;
          return String(courseAuthorId) === String(teacherId) && c.status === 'PUBLISHED';
        });
      }

      // Identifier les cours qui ne sont pas dans une classe filtrée
      const coursesInClassesIds = new Set(filteredClasses.flatMap(cls => cls.courses?.map(c => c.id) || []));
      const publishedStandalone = authorCourses.filter(c => !coursesInClassesIds.has(c.id));

      setStandaloneCourses(publishedStandalone);
      setStats({
        totalClasses: filteredClasses.length,
        totalCourses: authorCourses.length,
        totalStudents: totalStudents
      });

    } catch (err: any) {
      console.error('❌ Erreur chargement profil enseignant:', err);
      setError(err.message || t('loadError'));
      toast.error(t('loadErrorToast'));
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
            {t('notFoundTitle')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || t('notFoundDescription')}
          </p>
          <button
            onClick={() => router.push('/bibliotheque')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors font-semibold"
          >
            {t('backToLibrary')}
          </button>
        </div>
      </div>
    );
  }

  const displayName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || t('teacherFallbackName');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="grow pt-16">
        {/* Header Banner */}
        <div className="relative h-64 bg-purple-900 overflow-hidden">
          <div className="absolute inset-0">
            <Image src="/images/ima5.jpg" alt="Biblio" fill className="object-cover opacity-30 mix-blend-overlay dark:opacity-20" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent" />
          </div>
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-8">
            <div className="flex items-end gap-6">
              {/* Photo de profil */}
              <div className="relative w-36 h-36 rounded-2xl border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden bg-white mb-[-40px]">
                <Image
                  src={teacher.photoUrl || '/images/prof.jpeg'}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Infos principales */}
              <div className="text-white pb-2 flex-grow">
                <h1 className="text-4xl font-black mb-2 drop-shadow-md">{displayName}</h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    <GraduationCap className="w-4 h-4" />
                    <span>{teacher.grade || t('expertTeacher')}</span>
                  </div>
                  {teacher.certification && (
                    <div className="flex items-center gap-2 bg-purple-500/40 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                      <Award className="w-4 h-4" />
                      <span>{teacher.certification}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">

            {/* Colonne gauche : Infos et stats */}
            <div className="lg:col-span-1 space-y-6">
              {/* Informations */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  {t('about')}
                </h2>

                <div className="space-y-5">
                  {teacher.university && (
                    <div className="flex gap-4">
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-xl h-fit">
                        <Building2 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">{t('university')}</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {teacher.university}
                        </p>
                      </div>
                    </div>
                  )}

                  {teacher.city && (
                    <div className="flex gap-4">
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-2.5 rounded-xl h-fit">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">{t('location')}</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {teacher.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {teacher.subjects && teacher.subjects.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-3">{t('expertiseDomains')}</p>
                      <div className="flex flex-wrap gap-2">
                        {teacher.subjects.map((subject, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-800/40 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold border border-purple-200/50 dark:border-purple-700/50 shadow-sm"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistiques globables */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-purple-100 dark:border-purple-900/30">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <Award className="w-5 h-5 text-purple-600" />
                  {t('academicImpact')}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30 text-center flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300">
                    <div className="mx-auto bg-white dark:bg-gray-800 w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <LayoutTemplate className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">
                      {stats.totalClasses}
                    </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-wider">
                          {t('stats.classes')}
                        </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-100 dark:border-purple-900/30 text-center flex flex-col justify-center transition-transform hover:-translate-y-1 duration-300">
                    <div className="mx-auto bg-white dark:bg-gray-800 w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <BookUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="text-3xl font-black text-gray-900 dark:text-white">
                      {stats.totalCourses}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1 uppercase tracking-wider">
                      {t('stats.courses')}
                    </div>
                  </div>

                  <div className="col-span-2 bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 border border-green-100 dark:border-green-900/30 flex items-center justify-between transition-transform hover:-translate-y-1 duration-300 px-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-white dark:bg-gray-800 w-12 h-12 rounded-full flex items-center justify-center shadow-sm">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-left">
                        <div className="text-2xl font-black text-gray-900 dark:text-white">
                          {stats.totalStudents}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                          {t('stats.students')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne principale : Classes de cours */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <LayoutTemplate className="w-8 h-8 text-purple-600" />
                  {t('classSectionsTitle')}
                </h2>
                <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-4 py-1.5 rounded-full font-bold text-sm">
                  {t('classesCount', { count: courseClasses.length })}
                </span>
              </div>

              {courseClasses.length === 0 ? (
                <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                    <LayoutTemplate className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {t('noClassTitle')}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {t('noClassDescription')}
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  {courseClasses.map((cls) => (
                    <div key={cls.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-purple-100 dark:border-purple-900/30 overflow-hidden group hover:shadow-xl transition-all duration-300">

                      {/* En-tête de la classe */}
                      <div className="relative h-48 overflow-hidden bg-purple-900">
                        <Image
                          src={cls.coverImage || '/images/Capture2.png'}
                          alt={cls.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="bg-white/95 backdrop-blur-sm text-purple-700 text-xs font-black px-3 py-1.5 rounded-xl uppercase shadow-sm tracking-wider">
                            {cls.theme || t('generalTheme')}
                          </span>
                          {cls.status === 'OPEN' && (
                            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl uppercase shadow-sm flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              {t('statusOpen')}
                            </span>
                          )}
                        </div>

                        <div className="absolute top-4 right-4">
                          <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-xl text-sm font-medium flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {cls.studentCount || 0} / {cls.maxStudents || '∞'}
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-2xl font-black text-white mb-2 drop-shadow-md">
                            {cls.name}
                          </h3>
                          {cls.description && (
                            <p className="text-gray-300 text-sm line-clamp-2 max-w-2xl font-medium">
                              {cls.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Contenu de la classe : Les Cours */}
                      <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-500" />
                            {t('includedCourses', { count: cls.courses?.length || 0 })}
                          </h4>

                          {/* Bouton d'inscription à l'entièreté de la classe */}
                          <EnrollmentButton
                            courseId={cls.id} // TODO: Change prop if EnrollmentButton changes to support classes distinctively
                            size="sm"
                            variant="primary"
                            fullWidth={false}
                          />
                        </div>

                        {(!cls.courses || cls.courses.length === 0) ? (
                          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 text-sm">{t('noClassCourse')}</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cls.courses.map((course) => (
                              <div
                                key={course.id}
                                onClick={() => handleCourseClick(course.id)}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 cursor-pointer group/course transition-all hover:border-purple-300 dark:hover:border-purple-500/50 flex gap-4"
                              >
                                {/* Miniature du cours */}
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                                  <Image
                                    src={course.photoUrl || course.image || '/images/Capture2.png'}
                                    alt={course.title}
                                    fill
                                    className="object-cover group-hover/course:scale-110 transition-transform duration-500"
                                  />
                                </div>

                                <div className="flex flex-col flex-grow justify-center min-w-0">
                                  <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover/course:text-purple-600 transition-colors">
                                    {course.title}
                                  </h5>
                                  <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-auto">
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      {formatNumber(course.viewCount)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Heart className="w-3 h-3 text-red-400" />
                                      {formatNumber(course.likeCount)}
                                    </span>
                                    {course.category && (
                                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md font-medium truncate ml-auto">
                                        {course.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {/* Section Cours Individuels (hors classes) */}
              {standaloneCourses.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                      <BookOpen className="w-8 h-8 text-indigo-600" />
                      {t('freeCoursesTitle')}
                    </h2>
                    <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-4 py-1.5 rounded-full font-bold text-sm">
                      {t('freeCoursesCount', { count: standaloneCourses.length })}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                    {t('freeCoursesDescription')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {standaloneCourses.map((course) => (
                      <div
                        key={`standalone-${course.id}`}
                        onClick={() => handleCourseClick(course.id)}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-indigo-100 dark:border-indigo-900/30 cursor-pointer group hover:shadow-lg hover:border-indigo-300 transition-all duration-300 overflow-hidden flex gap-4 p-4"
                      >
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                          <Image
                            src={course.photoUrl || course.image || '/images/Capture2.png'}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col justify-center flex-grow min-w-0">
                          <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {course.title}
                          </h5>
                          {course.category && (
                            <span className="text-xs px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md font-medium inline-block mb-2">
                              {course.category}
                            </span>
                          )}
                          <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatNumber(course.viewCount)}</span>
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" />{formatNumber(course.likeCount)}</span>
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{formatNumber(course.downloadCount)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-indigo-400 self-center flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
