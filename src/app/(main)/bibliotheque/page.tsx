"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCourses } from '@/hooks/useCourses';
import { useLoading } from "@/contexts/LoadingContext";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Heart,
  Download,
  Eye,
  Users,
  Filter,
  BookUp,
  Tv,
  Play,
  Share2,
  Layout,
  X
} from "lucide-react";
import { transformTiptapToCourseData } from "@/utils/courseTransformer";
import { toast } from "react-hot-toast";
import EnrollmentButton from '@/components/EnrollmentButton';
import confetti from 'canvas-confetti';
import TeacherLink from '@/components/TeacherLink';

// --- COMPOSANTS AUXILIAIRES ---

interface OrientationSelectorProps {
  isOpen: boolean;
  onSelect: (orientation: 'p' | 'l') => void;
  onClose: () => void;
}

const OrientationSelector: React.FC<OrientationSelectorProps> = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-md w-full border border-purple-100 dark:border-purple-900/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <Layout className="h-6 w-6 mr-2 text-purple-600" />
            Orientation du PDF
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Comment souhaitez-vous mettre en page votre document pour l'exportation ?
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => onSelect('p')}
            className="p-4 border-2 border-purple-50 dark:border-purple-900/20 rounded-xl hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all flex flex-col items-center group"
          >
            <div className="w-12 h-16 border-2 border-purple-200 dark:border-purple-700 rounded mb-2 flex items-center justify-center group-hover:border-purple-400">
              <BookUp className="text-purple-400 group-hover:text-purple-600" />
            </div>
            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Portrait</span>
          </button>
          <button
            onClick={() => onSelect('l')}
            className="p-4 border-2 border-purple-50 dark:border-purple-900/20 rounded-xl hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all flex flex-col items-center group"
          >
            <div className="w-16 h-12 border-2 border-purple-200 dark:border-purple-700 rounded mb-2 flex items-center justify-center group-hover:border-purple-400">
              <Tv className="text-purple-400 group-hover:text-purple-600" />
            </div>
            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">Paysage</span>
          </button>
        </div>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-500 hover:text-gray-800 dark:hover:text-white font-medium transition-colors">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

const StarRating = ({ rating = 5 }: { rating: number }) => (
  <div className="flex text-yellow-400 text-xs">
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </div>
);

// --- COMPOSANT PRINCIPAL ---

const Bibliotheque = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { courses, loading, error, fetchCourse, incrementLike, decrementLike, incrementDownload } = useCourses();
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [showOrientation, setShowOrientation] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  // Redirection si non authentifié
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Veuillez vous connecter pour accéder à la bibliothèque");
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (loading) {
      startLoading();
    } else {
      setTimeout(() => stopLoading(), 500);
    }
  }, [loading, startLoading, stopLoading]);

  const coursesPerPage = 9;

  const filteredCourses = useMemo(() => {
    if (!courses.length) return [];

    let filtered = courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.author?.name && course.author.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (showFavorites) {
      filtered = filtered.filter(course => course.isLiked);
    }

    return filtered;
  }, [courses, searchTerm, showFavorites]);

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const currentCourses = filteredCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLike = async (courseId: number) => {
    try {
      const course = courses.find(c => c.id === courseId);
      const isCurrentlyLiked = course?.isLiked || false;

      if (isCurrentlyLiked) {
        await decrementLike(courseId);
        toast("Cours retiré de vos favoris", {
          icon: '💔',
          style: {
            background: '#fef3c7',
            color: '#92400e',
          },
        });
      } else {
        await incrementLike(courseId);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#8B5CF6', '#EC4899', '#3B82F6']
        });
        toast.success("Cours ajouté à vos favoris !");
      }
    } catch (err) {
      toast.error("Impossible de mettre à jour le like");
    }
  };

  const handleDownloadClick = (id: number) => {
    setSelectedCourseId(id);
    setShowOrientation(true);
  };

  const handleSelectOrientation = async (orientation: 'p' | 'l') => {
    if (!selectedCourseId) return;
    setShowOrientation(false);
    const downloadToast = toast.loading("Génération de votre ressource...");
    try {
      await incrementDownload(selectedCourseId);
      const fullCourse = await fetchCourse(selectedCourseId);
      if (!fullCourse) throw new Error("Données introuvables");
      const courseData = transformTiptapToCourseData(fullCourse);
      // await downloadCourseAsPDF(courseData, orientation); 
      toast.success("Document prêt !", { id: downloadToast });
    } catch (err) {
      toast.error("Échec du téléchargement", { id: downloadToast });
    } finally {
      setSelectedCourseId(null);
    }
  };

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    return num > 999 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
        <div className="relative mb-12">
          {/* Anneau de chargement principal */}
          <div className="w-24 h-24 border-4 border-purple-200 dark:border-purple-900/30 rounded-full" />
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />

          {/* Deuxième anneau pour un effet complexe */}
          <div className="absolute top-2 left-2 w-20 h-20 border-4 border-blue-500/20 rounded-full" />
          <div className="absolute top-2 left-2 w-20 h-20 border-4 border-blue-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />

          {/* Logo ou icône centrale */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
        </div>

        {/* Texte avec animation */}
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
              Chargement de votre contenu
            </h3>
            <div className="flex justify-center space-x-1.5">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">
            Veuillez patienter un instant...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16">
      <div className="relative h-80 bg-purple-900 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/ima5.jpg" alt="Biblio" fill className="object-cover opacity-50 dark:hidden" priority />
          <Image src="/images/fond3.jpg" alt="Biblio Dark" fill className="object-cover opacity-40 hidden dark:block" priority />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">Bibliothèque</h1>
          <p className="text-xl text-white/90 max-w-2xl drop-shadow">
            Accédez à l'intégralité de nos cours et supports pédagogiques
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-purple-100 dark:border-purple-900/30">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 h-6 w-6" />
              <input
                type="text"
                placeholder="Rechercher un cours, un auteur, une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 border border-purple-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-all shadow-inner"
              />
            </div>
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center justify-center px-6 py-4 rounded-2xl font-medium transition-all ${showFavorites
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              <Heart className={`w-5 h-5 mr-2 ${showFavorites ? 'fill-current' : ''}`} />
              {showFavorites ? 'Tous les cours' : 'Mes favoris'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-700 p-4 rounded-xl mb-8 flex items-center">
            <span>{error}</span>
          </div>
        )}

        {showFavorites && (
          <div className="mb-8 flex items-center justify-between bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
            <div className="flex items-center">
              <Heart className="w-5 h-5 text-red-500 mr-3 fill-current" />
              <span className="text-red-700 dark:text-red-300 font-medium">
                Affichage de vos cours favoris
              </span>
            </div>
            <button
              onClick={() => setShowFavorites(false)}
              className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              × Effacer le filtre
            </button>
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-purple-100 dark:border-purple-900/20 backdrop-blur-sm">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-100 to-white dark:from-gray-800 dark:to-gray-700 w-24 h-24 rounded-full flex items-center justify-center shadow-xl">
                <Search className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-red-100 dark:bg-red-900/30 p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800">
                <X className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">{showFavorites ? "Aucun favori" : "Oups ! Rien n'a été trouvé"}</h3>
            <p className="max-w-md text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
              {showFavorites
                ? "Vous n'avez pas encore ajouté de cours à vos favoris. Cliquez sur les cœurs pour en ajouter !"
                : "Nous n'avons trouvé aucun cours correspondant à vos critères actuels. Essayez de réinitialiser les filtres ou de modifier votre recherche."
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setShowFavorites(false);
              }}
              className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-purple-500/25 active:scale-95"
            >
              Réinitialiser la recherche
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {!loading && currentCourses.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 border border-purple-50 dark:border-purple-900/20 flex flex-col overflow-hidden group">
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={course.photoUrl || course.image || '/images/Capture2.png'}
                  alt={course.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-purple-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-sm">
                    {course.category || 'Formation'}
                  </span>
                </div>
                {course.isLiked && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-sm flex items-center">
                      <Heart className="w-3 h-3 mr-1 fill-current" />
                      Favori
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <Link href={`/courses/${course.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-purple-600 transition-colors leading-tight">
                    {course.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
                  {course.description}
                </p>
                <div className="mb-4">
                  <TeacherLink
                    teacherId={course.author?.id || ''}
                    teacherName={course.author?.name || 'Auteur inconnu'}
                    teacherPhoto={course.author?.image}
                    showAvatar={true}
                  />
                  <div className="mt-1 ml-10">
                    <StarRating rating={5} />
                  </div>
                </div>

                <div className="flex justify-between items-center px-1 py-3 border-t border-gray-100 dark:border-gray-700 mb-4">
                  <div className="flex items-center text-gray-500 text-xs gap-4">
                    <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {formatNumber(course.viewCount)}</span>
                    <button
                      onClick={() => handleToggleLike(course.id)}
                      className={`flex items-center gap-1.5 transition-colors ${course.isLiked
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-gray-500 hover:text-red-500'
                        }`}
                    >
                      {course.isLiked ? (
                        <Heart className="w-4 h-4 fill-current" strokeWidth={1.5} />
                      ) : (
                        <Heart className="w-4 h-4" strokeWidth={1.5} />
                      )}
                      {formatNumber(course.likeCount)}
                    </button>
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {formatNumber(course.followersCount)}</span>
                    <button
                      onClick={() => handleDownloadClick(course.id)}
                      className="flex items-center gap-1.5 hover:text-purple-600 transition-colors"
                    >
                      <Download className="w-4 h-4" /> {formatNumber(course.downloadCount)}
                    </button>
                  </div>
                </div>
                <div className="mt-auto">
                  <EnrollmentButton
                    courseId={course.id}
                    size="md"
                    variant="primary"
                    fullWidth
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border disabled:opacity-30 hover:bg-purple-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage === i + 1
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-purple-50'
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border disabled:opacity-30 hover:bg-purple-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        <OrientationSelector
          isOpen={showOrientation}
          onSelect={handleSelectOrientation}
          onClose={() => setShowOrientation(false)}
        />
      </div>
    </div>
  );
};

export default Bibliotheque;
