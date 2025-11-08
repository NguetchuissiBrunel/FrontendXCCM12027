'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Icônes (inchangées)
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navLinks = [
    { href: '/', label: 'Accueil', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { href: '/library', label: 'Bibliothèque', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { href: '/editor', label: 'Éditer', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
    { href: '/help', label: 'Aide', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9.247a3.75 3.75 0 100-7.494 3.75 3.75 0 000 7.494zM16.5 13.5v6M13.5 16.5h6M3 21v-2c0-1.03.39-2.028 1.097-2.768A7 7 0 0112 15a7 7 0 017.903 3.232c.707.74 1.097 1.738 1.097 2.768v2H3z" /></svg> },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Ici vous pouvez ajouter la logique pour changer le thème de l'application
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-xl border-b border-gray-100">
      {/* Container principal avec padding réduit */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6"> 
        
        <div className="flex items-center justify-between h-16">
          
          {/* Partie Gauche : Logo + Recherche */}
          <div className="flex items-center flex-1">
            
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center space-x-2 mr-4 lg:mr-6">
              <div className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center relative">
                  <Image 
                      src="/images/Capture.png" 
                      alt="Logo XCCM" 
                      width={80} 
                      height={80} 
                      className="rounded-full object-cover" 
                  />
              </div>
              
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-xs">XC</span>
              </div>
              <span className="text-lg lg:text-xl font-bold text-gray-800 hidden sm:block">XCCM</span>
            </Link>
            
            {/* Barre de recherche - cachée sur mobile */}
            <div className="hidden lg:block flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher des cours..."
                  className="w-full pl-10 pr-4 py-2 border border-purple-300 bg-purple-50 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all shadow-inner placeholder-purple-400"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <SearchIcon className="w-4 h-4 text-purple-400" />
                </div>
              </div>
            </div>

          </div>

          {/* Partie Centre : Navigation */}
          <div className="hidden lg:flex items-center space-x-1 mx-4">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-700 hover:text-purple-700 px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 group hover:bg-purple-50/50"
              >
                <span className="w-4 h-4 text-purple-500 group-hover:text-purple-700 transition-colors">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Partie Droite : Mode Sombre/Clair + Boutons */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            
            {/* Icône Mode Sombre/Clair */}
            <button 
              onClick={toggleDarkMode}
              className="text-gray-600 hover:text-purple-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
            >
              {isDarkMode ? (
                // Icône Soleil (mode clair)
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                // Icône Lune (mode sombre)
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Séparateur */}
            <div className="h-6 w-px bg-gray-200 hidden lg:block"></div>

            {/* Boutons Connexion et Inscription */}
            <div className="flex items-center space-x-2">
              <Link href="/login" className="text-purple-600 hover:text-purple-700 px-3 py-2 text-sm font-medium transition-colors border border-transparent rounded-lg hover:border-purple-200">
                Connexion
              </Link>
              <Link
                href="/register"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-md transform hover:scale-[1.02]"
              >
                Inscription
              </Link>
            </div>
          </div>

          {/* Menu mobile */}
          <div className="lg:hidden flex items-center ml-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 focus:outline-none focus:text-purple-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              
              {/* Barre de recherche mobile */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-inner"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <SearchIcon className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Liens de navigation mobile */}
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="w-5 h-5 text-gray-400">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}

              {/* Mode sombre/clair mobile */}
              <button 
                onClick={toggleDarkMode}
                className="w-full text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
              >
                <span className="w-5 h-5 text-gray-400">
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

              {/* Boutons mobile */}
              <div className="border-t border-gray-100 pt-2 mt-2">
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link 
                  href="/register" 
                  className="block text-center mt-2 bg-purple-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-purple-700 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Inscription
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;