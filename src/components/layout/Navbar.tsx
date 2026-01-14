// src/components/layout/Navbar.tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { FaUser, FaSignOutAlt, FaEdit, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';
import { MdHelpOutline } from 'react-icons/md';
import { clearAuthToken } from '@/utils/authHelpers';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Charger le thème et les informations utilisateur
  useEffect(() => {
    // Thème
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Utilisateur connecté
    const userData = localStorage.getItem('currentUser');
    const role = localStorage.getItem('userRole');

    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
    if (role === 'student' || role === 'teacher') {
      setUserRole(role);
    }
  }, []);

  // Vérifier si un lien est actif
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');
    localStorage.removeItem('studentInfo');
    localStorage.removeItem('teacherInfo');
    setCurrentUser(null);
    setUserRole(null);
    clearAuthToken();
    window.location.href = '/';
  };

  const handleMyAccount = () => {
    if (userRole === 'student') {
      router.push('/etudashboard');
    } else if (userRole === 'teacher') {
      router.push('/profdashboard');
    }
  };

  // Liens de navigation de base
  const baseNavLinks = [
    {
      href: '/',
      label: 'Accueil',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    },
    {
      href: '/bibliotheque',
      label: 'Bibliothèque',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
    },
  ];

  // Lien "Éditer" seulement pour les enseignants
  const teacherNavLink = {
    href: '/editor',
    label: 'Éditer',
    icon: <FaEdit className="w-5 h-5" />
  };

  // Lien "Aide" pour tous
  const helpNavLink = {
    href: '/aide',
    label: 'Aide',
    icon: <MdHelpOutline className="w-5 h-5" />
  };

  // Construire les liens de navigation selon le rôle
  const getNavLinks = () => {
    const links = [...baseNavLinks];

    // Ajouter "Éditer" seulement pour les enseignants
    if (userRole === 'teacher') {
      links.push(teacherNavLink);
    }

    // Toujours ajouter "Aide"
    links.push(helpNavLink);

    return links;
  };

  const navLinks = getNavLinks();

  if (pathname.startsWith('/admindashboard')) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-xl border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">

        <div className="flex items-center justify-between h-16">

          {/* GROUPE GAUCHE : Logo + Nom */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center relative">
                <Image
                  src="/images/Capture.png"
                  alt="Logo XCCM"
                  width={80}
                  height={80}
                  className="rounded-full object-cover"
                />
              </div>


              <span className="text-lg lg:text-xl font-bold text-gray-800 dark:text-white hidden sm:block">XCCM1</span>
            </Link>
          </div>

          {/* GROUPE CENTRE : Navigation Centrée */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1">
              {navLinks.map((item) => {
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`
                      relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2
                      ${isActive
                        ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <span className={`
                      w-5 h-5 transition-colors
                      ${isActive
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-300'
                      }
                    `}>
                      {item.icon}
                    </span>
                    <span className="ml-1">{item.label}</span>

                    {/* Indicateur de page active (petit point en bas) */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* GROUPE DROITE : Mode Sombre/Clair + Boutons selon connexion */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">

            {/* Icône Mode Sombre/Clair */}
            <button
              onClick={toggleDarkMode}
              className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
              aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Séparateur */}
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden lg:block"></div>

            {/* Boutons selon l'état de connexion */}
            {currentUser ? (
              // Utilisateur connecté
              <div className="flex items-center space-x-3">
                {/* Icône du rôle */}
                <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  {userRole === 'student' ? (
                    <FaGraduationCap className="w-4 h-4" />
                  ) : (
                    <FaChalkboardTeacher className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">
                    {userRole === 'student' ? 'Étudiant' : 'Enseignant'}
                  </span>
                </div>

                {/* Bouton Mon Compte */}
                <button
                  onClick={handleMyAccount}
                  className={`
                    px-4 py-2 text-sm font-medium transition-all duration-300 border rounded-lg flex items-center space-x-2
                    ${isActiveLink('/etudashboard') || isActiveLink('/profdashboard')
                      ? 'text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30'
                      : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border-transparent hover:border-purple-200 dark:hover:border-purple-800'
                    }
                  `}
                >
                  <FaUser className="w-4 h-4" />
                  <span>Mon Compte</span>
                </button>

                {/* Bouton Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-md transform hover:scale-[1.02] flex items-center space-x-2"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            ) : (
              // Utilisateur non connecté
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className={`
                    px-4 py-2 text-sm font-medium transition-all duration-300 border rounded-lg flex items-center space-x-2
                    ${isActiveLink('/login')
                      ? 'text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30'
                      : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 border-transparent hover:border-purple-200 dark:hover:border-purple-800'
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Connexion</span>
                </Link>
                <Link
                  href="/register"
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md flex items-center space-x-2
                    ${isActiveLink('/register')
                      ? 'bg-purple-700 dark:bg-purple-600 text-white border border-purple-300 dark:border-purple-500'
                      : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white border-transparent hover:scale-[1.02]'
                    }
                  `}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Inscription</span>
                </Link>
              </div>
            )}
          </div>

          {/* Menu mobile */}
          <div className="lg:hidden flex items-center ml-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900">
              {navLinks.map((item) => {
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`
                      block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3 transition-all duration-300
                      ${isActive
                        ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-600'
                        : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                      }
                    `}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className={`
                      w-5 h-5
                      ${isActive
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-400 dark:text-gray-500'
                      }
                    `}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-2 h-2 bg-purple-600 rounded-full"></span>
                    )}
                  </Link>
                );
              })}

              <button
                onClick={toggleDarkMode}
                className="w-full text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3 transition-colors"
              >
                <span className="w-5 h-5 text-gray-400 dark:text-gray-500">
                  {isDarkMode ? (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </span>
                <span>{isDarkMode ? "Mode clair" : "Mode sombre"}</span>
              </button>

              {/* Section connexion/déconnexion mobile */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-2 space-y-2">
                {currentUser ? (
                  <>
                    {/* Info utilisateur mobile */}
                    <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-3">
                      {userRole === 'student' ? (
                        <FaGraduationCap className="w-4 h-4" />
                      ) : (
                        <FaChalkboardTeacher className="w-4 h-4" />
                      )}
                      <span>
                        {currentUser.firstName} {currentUser.lastName} ({userRole === 'student' ? 'Étudiant' : 'Enseignant'})
                      </span>
                    </div>

                    {/* Bouton Mon Compte mobile */}
                    <button
                      onClick={() => {
                        handleMyAccount();
                        setIsMenuOpen(false);
                      }}
                      className={`
                        w-full block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3 transition-all duration-300
                        ${isActiveLink('/etudashboard') || isActiveLink('/profdashboard')
                          ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-600'
                          : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                        }
                      `}
                    >
                      <FaUser className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <span>Mon Compte</span>
                    </button>

                    {/* Bouton Déconnexion mobile */}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors flex items-center space-x-3 justify-center"
                    >
                      <FaSignOutAlt className="w-5 h-5" />
                      <span>Déconnexion</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`
                        block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3 transition-all duration-300
                        ${isActiveLink('/login')
                          ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-600'
                          : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                        }
                      `}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Connexion</span>
                    </Link>
                    <Link
                      href="/register"
                      className={`
                        block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 flex items-center space-x-3 justify-center
                        ${isActiveLink('/register')
                          ? 'bg-purple-700 dark:bg-purple-600 text-white border border-purple-300 dark:border-purple-500'
                          : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white'
                        }
                      `}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Inscription</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;