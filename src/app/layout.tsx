// src/app/layout.tsx
import type { Metadata } from 'next';
import RouteLoading from '@/components/ui/RouteLoading';
import { AuthProvider } from "@/contexts/AuthContext";
import './globals.css';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'XCCM1 - Plateforme de création de contenu pédagogique',
  description: 'Créez, organisez et partagez vos contenus pédagogiques de manière intuitive avec XCCM1',
};

// Force la version desktop sr mobile

export const viewport = {
	width: 1280, 
	initialScale:0.7,
};

// Force le rendu dynamique pour éviter que Next.js n'essaie de 
// pré-générer des pages nécessitant des données privées au build
export const dynamic = 'force-dynamic';

import { LoadingProvider } from "@/contexts/LoadingContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      {/* On utilise "font-sans" (configuré dans Tailwind) au lieu de Inter 
          pour éviter l'erreur de récupération Google Fonts (ETIMEDOUT)
      */}
      <body className="antialiased font-sans">
        <div className="min-h-screen flex flex-col">
          <main className="grow">
            <LoadingProvider>
              <Suspense fallback={null}>
                <RouteLoading />
              </Suspense>
              <AuthProvider>
                {children}
              </AuthProvider>
            </LoadingProvider>
            <Toaster position="top-right" />
          </main>
        </div>
      </body>
    </html>
  );
}
