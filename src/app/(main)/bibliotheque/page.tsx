// src/app/bibliotheque/page.tsx
"use client";
import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { courses } from '@/data/CourseData';

// Composant pour les étoiles de notation
const StarRating = ({ rating = 5 }: { rating: number }) => (
  <div className="flex text-yellow-400 text-xs">
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </div>
);

const Bibliotheque = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const coursesPerPage = 9;
  
  // Dupliquer les cours pour avoir 9 pages (81 cours au total)
  const allCourses: any[] = [];
  for (let i = 0; i < 9; i++) {
    allCourses.push(...courses.map((course, index) => ({
      ...course,
      id: i * courses.length + index + 1, // IDs uniques
      description: course.sections?.[0]?.chapters?.[0]?.paragraphs?.[0]?.content || course.category || 'Cours de qualité'
    })));
  }

  // Filtrer les cours basé sur la recherche
  const filteredCourses = allCourses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.category && course.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
    course.author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, startIndex + coursesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          className={`px-3 py-1 rounded-lg transition-all ${
            currentPage === i
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

  const formatNumber = (num: number) => {
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
                  className="w-full pl-12 pr-6 py-4 border border-purple-200 dark:border-purple-900/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Grille des cours */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentCourses.map((course) => (
            <div 
              key={course.id} 
              className="bg-purple-100 dark:bg-purple-900/20 rounded-xl shadow-lg dark:shadow-gray-900/50 p-4 hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 border border-purple-200 dark:border-purple-900/30 h-full flex flex-col group"
            >
              {/* Image du cours */}
              <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                <Image
                  src={course.image}
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
                      src={course.author.image}
                      alt={course.author.name}
                      fill
                      className="rounded-full object-cover"
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

                {/* Étoiles de notation */}
                <div className="mb-3">
                  <StarRating rating={5} />
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
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
                  
                  <button className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>{formatNumber(course.downloads)}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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