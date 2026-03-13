'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/contexts/LoadingContext';

export default function RouteLoading() {
  const { isLoading: contextLoading, stopLoading } = useLoading();
  const [internalLoading, setInternalLoading] = useState(false);
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
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // 2. Détection du changement d'URL
  useEffect(() => {
    if (internalLoading) {
      setInternalLoading(false);
    }
  }, [pathname, searchParams]);


  // 3. Sécurité : timeout maximum
  useEffect(() => {
    if (activeLoading) {
      const safetyTimer = setTimeout(() => {
        setInternalLoading(false);
        stopLoading?.();
      }, 15000);

      return () => clearTimeout(safetyTimer);
    }
  }, [activeLoading, stopLoading]);

  // --- LOGIQUE DE RENDU ---

  if (!isMounted || !activeLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[60] transition-opacity duration-500 animate-in fade-in"
    >
      {/* Overlay flouté */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md" />

      {/* Contenu au centre */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {/* Spinner moderne */}
        <div className="relative mb-12">
          {/* Anneau de chargement principal */}
          <div className="w-24 h-24 border-4 border-purple-200 dark:border-purple-900/30 rounded-full" />
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />

          {/* Deuxième anneau pour un effet complexe */}
          <div className="absolute top-2 left-2 w-20 h-20 border-4 border-blue-500/20 rounded-full" />
          <div className="absolute top-2 left-2 w-20 h-20 border-4 border-blue-500 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />

          {/* Logo ou icône centrale (optionnel, ici un point pulsant) */}
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
    </div>
  );
}