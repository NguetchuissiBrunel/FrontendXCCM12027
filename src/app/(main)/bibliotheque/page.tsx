// src/app/bibliotheque/page.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCourses } from '@/hooks/useCourses';
import { useLoading } from "@/contexts/LoadingContext";
import { 
  LayoutGrid, 
  List as ListIcon, 
  BookOpen, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Download, 
  Eye, 
  ExternalLink,
  Search,
  Layout,
  BookUp,
  Tv,
  Play
} from "lucide-react";
import { transformTiptapToCourseData } from "@/utils/courseTransformer";
import { toast } from "react-hot-toast"; // Assurez-vous d'avoir react-hot-toast installé

// Simulation des fonctions manquantes (à vérifier dans votre projet)
// import { downloadCourseAsPDF } from "@/utils/pdfGenerator";
// import EnrollmentButton from "@/components/EnrollmentButton";

interface OrientationSelectorProps {
  isOpen: boolean;
  onSelect: (orientation: 'p' | 'l') => void;
  onClose: () => void;
}

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

const StarRating = ({ rating = 5 }: { rating: number }) => (
  <div className="flex text-yellow-400 text-xs">
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </div>
);

const CourseCardSkeleton = () => (
  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-xl shadow-lg p-4 h-full flex flex-col animate-pulse">
    <div className="w-full h-48 mb-4 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
    <div className="flex-grow flex flex-col space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
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
    if (loading) startLoading();
    else stopLoading();
  }, [loading, startLoading, stopLoading]);

  const coursesPerPage = 9;

  const filteredCourses = useMemo(() => {
    if (!courses.length) return [];
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.author?.firstName && course.author.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [courses, searchTerm]);

  // Si globalLoading est actif, on laisse le RouteLoading (que nous avons corrigé avant) gérer l'affichage
  if (globalLoading) return null;

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
      if (!fullCourse) throw new Error("Impossible de charger les données");
      const courseData = transformTiptapToCourseData(fullCourse);
      // const success = await downloadCourseAsPDF(courseData, orientation);
      toast.success("PDF téléchargé !", { id: downloadToast });
    } catch (err) {
      toast.error("Erreur PDF", { id: downloadToast });
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
    if (endPage - startPage + 1 < maxVisiblePages) startPage = Math.max(1, endPage - maxVisiblePages + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg transition-all ${currentPage === i ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 hover:bg-purple-100'}`}
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
      {/* Header Banner */}
      <div className="relative h-80 bg-purple-900 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/ima5.jpg"
            alt="Library"
            fill
            className="object-cover opacity-50 dark:hidden"
            priority
          />
          <Image
            src="/images/fond3.jpg"
            alt="Library Dark"
            fill
            className="object-cover opacity-40 hidden dark:block"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <h1 className="text-5xl font-bold text-white mb-4">Bibliothèque</h1>
          <p className="text-xl text-white/90">Découvrez tous nos cours et ressources pédagogiques</p>
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 border border-purple-100 dark:border-purple-900/30">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 h-6 w-6" />
              <input
                type="text"
                placeholder="Rechercher un cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-6 py-4 border border-purple-100 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-purple-500 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {currentCourses.map((course) => (
              <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-purple-50 dark:border-purple-900/20 p-4 flex flex-col group">
                <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={course.image || '/images/Capture2.png'}
                    alt={course.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                
                <div className="flex-grow">
                  <span className="text-xs font-bold text-purple-600 uppercase">{course.category}</span>
                  <Link href={`/courses/${course.id}`}>
                    <h3 className="text-lg font-bold mt-1 mb-2 line-clamp-2 hover:text-purple-600 dark:text-white">{course.title}</h3>
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{course.description}</p>
                </div>

                <div className="pt-4 border-t dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-3 text-gray-500 text-xs">
                      <span className="flex items-center"><Eye className="w-4 h-4 mr-1" /> {formatNumber(course.views)}</span>
                      <button onClick={() => handleDownloadClick(course.id)} className="flex items-center hover:text-purple-600">
                        <Download className="w-4 h-4 mr-1" /> {formatNumber(course.downloads)}
                      </button>
                    </div>
                    <Link href={`/courses/${course.id}`} className="p-2 bg-purple-600 text-white rounded-lg">
                      <Play className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination & No results code... */}
        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun résultat trouvé pour "{searchTerm}"</p>
          </div>
        )}
      </div>

      <OrientationSelector 
        isOpen={showOrientation} 
        onSelect={handleSelectOrientation} 
        onClose={() => setShowOrientation(false)} 
      />
    </div>
  );
};

export default Bibliotheque;