// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'XCCM1 - Plateforme de création de contenu pédagogique',
  description: 'Créez, organisez et partagez vos contenus pédagogiques de manière intuitive avec XCCM1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}