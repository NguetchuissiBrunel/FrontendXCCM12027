// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import RouteLoading from '@/components/ui/RouteLoading';
import { AuthProvider } from "@/contexts/AuthContext";
import './globals.css';


//const inter = Inter({ subsets: ['latin'] });
// <body className={inter.className}>
export const metadata: Metadata = {
  title: 'XCCM1 - Plateforme de création de contenu pédagogique',
  description: 'Créez, organisez et partagez vos contenus pédagogiques de manière intuitive avec XCCM1',
};

import { Suspense } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
     
      <body className="antialiased font-sans">
        <div className="min-h-screen flex flex-col">

          <main className="grow">
            <Suspense fallback={null}>
              <RouteLoading />
            </Suspense>
            <AuthProvider>
              {children}
            </AuthProvider>
          </main>

        </div>
      </body>
    </html>
  );
}
