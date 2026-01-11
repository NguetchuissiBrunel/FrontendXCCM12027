'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

export default function RouteLoading() {
  const { isLoading: contextLoading, stopLoading } = useLoading();
  const [internalLoading, setInternalLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false); // Fix Hydration
  
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeLoading = internalLoading || contextLoading;

  // 1. Gestion du montage et des clics
  useEffect(() => {
    setIsMounted(true);

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
        setInternalLoading(true);
        setProgress(0);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // 2. Animation de progression réaliste
  useEffect(() => {
    if (!activeLoading) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        let increment;
        if (prev < 30) increment = 4;
        else if (prev < 70) increment = 2;
        else if (prev < 90) increment = 1;
        else increment = 0.5;

        const newProgress = Math.min(prev + increment, 99);
        if (newProgress >= 99) clearInterval(interval);
        return newProgress;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [activeLoading]);

  // 3. Détection du changement d'URL
  useEffect(() => {
    if (internalLoading) {
      setInternalLoading(false);
    }
  }, [pathname, searchParams]); // Retrait de internalLoading des dépendances pour éviter des boucles

  // 4. Détection de fin de chargement globale
  useEffect(() => {
    if (!internalLoading && !contextLoading && progress > 0) {
      setProgress(100);
      const timer = setTimeout(() => {
        setProgress(0);
      }, 500); // Un peu plus de temps pour voir le 100%
      return () => clearTimeout(timer);
    }
  }, [internalLoading, contextLoading, progress]);

  // 5. Sécurité : timeout maximum
  useEffect(() => {
    if (activeLoading) {
      const safetyTimer = setTimeout(() => {
        setInternalLoading(false);
        stopLoading?.();
        setProgress(0);
      }, 15000);

      return () => clearTimeout(safetyTimer);
    }
  }, [activeLoading, stopLoading]);

  // --- LOGIQUE DE RENDU ---

  // Important: Ne rien rendre tant que le client n'a pas fini son premier rendu (isMounted)
  // pour correspondre exactement au HTML vide envoyé par le serveur.
  if (!isMounted || (!activeLoading && progress === 0)) return null;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className={`fixed inset-0 z-[60] transition-opacity duration-500 ${
        !activeLoading && progress === 100 ? 'opacity-0' : 'opacity-100'
      }`}
    >
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

          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
            La patience est une vertu de l&apos;esprit...
          </p>
        </div>

        <div className="absolute">
          <div className="w-48 h-48 border-4 border-purple-200/30 rounded-full animate-ping" />
        </div>
      </div>
    </div>
  );
}