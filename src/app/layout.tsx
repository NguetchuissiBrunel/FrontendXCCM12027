// src/app/layout.tsx
import type { Metadata } from 'next';
import RouteLoading from '@/components/ui/RouteLoading';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import { Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import FlottingCard from '@/components/assistantIa/FlottingCard';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'XCCM1 - Plateforme de création de contenu pédagogique',
  description: 'Créez, organisez et partagez vos contenus pédagogiques de manière intuitive avec XCCM1',
};

// Force la version desktop sr mobile

export const viewport = {
  width: 1280,
  initialScale: 0.7,
};

// Force le rendu dynamique pour éviter que Next.js n'essaie de 
// pré-générer des pages nécessitant des données privées au build
export const dynamic = 'force-dynamic';

import { LoadingProvider } from '@/contexts/LoadingContext';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="min-h-screen flex flex-col">
            <main className="grow">
              <LoadingProvider>
                <Suspense fallback={null}>
                  <RouteLoading />
                </Suspense>
                <AuthProvider>
                  {children}
                </AuthProvider>
                <FlottingCard />
              </LoadingProvider>
              <Toaster position="top-right" />
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
