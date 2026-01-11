// src/app/bibliotheque/page.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { useCourses } from '@/hooks/useCourses';
import { useLoading } from "@/contexts/LoadingContext";
import CourseDetails from "@/components/CourseDetails";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";
import SearchBar from "@/components/SearchBar";
import { LayoutGrid, List as ListIcon, BookOpen, Clock, ChevronLeft, ChevronRight, Filter, Download, Eye, ExternalLink } from "lucide-react";
import { CourseControllerService } from "@/lib/services/CourseControllerService";
import { transformTiptapToCourseData } from "@/utils/courseTransformer";

const OrientationSelector: React.FC<OrientationSelectorProps> = ({ isOpen, onSelect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 border border-purple-100 dark:border-purple-900/30">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <Layout className="h-6 w-6 mr-2 text-purple-600" />
          Orientation du PDF
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
          Choisissez comment vous souhaitez mettre en page votre document.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => onSelect('p')}
            className="p-4 border-2 border-purple-100 dark:border-purple-900/20 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-600 dark:hover:border-purple-600 transition-all flex flex-col items-center group"
          >
            <div className="w-16 h-20 border-2 border-purple-200 dark:border-purple-800 rounded-md mb-3 flex items-center justify-center group-hover:border-purple-400">
              <BookUp className="h-8 w-8 text-purple-400 group-hover:text-purple-600" />
            </div>
            <span className="font-bold text-gray-700 dark:text-gray-300">Portrait</span>
          </button>

          <button
            onClick={() => onSelect('l')}
            className="p-4 border-2 border-purple-100 dark:border-purple-900/20 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-600 dark:hover:border-purple-600 transition-all flex flex-col items-center group"
          >
            <div className="w-20 h-16 border-2 border-purple-200 dark:border-purple-800 rounded-md mb-3 flex items-center justify-center group-hover:border-purple-400">
              <Tv className="h-8 w-8 text-purple-400 group-hover:text-purple-600" />
            </div>
            <span className="font-bold text-gray-700 dark:text-gray-300">Paysage</span>
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant pour les étoiles de notation
const StarRating = ({ rating = 5 }: { rating: number }) => (
  <div className="flex text-yellow-400 text-xs">
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </div>
);

// Skeleton loader pour les cours
const CourseCardSkeleton = () => (
  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-xl shadow-lg p-4 h-full flex flex-col animate-pulse">
    <div className="w-full h-48 mb-4 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
    <div className="flex-grow flex flex-col space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
    </div>
  </div>
);

const Bibliotheque = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { courses, loading, error, fetchCourse } = useCourses();
  const { isLoading: globalLoading, startLoading, stopLoading } = useLoading();
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showOrientation, setShowOrientation] = useState(false);

  useEffect(() => {
    if (loading) {
      startLoading();
    } else {
      stopLoading();
    }
  }, [loading, startLoading, stopLoading]);

  const coursesPerPage = 9;

  // Filtrer les cours basé sur la recherche
  const filteredCourses = useMemo(() => {
    if (!courses.length) return [];

    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.author?.firstName && course.author.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [courses, searchTerm]);

  if (loading || globalLoading) {
    return null;
  }

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, startIndex + coursesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadClick = (id: number) => {
    setSelectedCourseId(id);
    setShowOrientation(true);
  };

  const handleSelectOrientation = async (orientation: 'p' | 'l') => {
    if (!selectedCourseId) return;

    setShowOrientation(false);
    setIsDownloading(true);
    const downloadToast = toast.loading("Génération du PDF en cours...");

    try {
      const fullCourse = await fetchCourse(selectedCourseId);
      if (!fullCourse) throw new Error("Impossible de charger les données du cours");

      const courseData = transformTiptapToCourseData(fullCourse);
      const success = await downloadCourseAsPDF(courseData, orientation);

      if (success) {
        toast.success("PDF téléchargé avec succès !", { id: downloadToast });
      } else {
        throw new Error("Erreur lors de la génération du PDF");
      }
    } catch (err) {
      console.error(err);
      toast.error("Échec du téléchargement du PDF.", { id: downloadToast });
    } finally {
      setIsDownloading(false);
      setSelectedCourseId(null);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg transition-all ${currentPage === i
            ? 'bg-purple-600 text-white shadow-lg'
            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
            }`}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return '0';
    return num > 999 ? (num / 1000).toFixed(1) + 'k' : num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16">
      {/* Bannière d'en-tête */}
      <div className="relative h-80 bg-gradient-to-r from-purple-900 to-purple-600 overflow-hidden">

        {/* Conteneur d'image avec position absolute */}
        <div className="absolute inset-0">
          {/* Image mode clair */}
          <div className="dark:hidden h-full">
            <Image
              src="/images/ima5.jpg"
              alt="bibliotheque clair"
              fill
              className="object-cover w-full h-full"
              priority
            />
          </div>

          {/* Image mode sombre */}
          <div className="hidden dark:block h-full">
            <Image
              src="/images/fond3.jpg"
              alt="bibliotheque mode sombre"
              fill
              className="object-cover w-full h-full"
              priority
            />
          </div>

          {/* Overlay pour améliorer la lisibilité du texte */}
          <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
        </div>

        {/* Contenu au-dessus de l'image */}
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">Bibliothèque</h1>
          <p className="text-xl text-white/90 mb-8 drop-shadow">
            Découvrez tous nos cours et ressources pédagogiques
          </p>
        </div>
      </div>


      {/* Barre de recherche*/}
      <div className="container mx-auto px-4  -mt-8 relative z-20">
        <div className="bg-purple-100 dark:bg-purple-900 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-2xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-600 h-6 w-6" />
                <input
                  type="text"
                  placeholder="Rechercher un cours, une catégorie, un auteur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-12 pr-6 py-4 border border-purple-200 dark:border-purple-900/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg mb-6">
            <p className="font-semibold">Erreur de chargement</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Skeleton loader pendant le chargement */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(9)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Grille des cours */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentCourses.map((course) => (
              <div
                key={course.id}
                className="bg-purple-100 dark:bg-purple-900/20 rounded-xl shadow-lg dark:shadow-gray-900/50 p-4 hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 border border-purple-200 dark:border-purple-900/30 h-full flex flex-col group"
              >
                {/* Image du cours */}
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={course.image ? course.image : '/images/Capture2.png'}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="flex-grow flex flex-col">
                  {/* Catégorie */}
                  {course.category && (
                    <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wide">
                      {course.category}
                    </span>
                  )}

                  {/* Titre avec lien */}
                  <Link href={`/courses/${course.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      {course.title}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-grow">
                    {course.description}
                  </p>

                  {/* Auteur */}
                  <div className="flex items-center mb-3">
                    <div className="relative w-8 h-8 mr-3">
                      <Image
                        alt=""
                        src={course.author?.image ? course.author?.image : '/images/prof.jpeg'}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {course.author?.lastName}
                      </p>
                      {course.author?.designation && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {course.author.designation}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Étoiles de notation */}
                  <div className="mb-3">
                    <StarRating rating={5} />
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{formatNumber(course.views)}</span>
                      </span>

                      <button className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{formatNumber(course.likes)}</span>
                      </button>

                      <button
                        onClick={() => handleDownloadClick(course.id)}
                        disabled={isDownloading && selectedCourseId === course.id}
                        className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors disabled:opacity-50"
                      >
                        <DownloadIcon className={`w-4 h-4 ${isDownloading && selectedCourseId === course.id ? 'animate-bounce' : ''}`} />
                        <span>{formatNumber(course.downloads)}</span>
                      </button>
                    </div>

                    <div className="mt-4 pt-3 flex gap-2 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href={`/courses/${course.id}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                      >
                        <Play className="w-4 h-4" /> Lire
                      </Link>
                      <div className="flex-1">
                        <EnrollmentButton
                          courseId={course.id}
                          size="sm"
                          variant="primary"
                          fullWidth
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <OrientationSelector
          isOpen={showOrientation}
          onSelect={handleSelectOrientation}
          onClose={() => {
            setShowOrientation(false);
            setSelectedCourseId(null);
          }}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} sur {totalPages} • {filteredCourses.length} cours
            </div>
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {renderPagination()}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Message si aucun résultat */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-20 w-20 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-3">
              Aucun cours trouvé
            </h3>
            <p className="text-gray-500 dark:text-gray-500 text-lg">
              Essayez de modifier vos critères de recherche
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bibliotheque;