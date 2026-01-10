// components/RouteLoading.tsx
'use client';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RouteLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Détecter les clics sur les liens
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');

      if (link &&
        link.getAttribute('href') &&
        !link.getAttribute('href')?.startsWith('#') &&
        link.getAttribute('target') !== '_blank' &&
        !link.getAttribute('download') &&
        !link.classList.contains('no-loading') &&
        link.getAttribute('href')?.startsWith('/')
      ) {
        setIsLoading(true);
        setProgress(0);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Animation de progression réaliste
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        // Progression non-linéaire : rapide au début, lent à la fin
        let increment;
        if (prev < 30) {
          increment = 4; // Très rapide au début
        } else if (prev < 70) {
          increment = 2; // Moyen au milieu
        } else if (prev < 90) {
          increment = 1; // Lent vers la fin
        } else {
          increment = 0.5; // Très lent à la fin
        }

        const newProgress = Math.min(prev + increment, 99);

        // Ne pas dépasser 99% avant que la navigation soit terminée
        if (newProgress >= 99) {
          clearInterval(interval);
        }
        return newProgress;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Détection du changement d'URL (quand la navigation est terminée)
  useEffect(() => {
    if (isLoading) {
      // Quand l'URL change, on suppose que la navigation est terminée
      setProgress(100);

      // Petit délai pour laisser l'animation se terminer
      const timer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isLoading]);

  // S'assurer que le chargement s'arrête après un délai maximum (sécurité)
  useEffect(() => {
    if (isLoading) {
      const safetyTimer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 10000); // 10 secondes max

      return () => clearTimeout(safetyTimer);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  // Calcul pour la barre circulaire (SVG)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay flouté */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />

      {/* Contenu au centre */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Cercle de progression principal */}
        <div className="relative mb-8">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {/* Cercle de fond */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />

            {/* Cercle de progression */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-purple-600 transition-all duration-300 ease-out"
            />

            {/* Effet de brillance */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
              filter="url(#glow)"
            />
          </svg>

          {/* Pourcentage au centre */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800 dark:text-white">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Définition des gradients et effets SVG */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#EC4899" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>

              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>
        </div>

        {/* Texte avec animation */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white animate-pulse">
            Chargement en cours
          </h3>

          {/* Points animés */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          {/* Message subtil */}
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
            La patience est une vertu de l&apos;esprit...
          </p>
        </div>

        {/* Cercle externe animé */}
        <div className="absolute">
          <div className="w-48 h-48 border-4 border-purple-200/30 rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );
}