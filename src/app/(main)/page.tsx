// src/app/page.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCourses } from '@/hooks/useCourses';

// Composant pour simuler les étoiles de notation
const StarRating = ({ rating = 5 }: { rating: number }) => (
  <div className="flex text-yellow-400 text-xs">
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </div>
);

// Skeleton loader pour une offre spéciale
const SpecialOfferSkeleton = () => (
  <div className="bg-purple-100 dark:bg-purple-900/20 rounded-xl p-4 flex items-start space-x-4 animate-pulse">
    <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
    <div className="flex-grow space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      </div>
    </div>
  </div>
);

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { courses, loading } = useCourses();

  const specialOffers = useMemo(() => {
    return courses.slice(0, 3).map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description || course.category || "Cours de qualité",
      image: course.image ? course.image : "/images/Capture.png",
      views: course?.views || 0,
      likes: course?.likes || 0,
      downloads: course?.downloads || 0,
      author: {
        name: course.author?.name || "Auteur inconnu",
        image: course.author?.image ? course.author.image : "/images/prof.jpeg",
        designation: course.author?.designation || "Enseignant"
      },
      rating: 5,
      link: `/courses/${course.id}`,
    }));
  }, [courses]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800 pt-16 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900 pt-10 pb-20 overflow-hidden border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">Créez vos cours</span>
                <span className="block text-purple-600 dark:text-purple-400">facilement et partagez</span>
                <span className="block">vos connaissances</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Notre plateforme vous permet de créer, organiser et partager vos contenus pédagogiques de manière intuitive.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row sm:justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/demo"
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 md:py-4 md:text-lg md:px-10 transition-colors shadow-md"
                >
                  Voir démo
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-purple-600 dark:border-purple-400 text-base font-medium rounded-lg text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-sm"
                >
                  S'inscrire
                </Link>
              </div>
            </div>

            <div className="mt-12 lg:mt-0 w-full  rounded-xl shadow-lg dark:shadow-gray-900/50 relative">
              {/* Image mode clair */}
              <div className="dark:hidden">
                <Image
                  src="/images/image1.png"
                  alt="acceuil"
                  width={1000}
                  height={1000}
                  className="w-full rounded-xl"
                />
              </div>

              {/* Image mode sombre */}
              <div className="hidden dark:block">
                <Image
                  src="/images/image3.png"
                  alt="acceuil mode sombre"
                  width={1000}
                  height={1000}
                  className="w-full  rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 sm:py-20 lg:py-24 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Une nouvelle façon de créer du contenu pédagogique
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Découvrez les fonctionnalités qui révolutionnent la création de cours en ligne
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
                title: "Éditeur Intuitif",
                description: "Créez du contenu avec notre éditeur WYSIWYG moderne. Mise en forme avancée, insertion d'images et de tableaux en quelques clics."
              },
              {
                icon: <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
                title: "Contenu Modulaire",
                description: "Structurez vos cours en granules réutilisables. Assemblez et réorganisez votre contenu comme des blocs de construction."
              },
              {
                icon: <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
                title: "Collaboration",
                description: "Travaillez en équipe sur vos cours. Partagez vos granules et collaborez avec d'autres enseignants."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 hover:shadow-xl dark:hover:shadow-gray-900/70 transition-all duration-300 border-8 border-purple-100 dark:border-purple-900/30">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-16 bg-white dark:bg-gray-900 sm:py-20 lg:py-24 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl text-center mb-12">
            Offres Spéciales
          </h2>

          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
            <div className="lg:col-span-1 mb-10 lg:mb-0">
              <Image
                src="/images/image7.jpg"
                alt="acceuil2"
                width={1000}
                height={1000}
                className="w-full h-auto rounded-xl shadow-lg dark:shadow-gray-900/50"
              />
            </div>

            <div className="lg:col-span-1 space-y-4">
              {loading ? (
                <>
                  <SpecialOfferSkeleton />
                  <SpecialOfferSkeleton />
                  <SpecialOfferSkeleton />
                </>
              ) : (
                specialOffers.map((course) => (
                  <div key={course.id} className="bg-purple-100 dark:bg-purple-900/20 rounded-xl p-4 hover:shadow-md transition-all duration-300 flex items-start space-x-4">
                    {/* Image du cours */}
                    <div className="w-24 h-24 flex-shrink-0 relative overflow-hidden rounded-lg">
                      <Image
                        src={course.image ? course.image : '/images/Capture.png'}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-grow">
                      {/* Titre avec lien */}
                      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                        <Link href={course.link} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                          {course.title}
                        </Link>
                      </h3>

                      {/* Contenu / Description */}
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 line-clamp-2">
                        {course.description}
                      </p>

                      {/* Auteur avec avatar et institution */}
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 relative rounded-full overflow-hidden mr-2">
                          <Image
                            src={course.author.image ? course.author.image : '/images/prof.jpeg'}
                            alt={course.author.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{course.author.name}</p>
                          {course.author.designation && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{course.author.designation}</p>
                          )}
                        </div>
                      </div>

                      {/* Étoiles de notation */}
                      <StarRating rating={course.rating} />

                      {/* Stats: Views, Likes, Downloads */}
                      <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <span>{course.views} vues</span>
                        <button className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>{course.likes}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-purple-600 dark:hover:text-purple-400">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>{course.downloads}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div className="text-right mt-4">
                <Link href="/bibliotheque" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium flex items-center justify-end space-x-1 text-sm">
                  <span>Voir plus</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 sm:py-20 lg:py-24 border-b border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl text-center mb-12">
            Témoignages et Avis
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                initials: "MD",
                name: "Marie Anne",
                role: "Enseignante en informatique",
                date: "15 décembre 2024",
                likes: 24,
                comment: "La plateforme a transformé ma façon d'enseigner. L'interface intuitive et les outils de collaboration m'ont permis de créer des cours plus engageants pour mes étudiants."
              },
              {
                initials: "TB",
                name: "Thomas Bernard",
                role: "Professeur universitaire",
                date: "18 décembre 2024",
                likes: 18,
                comment: "Excellent support pédagogique ! La qualité des ressources et la facilité de partage sont remarquables. Je recommande vivement à tous les enseignants."
              },
              {
                initials: "SL",
                name: "Sophie Laurent",
                role: "Formatrice professionnelle",
                date: "20 décembre 2024",
                likes: 31,
                comment: "Un outil indispensable pour la formation moderne. La possibilité de personnaliser les contenus et de suivre la progression des apprenants est particulièrement appréciable."
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-900/50 p-6 border border-gray-100 dark:border-gray-800 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-200 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-4">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">{testimonial.initials}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <StarRating rating={5} />
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                  {testimonial.comment}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                  <span>{testimonial.date}</span>
                  <div className='flex items-center space-x-3'>
                    <span className='flex items-center space-x-1'>
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v5m7 0h-4" /></svg>
                      <span>{testimonial.likes}</span>
                    </span>
                    <button className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      <span>Commenter</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Testimonial CTA */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Partagez votre expérience</h3>
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800 shadow-lg dark:shadow-gray-900/50 max-w-2xl mx-auto">
              <textarea
                placeholder="Écrivez votre commentaire ici..."
                className="w-full h-24 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 transition-colors"
              />
              <button className="mt-4 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white px-8 py-3 rounded-lg transition-colors font-medium shadow-md">
                Publier
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}