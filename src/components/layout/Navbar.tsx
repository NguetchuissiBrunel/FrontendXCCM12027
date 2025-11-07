// src/components/layout/Navbar.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Icônes (simulées avec des SVGs Heroicons pour la cohérence)
const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const NotificationIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Accueil', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { href: '/library', label: 'Bibliothèque', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
    { href: '/editor', label: 'Éditer', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> },
    { href: '/help', label: 'Aide', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9.247a3.75 3.75 0 100-7.494 3.75 3.75 0 000 7.494zM16.5 13.5v6M13.5 16.5h6M3 21v-2c0-1.03.39-2.028 1.097-2.768A7 7 0 0112 15a7 7 0 017.903 3.232c.707.74 1.097 1.738 1.097 2.768v2H3z" /></svg> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-xl border-b border-gray-100">
      {/* Ajustement du padding latéral ici pour les grands écrans : lg:px-2 (8px de chaque côté) */}
      <div className="max-w-7xl mx-9 px-4 sm:px-4 lg:px-2"> 
        
        <div className="flex items-center justify-between h-16">
          
          {/* Conteneur G1 & G2 (Gauche) */}
          <div className="flex items-center ml-auto">

             {/* GROUPE 1: Logo, XC et Nom (Extrême Gauche) */}
            <Link href="/" className="flex-shrink-0 flex items-center space-x-2 mr-10 pr-6 border-r border-gray-200">
              
              {/* IMAGE LOGO */}
              <div className="w-12 h-12 flex items-center justify-center relative">
                  <Image 
                      src="/images/Capture.png" 
                      alt="Logo XCCM" 
                      width={100} 
                      height={100} 
                      className="rounded-full object-cover" 
                  />
              </div>
              
              {/* Bloc XC */}
              <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center mr-1 shadow-md">
                <span className="text-white font-extrabold text-sm">XC</span>
              </div>
              <span className="text-xl font-bold text-gray-800">XCCM</span>
            </Link>
            
            {/* GROUPE 2: Barre de recherche */}
           <div className="relative hidden lg:block flex-shrink-0">
              <input
                type="text"
                placeholder="Rechercher des cours..."
                className="pl-10 pr-4 py-2 border border-purple-300 bg-purple-50 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm w-80 transition-all shadow-inner placeholder-purple-400"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <SearchIcon className="w-5 h-5 text-purple-400" />
              </div>
            </div>

          </div>


          {/* Conteneur des Groupes 3 et 4 (Centre) */}
          <div className="hidden lg:flex items-center space-x-12">
            
            {/* GROUPE 3: Navigation Tabs (Accueil à Aide) - Séparé par bordure à droite */}
            <div className="flex items-center space-x-2">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-gray-700 hover:text-purple-700 px-4 py-2 rounded-full text-base font-medium transition-colors flex items-center space-x-1 group hover:bg-purple-50/50"
                >
                  <span className="w-5 h-5 text-purple-500 group-hover:text-purple-700 transition-colors">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            
            {/* Séparateur pour les icônes */}
            <div className="h-8 w-px bg-gray-200"></div>
            {/* GROUPE 4: Icônes (Notification et Paramètres) */}
            <div className="flex items-center space-x-6">
                
                {/* Icône cloche */}
                <button className="text-gray-600 hover:text-purple-600 p-2 rounded-full hover:bg-gray-100 transition-colors relative">
                    <NotificationIcon className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>

                {/* Icône de profil/paramètres */}
                <button className="text-gray-600 hover:text-purple-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
          </div>
          
          {/* GROUPE 5: Boutons Connexion et Inscription (Extrême Droite) */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0 border-l border-gray-200 pl-6 ml-6">
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

          {/* Menu mobile (G5 pour mobile) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-purple-600 focus:outline-none focus:text-purple-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant (inchangé) */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-purple-200">
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
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-2"
                >
                  <span className="w-5 h-5 text-gray-400">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link href="/login" className="text-gray-700 hover:text-purple-600 block px-3 py-2 rounded-md text-base font-medium border-t border-gray-100 mt-2">
                Connexion
              </Link>
              <Link href="/register" className="block text-center mt-2 bg-purple-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-purple-700 transition-colors">
                Inscription
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;