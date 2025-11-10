// components/RouteLoading.tsx
'use client';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RouteLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Vérifier si c'est un lien Next.js ou une balise <a>
      const link = target.closest('a');
      const button = target.closest('button');
      
      // Ne déclencher le loading que pour les liens de navigation
      if (link && 
          link.getAttribute('href') && 
          !link.getAttribute('href')?.startsWith('#') &&
          link.getAttribute('target') !== '_blank' &&
          !link.classList.contains('no-loading') // option: classe pour exclure
      ) {
        setIsLoading(true);
      }
      
      // Option: aussi pour les boutons qui changent de page
      if (button && button.getAttribute('type') === 'submit') {
        setIsLoading(true);
      }
    };

    document.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    // Démarrer le loading quand la route change
    setIsLoading(true);
    
    // Arrêter le loading après un court délai
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 bg-opacity-90 backdrop-blur-sm">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Chargement...</p>
      </div>
    </div>
  );
}